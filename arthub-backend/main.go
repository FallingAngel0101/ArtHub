package main

import (
	"log"
	"net/http"

	"github.com/gorilla/mux"
	"github.com/rs/cors"

	"arthub-backend/db"
	"arthub-backend/handlers"
	"arthub-backend/middleware"
)

func main() {
	db.InitDB()

	r := mux.NewRouter()

	// ==================== ПУБЛИЧНЫЕ РОУТЫ (без авторизации) ====================

	// Авторизация
	r.HandleFunc("/api/register", handlers.Register).Methods("POST")
	r.HandleFunc("/api/login", handlers.Login).Methods("POST")

	// Каталог картин (публичный)
	r.HandleFunc("/api/artworks", handlers.GetArtworks).Methods("GET")
	r.HandleFunc("/api/artworks/{id}", handlers.GetArtwork).Methods("GET")

	// Выставки (публичные)
	r.HandleFunc("/api/exhibitions", handlers.GetExhibitions).Methods("GET")
	r.HandleFunc("/api/exhibitions/{id}", handlers.GetExhibition).Methods("GET")

	// Раздача статических файлов (загруженных изображений)
	r.PathPrefix("/uploads/").Handler(http.StripPrefix("/uploads/", http.FileServer(http.Dir("uploads"))))

	// ==================== ЗАЩИЩЁННЫЕ РОУТЫ (требуют JWT токен) ====================
	api := r.PathPrefix("/api").Subrouter()
	api.Use(middleware.AuthMiddleware)

	// Профиль
	api.HandleFunc("/me", handlers.GetMe).Methods("GET")

	// Мои картины (для художника, включая черновики)
	api.HandleFunc("/my-artworks", handlers.GetMyArtworks).Methods("GET")

	// Документы и ЭДО
	api.HandleFunc("/documents/sale/{artwork_id}", handlers.GenerateSaleContract).Methods("POST")
	api.HandleFunc("/documents/rent/{request_id}", handlers.GenerateRentContract).Methods("POST")
	api.HandleFunc("/documents/{id}/sign", handlers.SignDocument).Methods("POST")
	api.HandleFunc("/documents/{id}/download", handlers.DownloadDocument).Methods("GET")

	// Картины (создание/редактирование/удаление)
	api.HandleFunc("/artworks", handlers.CreateArtwork).Methods("POST")
	api.HandleFunc("/artworks/{id}", handlers.UpdateArtwork).Methods("PUT")
	api.HandleFunc("/artworks/{id}", handlers.DeleteArtwork).Methods("DELETE")
	api.HandleFunc("/artworks/{id}/publish", handlers.PublishArtwork).Methods("POST")

	// Заявки на выставку
	api.HandleFunc("/exhibitions/{id}/apply", handlers.ApplyForExhibition).Methods("POST")          // Художник подаёт заявку
	api.HandleFunc("/gallery/requests", handlers.GetGalleryRequests).Methods("GET")                 // Галерея видит заявки
	api.HandleFunc("/gallery/requests/{id}/respond", handlers.RespondToApplication).Methods("POST") // Галерея отвечает
	api.HandleFunc("/my-applications", handlers.GetArtistApplications).Methods("GET")               // Художник видит свои заявки             // Художник отвечает
	// Выставки (управление)
	api.HandleFunc("/exhibitions", handlers.CreateExhibition).Methods("POST")                                         // Создать (только галерея)
	api.HandleFunc("/exhibitions/{id}", handlers.UpdateExhibition).Methods("PUT")                                     // Обновить (только владелец)
	api.HandleFunc("/exhibitions/{id}", handlers.DeleteExhibition).Methods("DELETE")                                  // Удалить (только владелец)
	api.HandleFunc("/exhibitions/{id}/artworks", handlers.AddArtworkToExhibition).Methods("POST")                     // Добавить картину на выставку
	api.HandleFunc("/exhibitions/{id}/artworks/{artwork_id}", handlers.RemoveArtworkFromExhibition).Methods("DELETE") // Убрать картину

	// Загрузка изображений
	api.HandleFunc("/upload", handlers.UploadImage).Methods("POST")
	// Продажи и ЭДО
	api.HandleFunc("/buy", handlers.BuyArtwork).Methods("POST")                   // Купить картину (только коллекционер)
	api.HandleFunc("/purchases", handlers.GetMyPurchases).Methods("GET")          // История покупок (коллекционер)
	api.HandleFunc("/documents/{id}/sign", handlers.SignDocument).Methods("POST") // Подписать документ (имитация КЭП)

	// Чат в заявках
	api.HandleFunc("/requests/{id}/messages", handlers.GetMessages).Methods("GET")
	api.HandleFunc("/requests/{id}/messages", handlers.SendMessage).Methods("POST")
	// ==================== CORS ====================
	c := cors.New(cors.Options{
		AllowedOrigins:   []string{"http://localhost:3000", "http://localhost:5173"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Authorization", "Content-Type"},
		AllowCredentials: true,
	})

	handler := c.Handler(r)

	log.Println("🚀 ArtHub server started on :8080")
	log.Fatal(http.ListenAndServe(":8080", handler))
}
