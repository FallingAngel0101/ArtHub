package handlers

import (
	"arthub-backend/db"
	"arthub-backend/models"
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/gorilla/mux"
)

func CalculateCurrentPrice(artworkID uint) float64 {
	var artwork models.Artwork
	db.DB.First(&artwork, artworkID)

	var exhibitionCount int64
	db.DB.Model(&models.ExhibitionArtwork{}).
		Where("artwork_id = ?", artworkID).
		Count(&exhibitionCount)

	var saleCount int64
	db.DB.Model(&models.HistoryLog{}).
		Where("artwork_id = ? AND event_type = ?", artworkID, "sale").
		Count(&saleCount)

	multiplier := 1.0 + (float64(exhibitionCount) * 0.02) + (float64(saleCount) * 0.05)
	return artwork.BasePrice * multiplier
}

func CreateArtwork(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value("userID").(uint)
	userRole := r.Context().Value("role").(string)

	if userRole != "artist" {
		http.Error(w, "Only artists can create artworks", http.StatusForbidden)
		return
	}

	var artwork models.Artwork
	if err := json.NewDecoder(r.Body).Decode(&artwork); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	artwork.ArtistID = userID
	artwork.CurrentPrice = artwork.BasePrice
	artwork.Status = "draft"

	if err := db.DB.Create(&artwork).Error; err != nil {
		http.Error(w, "Failed to create artwork", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(artwork)
}

func GetArtworks(w http.ResponseWriter, r *http.Request) {
	var artworks []models.Artwork

	query := db.DB.Preload("Artist").Where("status = ?", "published")

	if artistID := r.URL.Query().Get("artist_id"); artistID != "" {
		query = query.Where("artist_id = ?", artistID)
	}

	if minPrice := r.URL.Query().Get("min_price"); minPrice != "" {
		query = query.Where("base_price >= ?", minPrice)
	}

	if maxPrice := r.URL.Query().Get("max_price"); maxPrice != "" {
		query = query.Where("base_price <= ?", maxPrice)
	}

	query.Find(&artworks)

	for i := range artworks {
		artworks[i].CurrentPrice = CalculateCurrentPrice(artworks[i].ID)
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(artworks)
}

func GetArtwork(w http.ResponseWriter, r *http.Request) {
	params := mux.Vars(r)
	id, _ := strconv.Atoi(params["id"])

	var artwork models.Artwork
	if err := db.DB.Preload("Artist").First(&artwork, id).Error; err != nil {
		http.Error(w, "Artwork not found", http.StatusNotFound)
		return
	}

	artwork.CurrentPrice = CalculateCurrentPrice(artwork.ID)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(artwork)
}

func UpdateArtwork(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value("userID").(uint)
	params := mux.Vars(r)
	id, _ := strconv.Atoi(params["id"])

	var artwork models.Artwork
	if err := db.DB.First(&artwork, id).Error; err != nil {
		http.Error(w, "Artwork not found", http.StatusNotFound)
		return
	}

	if artwork.ArtistID != userID {
		http.Error(w, "You can only edit your own artworks", http.StatusForbidden)
		return
	}

	var updates models.Artwork
	if err := json.NewDecoder(r.Body).Decode(&updates); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Обновляем только НЕ-ПУСТЫЕ поля
	updatesMap := map[string]interface{}{}

	if updates.Title != "" {
		updatesMap["title"] = updates.Title
	}
	if updates.Description != "" {
		updatesMap["description"] = updates.Description
	}
	if updates.Technique != "" {
		updatesMap["technique"] = updates.Technique
	}
	if updates.Year != 0 {
		updatesMap["year"] = updates.Year
	}
	if updates.Width != 0 {
		updatesMap["width"] = updates.Width
	}
	if updates.Height != 0 {
		updatesMap["height"] = updates.Height
	}
	if updates.BasePrice != 0 {
		updatesMap["base_price"] = updates.BasePrice
	}
	if updates.ImageURL != "" {
		updatesMap["image_url"] = updates.ImageURL
	}
	// ВАЖНО: статус обновляем ТОЛЬКО если он явно передан
	if updates.Status != "" {
		updatesMap["status"] = updates.Status
	}

	db.DB.Model(&artwork).Updates(updatesMap)

	artwork.CurrentPrice = CalculateCurrentPrice(artwork.ID)
	db.DB.Model(&artwork).Update("current_price", artwork.CurrentPrice)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(artwork)
}

func DeleteArtwork(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value("userID").(uint)
	params := mux.Vars(r)
	id, _ := strconv.Atoi(params["id"])

	var artwork models.Artwork
	if err := db.DB.First(&artwork, id).Error; err != nil {
		http.Error(w, "Artwork not found", http.StatusNotFound)
		return
	}
	if artwork.ArtistID != userID {
		http.Error(w, "You can only delete yuor own artworks", http.StatusForbidden)
		return
	}

	db.DB.Delete(&artwork)
	w.WriteHeader(http.StatusNoContent)
}

func PublishArtwork(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value("userID").(uint)
	params := mux.Vars(r)
	id, _ := strconv.Atoi(params["id"])

	var artwork models.Artwork
	if err := db.DB.First(&artwork, id).Error; err != nil {
		http.Error(w, "Artwork not Found", http.StatusNotFound)
		return
	}

	if artwork.ArtistID != userID {
		http.Error(w, "You can only publish your own artworks", http.StatusForbidden)
		return
	}

	artwork.Status = "published"
	artwork.CurrentPrice = CalculateCurrentPrice(artwork.ID)
	db.DB.Save(&artwork)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(artwork)
}

func GetMyArtworks(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value("userID").(uint)
	userRole := r.Context().Value("role").(string)

	if userRole != "artist" {
		http.Error(w, "Only artists can access this endopoint", http.StatusForbidden)
		return
	}

	var artworks []models.Artwork
	db.DB.Preload("Artist").Where("artist_id = ?", userID).Find(&artworks)

	for i := range artworks {
		artworks[i].CurrentPrice = CalculateCurrentPrice(artworks[i].ID)
	}

	w.Header().Set("Context-Type", "application/json")
	json.NewEncoder(w).Encode(artworks)
}
