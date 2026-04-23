package models

import (
	"time"

	"gorm.io/gorm"
)

type User struct {
	ID        uint           `gorm:"primaryKey" json:"id"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`

	Email    string `gorm:"uniqueIndex;size:100;not null" json:"email"`
	Password string `gorm:"not null" json:"-"` // никогда не отдаем пароль
	Name     string `gorm:"size:100;not null" json:"name"`
	Role     string `gorm:"size:20;not null;default:'artist'" json:"role"` // artist, gallery, collector, visitor
}

type Artwork struct {
	ID        uint           `gorm:"primaryKey" json:"id"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`

	ArtistID     uint    `gorm:"not null;index" json:"artist_id"`
	Artist       User    `gorm:"foreignKey:ArtistID" json:"artist,omitempty"`
	Title        string  `gorm:"size:200;not null" json:"title"`
	Description  string  `gorm:"type:text" json:"description"`
	Technique    string  `gorm:"size:100" json:"technique"`
	Year         int     `json:"year"`
	Width        float64 `json:"width"`
	Height       float64 `json:"height"`
	BasePrice    float64 `gorm:"not null" json:"base_price"`
	CurrentPrice float64 `json:"current_price"`
	Status       string  `gorm:"size:20;default:'draft'" json:"status"` // draft, published, sold, rented
	ImageURL     string  `gorm:"size:500" json:"image_url"`             // пока заглушка
}

type Exhibition struct {
	ID        uint           `gorm:"primaryKey" json:"id"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`

	GalleryID   uint      `gorm:"not null;index" json:"gallery_id"`
	Gallery     User      `gorm:"foreignKey:GalleryID" json:"gallery,omitempty"`
	Title       string    `gorm:"size:200;not null" json:"title"`
	Description string    `gorm:"type:text" json:"description"`
	StartDate   time.Time `json:"start_date"`
	EndDate     time.Time `json:"end_date"`
	Location    string    `gorm:"size:300" json:"location"`
	Status      string    `gorm:"size:20;default:'planned'" json:"status"` // planned, active, finished
}

type ExhibitionArtwork struct {
	ExhibitionID uint      `gorm:"primaryKey" json:"exhibition_id"`
	ArtworkID    uint      `gorm:"primaryKey" json:"artwork_id"`
	AddedAt      time.Time `json:"added_at"`
}

type HistoryLog struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	ArtworkID uint      `gorm:"not null;index" json:"artwork_id"`
	EventType string    `gorm:"size:50;not null" json:"event_type"` // exhibition, sale
	EventID   uint      `json:"event_id"`                           // id выставки или сделки
	CreatedAt time.Time `json:"created_at"`
}

type Document struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`

	Type              string `gorm:"size:50;not null" json:"type"` // contract, act, invoice
	Data              string `gorm:"type:json" json:"data"`        // JSON с данными документа
	SignedByArtist    bool   `gorm:"default:false" json:"signed_by_artist"`
	SignedByGallery   bool   `gorm:"default:false" json:"signed_by_gallery"`
	SignedByCollector bool   `gorm:"default:false" json:"signed_by_collector"`
	Status            string `gorm:"size:20;default:'draft'" json:"status"` // draft, signed, archived
}
type ExhibitionRequest struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	CreatedAt time.Time `json:"created_at"`
	UpdateAt  time.Time `json:"update_at"`

	ExhibitionID uint       `gorm:"not null;index" json:"exhibition_id"`
	Exhibition   Exhibition `gorm:"foreignKey:ExhibitionID" json:"exhibition,omitempty"`
	ArtworkID    uint       `gorm:"not null;index" json:"artwork_id"`
	Artwork      Artwork    `gorm:"foreignKey:ArtworkID" json:"artwork,omitempty"`
	ArtistID     uint       `gorm:"not null;index" json:"artist_id"`

	GalleryID uint `gorm:"not null;index" json:"gallery_id"`

	Status string `gorm:"size:20;default:'pending'" json:"status"`

	Message string `gorm:"type:text" json:"message"`

	ProposedPrice float64 `json:"proposed_price"`
}
