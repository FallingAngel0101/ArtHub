package handlers

import (
	"arthub-backend/db"
	"arthub-backend/models"
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/gorilla/mux"
)

type SaleRequest struct {
	ArtworkID uint `json:"artwork_id"`
}

// BuyArtwork — POST /api/buy (покупка картины коллекционером)
func BuyArtwork(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value("userID").(uint)
	userRole := r.Context().Value("role").(string)

	if userRole != "collector" {
		http.Error(w, "Only collectors can buy artworks", http.StatusForbidden)
		return
	}

	var req SaleRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Находим картину
	var artwork models.Artwork
	if err := db.DB.First(&artwork, req.ArtworkID).Error; err != nil {
		http.Error(w, "Artwork not found", http.StatusNotFound)
		return
	}

	if artwork.Status != "published" {
		http.Error(w, "Artwork is not available for sale", http.StatusBadRequest)
		return
	}

	// Пересчитываем актуальную цену
	artwork.CurrentPrice = CalculateCurrentPrice(artwork.ID)

	// Создаём документ-заглушку (ЭДО)
	document := models.Document{
		Type:   "contract_sale",
		Data:   `{"artwork_id": ` + strconv.Itoa(int(artwork.ID)) + `, "buyer_id": ` + strconv.Itoa(int(userID)) + `, "price": ` + strconv.FormatFloat(artwork.CurrentPrice, 'f', 2, 64) + `}`,
		Status: "draft",
	}
	db.DB.Create(&document)

	// Меняем статус картины
	artwork.Status = "sold"
	db.DB.Save(&artwork)

	// Записываем в историю
	historyLog := models.HistoryLog{
		ArtworkID: artwork.ID,
		EventType: "sale",
		EventID:   document.ID,
	}
	db.DB.Create(&historyLog)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"message":     "Purchase successful",
		"artwork":     artwork,
		"document_id": document.ID,
		"final_price": artwork.CurrentPrice,
	})
}

// GetMyPurchases — GET /api/purchases (история покупок коллекционера)
func GetMyPurchases(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value("userID").(uint)
	userRole := r.Context().Value("role").(string)

	if userRole != "collector" {
		http.Error(w, "Only collectors can view purchases", http.StatusForbidden)
		return
	}

	var documents []models.Document
	db.DB.Where("type = ? AND data LIKE ?", "contract_sale", "%\"buyer_id\": "+strconv.Itoa(int(userID))+"%").
		Find(&documents)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(documents)
}

// SignDocument — POST /api/documents/{id}/sign (имитация КЭП)
func SignDocument(w http.ResponseWriter, r *http.Request) {
	userRole := r.Context().Value("role").(string)
	params := mux.Vars(r)
	docID, _ := strconv.Atoi(params["id"])

	var document models.Document
	if err := db.DB.First(&document, docID).Error; err != nil {
		http.Error(w, "Document not found", http.StatusNotFound)
		return
	}

	// Имитация подписи в зависимости от роли
	switch userRole {
	case "artist":
		document.SignedByArtist = true
	case "gallery":
		document.SignedByGallery = true
	case "collector":
		document.SignedByCollector = true
	}

	// Если все подписали — меняем статус
	if document.SignedByArtist && document.SignedByGallery && document.SignedByCollector {
		document.Status = "signed"
	}

	db.DB.Save(&document)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"message":  "Document signed (simulation)",
		"document": document,
	})
}
