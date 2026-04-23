package handlers

import (
	"arthub-backend/db"
	"arthub-backend/models"
	"encoding/json"
	"net/http"
	"strconv"
	"time"

	"github.com/gorilla/mux"
)

// RequestArtworkForExhibition — POST /api/exhibitions/{id}/request (галерея запрашивает картину)
func RequestArtworkForExhibition(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value("userID").(uint)
	userRole := r.Context().Value("role").(string)
	params := mux.Vars(r)
	exhibitionID, _ := strconv.Atoi(params["id"])

	if userRole != "gallery" {
		http.Error(w, "Only galleries can request artworks", http.StatusForbidden)
		return
	}

	// Проверяем что выставка существует и принадлежит этой галерее
	var exhibition models.Exhibition
	if err := db.DB.First(&exhibition, exhibitionID).Error; err != nil {
		http.Error(w, "Exhibition not found", http.StatusNotFound)
		return
	}
	if exhibition.GalleryID != userID {
		http.Error(w, "This is not your exhibition", http.StatusForbidden)
		return
	}

	var req struct {
		ArtworkID     uint    `json:"artwork_id"`
		Message       string  `json:"message"`
		ProposedPrice float64 `json:"proposed_price"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Проверяем что картина существует и опубликована
	var artwork models.Artwork
	if err := db.DB.Where("id = ? AND status = ?", req.ArtworkID, "published").First(&artwork).Error; err != nil {
		http.Error(w, "Artwork not found or not published", http.StatusBadRequest)
		return
	}

	// Проверяем что запрос ещё не существует
	var existing models.ExhibitionRequest
	if err := db.DB.Where("exhibition_id = ? AND artwork_id = ? AND status = ?",
		exhibitionID, req.ArtworkID, "pending").First(&existing).Error; err == nil {
		http.Error(w, "Request already exists", http.StatusConflict)
		return
	}

	exhibitionRequest := models.ExhibitionRequest{
		ExhibitionID:  uint(exhibitionID),
		ArtworkID:     req.ArtworkID,
		ArtistID:      artwork.ArtistID,
		GalleryID:     userID,
		Status:        "pending",
		Message:       req.Message,
		ProposedPrice: req.ProposedPrice,
	}

	if err := db.DB.Create(&exhibitionRequest).Error; err != nil {
		http.Error(w, "Failed to create request", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(exhibitionRequest)
}

// GetMyRequests — GET /api/requests (художник видит входящие запросы)
func GetMyRequests(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value("userID").(uint)
	userRole := r.Context().Value("role").(string)

	if userRole != "artist" {
		http.Error(w, "Only artists can view requests", http.StatusForbidden)
		return
	}

	var requests []models.ExhibitionRequest
	db.DB.Preload("Exhibition").Preload("Artwork").
		Where("artist_id = ?", userID).
		Order("created_at DESC").
		Find(&requests)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(requests)
}

// RespondToRequest — POST /api/requests/{id}/respond (художник принимает/отклоняет)
func RespondToRequest(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value("userID").(uint)
	userRole := r.Context().Value("role").(string)
	params := mux.Vars(r)
	requestID, _ := strconv.Atoi(params["id"])

	if userRole != "artist" {
		http.Error(w, "Only artists can respond to requests", http.StatusForbidden)
		return
	}

	var request models.ExhibitionRequest
	if err := db.DB.First(&request, requestID).Error; err != nil {
		http.Error(w, "Request not found", http.StatusNotFound)
		return
	}

	if request.ArtistID != userID {
		http.Error(w, "This is not your request", http.StatusForbidden)
		return
	}

	if request.Status != "pending" {
		http.Error(w, "Request already processed", http.StatusBadRequest)
		return
	}

	var resp struct {
		Action string `json:"action"` // "accept" или "reject"
	}
	if err := json.NewDecoder(r.Body).Decode(&resp); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if resp.Action == "accept" {
		request.Status = "accepted"
		db.DB.Save(&request)

		// Добавляем картину на выставку
		exhibitionArtwork := models.ExhibitionArtwork{
			ExhibitionID: request.ExhibitionID,
			ArtworkID:    request.ArtworkID,
			AddedAt:      time.Now(),
		}
		db.DB.Create(&exhibitionArtwork)

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]interface{}{
			"message": "Запрос принят, картина добавлена на выставку",
		})
	} else if resp.Action == "reject" {
		request.Status = "rejected"
		db.DB.Save(&request)

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]interface{}{
			"message": "Запрос отклонён",
		})
	} else {
		http.Error(w, "Action must be 'accept' or 'reject'", http.StatusBadRequest)
		return
	}
}
