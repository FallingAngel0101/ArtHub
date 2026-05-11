package db

import (
	"fmt"
	"log"
	"os"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"

	"arthub-backend/models"
)

var DB *gorm.DB

func InitDB() {
	host := getEnv("DB_HOST", "localhost")
	user := getEnv("DB_USER", "postgres")
	password := getEnv("DB_PASSWORD", "postgres")
	dbname := getEnv("DB_NAME", "arthub")
	port := getEnv("DB_PORT", "5432")

	dsn := fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s sslmode=disable TimeZone=Europe/Moscow",
		host, user, password, dbname, port)

	var err error
	DB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	})

	if err != nil {
		log.Fatal("❌ Failed to connect to database:", err)
	}

	log.Println("✅ Connected to PostgreSQL")

	err = DB.AutoMigrate(
		&models.User{},
		&models.Artwork{},
		&models.Exhibition{},
		&models.ExhibitionArtwork{},
		&models.ExhibitionRequest{},
		&models.HistoryLog{},
		&models.Document{},
		&models.Message{},
	)
	if err != nil {
		log.Fatal("❌ Migration failed:", err)
	}

	log.Println("✅ Tables migrated")
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
