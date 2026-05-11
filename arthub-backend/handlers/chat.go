package handlers

import (
	"arthub-backend/db"
	"arthub-backend/models"
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/gorilla/mux"
)

func SendMessage(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value("userID").(uint)
	params := mux.Vars(r)
	requestID, _ := strconv.Atoi(params["id"])

	var req struct {
		Text string `json:"text"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil || req.Text == "" {
		http.Error(w, "Пустое сообщение", http.StatusBadRequest)
		return
	}

	var request models.ExhibitionRequest
	if err := db.DB.First(&request, requestID).Error; err != nil {
		http.Error(w, "Заявка не найдена", http.StatusNotFound)
		return
	}

	if request.ArtistID != userID && request.GalleryID != userID {
		http.Error(w, "Вы не участник этой выставки", http.StatusForbidden)
		return
	}

	msg := models.Message{
		RequestID: uint(requestID),
		SenderID:  userID,
		Text:      req.Text,
	}
	db.DB.Create(&msg)

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(msg)
}

func GetMessages(w http.ResponseWriter, r *http.Request) {
	params := mux.Vars(r)
	requestID, _ := strconv.Atoi(params["id"])

	var messages []models.Message
	db.DB.Where("request_id = ?", requestID).Order("created_at ASC").Find(&messages)

	json.NewEncoder(w).Encode(messages)
}
