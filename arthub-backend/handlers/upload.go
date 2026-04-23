package handlers

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"github.com/google/uuid"
)

func UploadImage(w http.ResponseWriter, r *http.Request) {
	r.ParseMultipartForm(10 << 20)

	file, handler, err := r.FormFile("image")
	if err != nil {
		http.Error(w, "Failed to read file", http.StatusBadRequest)
		return
	}
	defer file.Close()

	ext := strings.ToLower(filepath.Ext(handler.Filename))
	allowesExts := map[string]bool{".jpg": true, ".jpeg": true, ".png": true, ".webp": true, "gif": true}

	if !allowesExts[ext] {
		http.Error(w, "Invalid file type. Allowed: jpg, jpeg, png, webp, gif", http.StatusBadRequest)
		return
	}

	newFileName := uuid.New().String() + ext
	filePath := filepath.Join("uploads", newFileName)

	dst, err := os.Create(filePath)
	if err != nil {
		http.Error(w, "Failed to create file", http.StatusInternalServerError)
		return
	}
	defer dst.Close()

	if _, err := io.Copy(dst, file); err != nil {
		http.Error(w, "Failed to save file", http.StatusInternalServerError)
		return
	}

	imageURL := fmt.Sprintf("http://localhost:8080/uploads/%s", newFileName)

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]string{
		"url":      imageURL,
		"filename": newFileName,
	})
}
