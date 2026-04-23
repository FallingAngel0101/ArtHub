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

// CreateExhibition — POST /api/exhibitions (только для gallery)
func CreateExhibition(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value("userID").(uint)
	userRole := r.Context().Value("role").(string)

	if userRole != "gallery" {
		http.Error(w, "Only galleries can create exhibitions", http.StatusForbidden)
		return
	}

	var exhibition models.Exhibition
	if err := json.NewDecoder(r.Body).Decode(&exhibition); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	exhibition.GalleryID = userID
	exhibition.Status = "planned"

	if err := db.DB.Create(&exhibition).Error; err != nil {
		http.Error(w, "Failed to create exhibition", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(exhibition)
}

// GetExhibitions — GET /api/exhibitions (публичный)
func GetExhibitions(w http.ResponseWriter, r *http.Request) {
	var exhibitions []models.Exhibition

	query := db.DB.Preload("Gallery")

	// Фильтр по статусу
	if status := r.URL.Query().Get("status"); status != "" {
		query = query.Where("status = ?", status)
	}

	// Фильтр по галерее
	if galleryID := r.URL.Query().Get("gallery_id"); galleryID != "" {
		query = query.Where("gallery_id = ?", galleryID)
	}

	query.Order("start_date ASC").Find(&exhibitions)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(exhibitions)
}

// GetExhibition — GET /api/exhibitions/{id}
func GetExhibition(w http.ResponseWriter, r *http.Request) {
	params := mux.Vars(r)
	id, _ := strconv.Atoi(params["id"])

	var exhibition models.Exhibition
	if err := db.DB.Preload("Gallery").First(&exhibition, id).Error; err != nil {
		http.Error(w, "Exhibition not found", http.StatusNotFound)
		return
	}

	// Получаем картины на выставке
	var artworks []models.Artwork
	db.DB.Table("artworks").
		Joins("JOIN exhibition_artworks ON exhibition_artworks.artwork_id = artworks.id").
		Where("exhibition_artworks.exhibition_id = ?", id).
		Preload("Artist").
		Find(&artworks)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"exhibition": exhibition,
		"artworks":   artworks,
	})
}

// UpdateExhibition — PUT /api/exhibitions/{id}
func UpdateExhibition(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value("userID").(uint)
	params := mux.Vars(r)
	id, _ := strconv.Atoi(params["id"])

	var exhibition models.Exhibition
	if err := db.DB.First(&exhibition, id).Error; err != nil {
		http.Error(w, "Exhibition not found", http.StatusNotFound)
		return
	}

	if exhibition.GalleryID != userID {
		http.Error(w, "You can only edit your own exhibitions", http.StatusForbidden)
		return
	}

	var updates models.Exhibition
	if err := json.NewDecoder(r.Body).Decode(&updates); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	updatesMap := map[string]interface{}{}
	if updates.Title != "" {
		updatesMap["title"] = updates.Title
	}
	if updates.Description != "" {
		updatesMap["description"] = updates.Description
	}
	if !updates.StartDate.IsZero() {
		updatesMap["start_date"] = updates.StartDate
	}
	if !updates.EndDate.IsZero() {
		updatesMap["end_date"] = updates.EndDate
	}
	if updates.Location != "" {
		updatesMap["location"] = updates.Location
	}
	if updates.Status != "" {
		updatesMap["status"] = updates.Status

		// Если выставка завершена — фиксируем в истории картин
		if updates.Status == "finished" {
			var exhibitionArtworks []models.ExhibitionArtwork
			db.DB.Where("exhibition_id = ?", id).Find(&exhibitionArtworks)
			for _, ea := range exhibitionArtworks {
				historyLog := models.HistoryLog{
					ArtworkID: ea.ArtworkID,
					EventType: "exhibition",
					EventID:   uint(id),
				}
				db.DB.Create(&historyLog)
			}
		}
	}

	db.DB.Model(&exhibition).Updates(updatesMap)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(exhibition)
}

// DeleteExhibition — DELETE /api/exhibitions/{id}
func DeleteExhibition(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value("userID").(uint)
	params := mux.Vars(r)
	id, _ := strconv.Atoi(params["id"])

	var exhibition models.Exhibition
	if err := db.DB.First(&exhibition, id).Error; err != nil {
		http.Error(w, "Exhibition not found", http.StatusNotFound)
		return
	}

	if exhibition.GalleryID != userID {
		http.Error(w, "You can only delete your own exhibitions", http.StatusForbidden)
		return
	}

	db.DB.Delete(&exhibition)
	w.WriteHeader(http.StatusNoContent)
}

// AddArtworkToExhibition — POST /api/exhibitions/{id}/artworks
func AddArtworkToExhibition(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value("userID").(uint)
	params := mux.Vars(r)
	exhibitionID, _ := strconv.Atoi(params["id"])

	var exhibition models.Exhibition
	if err := db.DB.First(&exhibition, exhibitionID).Error; err != nil {
		http.Error(w, "Exhibition not found", http.StatusNotFound)
		return
	}

	if exhibition.GalleryID != userID {
		http.Error(w, "Only gallery owner can add artworks", http.StatusForbidden)
		return
	}

	var req struct {
		ArtworkID uint `json:"artwork_id"`
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

	exhibitionArtwork := models.ExhibitionArtwork{
		ExhibitionID: uint(exhibitionID),
		ArtworkID:    req.ArtworkID,
		AddedAt:      time.Now(),
	}

	if err := db.DB.Create(&exhibitionArtwork).Error; err != nil {
		http.Error(w, "Artwork already in exhibition", http.StatusConflict)
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(exhibitionArtwork)
}

// RemoveArtworkFromExhibition — DELETE /api/exhibitions/{id}/artworks/{artwork_id}
func RemoveArtworkFromExhibition(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value("userID").(uint)
	params := mux.Vars(r)
	exhibitionID, _ := strconv.Atoi(params["id"])
	artworkID, _ := strconv.Atoi(params["artwork_id"])

	var exhibition models.Exhibition
	if err := db.DB.First(&exhibition, exhibitionID).Error; err != nil {
		http.Error(w, "Exhibition not found", http.StatusNotFound)
		return
	}

	if exhibition.GalleryID != userID {
		http.Error(w, "Only gallery owner can remove artworks", http.StatusForbidden)
		return
	}

	db.DB.Where("exhibition_id = ? AND artwork_id = ?", exhibitionID, artworkID).
		Delete(&models.ExhibitionArtwork{})

	w.WriteHeader(http.StatusNoContent)
}
