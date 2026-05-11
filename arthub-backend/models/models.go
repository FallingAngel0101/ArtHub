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
	Password string `gorm:"not null" json:"-"`
	Name     string `gorm:"size:100;not null" json:"name"`
	Role     string `gorm:"size:20;not null;default:'artist'" json:"role"`
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
	Status       string  `gorm:"size:20;default:'draft'" json:"status"`
	ImageURL     string  `gorm:"size:500" json:"image_url"`
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
	Status      string    `gorm:"size:20;default:'planned'" json:"status"`
}

type ExhibitionArtwork struct {
	ExhibitionID uint      `gorm:"primaryKey" json:"exhibition_id"`
	ArtworkID    uint      `gorm:"primaryKey" json:"artwork_id"`
	AddedAt      time.Time `json:"added_at"`
}

type HistoryLog struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	ArtworkID uint      `gorm:"not null;index" json:"artwork_id"`
	EventType string    `gorm:"size:50;not null" json:"event_type"`
	EventID   uint      `json:"event_id"`
	CreatedAt time.Time `json:"created_at"`
}

type Document struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`

	Type              string `gorm:"size:50;not null" json:"type"`
	Data              string `gorm:"type:json" json:"data"`
	SignedByArtist    bool   `gorm:"default:false" json:"signed_by_artist"`
	SignedByGallery   bool   `gorm:"default:false" json:"signed_by_gallery"`
	SignedByCollector bool   `gorm:"default:false" json:"signed_by_collector"`
	Status            string `gorm:"size:20;default:'draft'" json:"status"`
}
type ExhibitionRequest struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`

	ExhibitionID  uint       `gorm:"not null;index" json:"exhibition_id"`
	Exhibition    Exhibition `gorm:"foreignKey:ExhibitionID" json:"exhibition,omitempty"`
	ArtworkID     uint       `gorm:"not null;index" json:"artwork_id"`
	Artwork       Artwork    `gorm:"foreignKey:ArtworkID" json:"artwork,omitempty"`
	ArtistID      uint       `gorm:"not null;index" json:"artist_id"`
	GalleryID     uint       `gorm:"not null;index" json:"gallery_id"`
	Status        string     `gorm:"size:20;default:'pending'" json:"status"`
	Message       string     `gorm:"type:text" json:"message"`
	ProposedPrice float64    `json:"proposed_price"`
}

type Message struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	CreatedAt time.Time `json:"created_at"`

	RequestID uint              `gorm:"not null;index" json:"request_id"`
	Request   ExhibitionRequest `gorm:"foreignKey:RequestID" json:"-"`
	SenderID  uint              `gorm:"not null" json:"sender_id"`
	Text      string            `gorm:"type:text;not null" json:"text"`
}
