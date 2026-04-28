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

func ApplyForExhibition(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value("userID").(uint)
	userRole := r.Context().Value("role").(string)
	params := mux.Vars(r)
	exhibitionID, _ := strconv.Atoi(params["id"])

	if userRole != "artist" {
		http.Error(w, "Only artists can apply for exhibitions", http.StatusForbidden)
		return
	}

	var exhibition models.Exhibition
	if err := db.DB.First(&exhibition, exhibitionID).Error; err != nil {
		http.Error(w, "Exhibition not found", http.StatusNotFound)
		return
	}

	if exhibition.Status != "planned" && exhibition.Status != "active" {
		http.Error(w, "Cannot apply to finished exhibition", http.StatusBadRequest)
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

	var artwork models.Artwork
	if err := db.DB.Where("id = ? AND artist_id = ? AND status = ?", req.ArtworkID, userID, "published").First(&artwork).Error; err != nil {
		http.Error(w, "Artwork not found or not published", http.StatusBadRequest)
		return
	}

	var existing models.ExhibitionRequest
	if err := db.DB.Where("exhibition_id = ? AND artwork_id = ? AND status = ?",
		exhibitionID, req.ArtworkID, "pending").First(&existing).Error; err == nil {
		http.Error(w, "You already applied with this artwork", http.StatusConflict)
		return
	}

	exhibitionRequest := models.ExhibitionRequest{
		ExhibitionID:  uint(exhibitionID),
		ArtworkID:     req.ArtworkID,
		ArtistID:      userID,
		GalleryID:     exhibition.GalleryID,
		Status:        "pending",
		Message:       req.Message,
		ProposedPrice: req.ProposedPrice,
	}

	if err := db.DB.Create(&exhibitionRequest).Error; err != nil {
		http.Error(w, "Failed to create application", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"message": "Application submitted",
		"request": exhibitionRequest,
	})
}

func GetGalleryRequests(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value("userID").(uint)
	userRole := r.Context().Value("role").(string)

	if userRole != "gallery" {
		http.Error(w, "Only galleries can view requests", http.StatusForbidden)
		return
	}

	var requests []models.ExhibitionRequest
	db.DB.Preload("Exhibition").Preload("Artwork").Preload("Artwork.Artist").
		Where("gallery_id = ?", userID).
		Order("created_at DESC").
		Find(&requests)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(requests)
}

func RespondToApplication(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value("userID").(uint)
	userRole := r.Context().Value("role").(string)
	params := mux.Vars(r)
	requestID, _ := strconv.Atoi(params["id"])

	if userRole != "gallery" {
		http.Error(w, "Only galleries can respond to applications", http.StatusForbidden)
		return
	}

	var request models.ExhibitionRequest
	if err := db.DB.First(&request, requestID).Error; err != nil {
		http.Error(w, "Request not found", http.StatusNotFound)
		return
	}

	if request.GalleryID != userID {
		http.Error(w, "This is not your exhibition", http.StatusForbidden)
		return
	}

	if request.Status != "pending" {
		http.Error(w, "Request already processed", http.StatusBadRequest)
		return
	}

	var resp struct {
		Action string `json:"action"`
	}
	if err := json.NewDecoder(r.Body).Decode(&resp); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if resp.Action == "accept" {
		request.Status = "accepted"
		db.DB.Save(&request)

		exhibitionArtwork := models.ExhibitionArtwork{
			ExhibitionID: request.ExhibitionID,
			ArtworkID:    request.ArtworkID,
			AddedAt:      time.Now(),
		}
		db.DB.Create(&exhibitionArtwork)

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]interface{}{
			"message": "Заявка принята, картина добавлена на выставку",
		})
	} else if resp.Action == "reject" {
		request.Status = "rejected"
		db.DB.Save(&request)

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]interface{}{
			"message": "Заявка отклонена",
		})
	} else {
		http.Error(w, "Action must be 'accept' or 'reject'", http.StatusBadRequest)
		return
	}
}
func GetArtistApplications(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value("userID").(uint)
	userRole := r.Context().Value("role").(string)

	if userRole != "artist" {
		http.Error(w, "Only artists can view applications", http.StatusForbidden)
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
