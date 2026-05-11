package handlers

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"strconv"
	"time"

	"github.com/gorilla/mux"
	"github.com/jung-kurt/gofpdf"

	"arthub-backend/db"
	"arthub-backend/models"
)

// GenerateSaleContract — GET /api/documents/sale/{artwork_id} (договор купли-продажи)
func GenerateSaleContract(w http.ResponseWriter, r *http.Request) {
	params := mux.Vars(r)
	artworkID, _ := strconv.Atoi(params["artwork_id"])

	var artwork models.Artwork
	if err := db.DB.Preload("Artist").First(&artwork, artworkID).Error; err != nil {
		http.Error(w, "Artwork not found", http.StatusNotFound)
		return
	}

	pdf := gofpdf.New("P", "mm", "A4", "")
	pdf.AddPage()

	// Шрифт
	pdf.AddFont("Arial", "", "arial.json")
	pdf.AddFont("Arial", "B", "arial_bold.json")

	// Заголовок
	pdf.SetFont("Arial", "B", 18)
	pdf.Cell(190, 10, "ДОГОВОР КУПЛИ-ПРОДАЖИ ПРОИЗВЕДЕНИЯ ИСКУССТВА")
	pdf.Ln(15)

	// Номер договора
	pdf.SetFont("Arial", "", 12)
	pdf.Cell(190, 8, fmt.Sprintf("№ АРТ-%d от %s", artwork.ID, time.Now().Format("02.01.2006")))
	pdf.Ln(12)

	// Стороны
	pdf.SetFont("Arial", "B", 14)
	pdf.Cell(190, 8, "1. СТОРОНЫ ДОГОВОРА")
	pdf.Ln(10)

	pdf.SetFont("Arial", "", 12)
	pdf.MultiCell(190, 6, fmt.Sprintf(
		"Продавец: Художник %s, действующий через платформу ArtHub.\n"+
			"Покупатель: Коллекционер, зарегистрированный на платформе ArtHub.\n"+
			"Галерея-посредник: Галерея, через которую осуществляется сделка.",
		artwork.Artist.Name,
	), "", "L", false)
	pdf.Ln(8)

	// Предмет договора
	pdf.SetFont("Arial", "B", 14)
	pdf.Cell(190, 8, "2. ПРЕДМЕТ ДОГОВОРА")
	pdf.Ln(10)

	pdf.SetFont("Arial", "", 12)
	pdf.MultiCell(190, 6, fmt.Sprintf(
		"Продавец передаёт в собственность Покупателя произведение искусства:\n"+
			"Название: %s\n"+
			"Техника: %s\n"+
			"Год создания: %d\n"+
			"Размеры: %.1f x %.1f см",
		artwork.Title, artwork.Technique, artwork.Year, artwork.Width, artwork.Height,
	), "", "L", false)
	pdf.Ln(8)

	// Цена
	pdf.SetFont("Arial", "B", 14)
	pdf.Cell(190, 8, "3. ЦЕНА ДОГОВОРА")
	pdf.Ln(10)

	pdf.SetFont("Arial", "", 12)
	pdf.MultiCell(190, 6, fmt.Sprintf(
		"Стоимость произведения составляет %.2f рублей.\n"+
			"Цена является окончательной и изменению не подлежит.",
		artwork.CurrentPrice,
	), "", "L", false)
	pdf.Ln(8)

	// Подписи
	pdf.SetFont("Arial", "B", 14)
	pdf.Cell(190, 8, "4. ПОДПИСИ СТОРОН")
	pdf.Ln(15)

	pdf.SetFont("Arial", "", 12)
	pdf.Cell(90, 8, "Продавец: _______________")
	pdf.Cell(90, 8, "Покупатель: _______________")
	pdf.Ln(12)

	pdf.Cell(90, 8, "(подпись)")
	pdf.Cell(90, 8, "(подпись)")
	pdf.Ln(15)

	// Плашка ЭДО
	pdf.SetFont("Arial", "", 10)
	pdf.SetTextColor(100, 100, 100)
	pdf.Cell(190, 6, fmt.Sprintf("Документ сгенерирован платформой ArtHub %s", time.Now().Format("02.01.2006 15:04")))
	pdf.Ln(6)
	pdf.Cell(190, 6, "Подписан квалифицированной электронной подписью (КЭП)")

	// Сохраняем PDF
	fileName := fmt.Sprintf("sale_contract_%d_%d.pdf", artworkID, time.Now().Unix())
	filePath := fmt.Sprintf("uploads/%s", fileName)
	pdf.OutputFileAndClose(filePath)

	// Создаём запись в БД
	document := models.Document{
		Type:              "contract_sale",
		Data:              fmt.Sprintf(`{"file":"%s","artwork_id":%d,"date":"%s"}`, fileName, artworkID, time.Now().Format("2006-01-02")),
		Status:            "draft",
		SignedByArtist:    false,
		SignedByGallery:   false,
		SignedByCollector: false,
	}
	db.DB.Create(&document)

	json.NewEncoder(w).Encode(map[string]interface{}{
		"url":         fmt.Sprintf("/uploads/%s", fileName),
		"document_id": document.ID,
	})
}

// GenerateRentContract — GET /api/documents/rent/{request_id} (договор аренды на выставку)
func GenerateRentContract(w http.ResponseWriter, r *http.Request) {
	params := mux.Vars(r)
	requestID, _ := strconv.Atoi(params["request_id"])

	var request models.ExhibitionRequest
	if err := db.DB.Preload("Artwork").Preload("Exhibition").Preload("Artwork.Artist").First(&request, requestID).Error; err != nil {
		http.Error(w, "Request not found", http.StatusNotFound)
		return
	}

	pdf := gofpdf.New("P", "mm", "A4", "")
	pdf.AddPage()

	pdf.SetFont("Arial", "B", 18)
	pdf.Cell(190, 10, "ДОГОВОР АРЕНДЫ ПРОИЗВЕДЕНИЯ ИСКУССТВА")
	pdf.Ln(15)

	pdf.SetFont("Arial", "", 12)
	pdf.Cell(190, 8, fmt.Sprintf("№ АРТ-АР-%d от %s", requestID, time.Now().Format("02.01.2006")))
	pdf.Ln(12)

	pdf.SetFont("Arial", "B", 14)
	pdf.Cell(190, 8, "1. СТОРОНЫ ДОГОВОРА")
	pdf.Ln(10)

	pdf.SetFont("Arial", "", 12)
	pdf.MultiCell(190, 6, fmt.Sprintf(
		"Арендодатель: Художник %s\n"+
			"Арендатор: Галерея\n"+
			"Произведение: %s\n"+
			"Выставка: %s\n"+
			"Период аренды: с %s по %s",
		request.Artwork.Artist.Name,
		request.Artwork.Title,
		request.Exhibition.Title,
		request.Exhibition.StartDate.Format("02.01.2006"),
		request.Exhibition.EndDate.Format("02.01.2006"),
	), "", "L", false)
	pdf.Ln(8)

	pdf.SetFont("Arial", "B", 14)
	pdf.Cell(190, 8, "2. СТОИМОСТЬ АРЕНДЫ")
	pdf.Ln(10)

	pdf.SetFont("Arial", "", 12)
	pdf.MultiCell(190, 6, fmt.Sprintf(
		"Стоимость аренды составляет %.2f рублей за весь период.",
		request.ProposedPrice,
	), "", "L", false)
	pdf.Ln(8)

	pdf.SetFont("Arial", "B", 14)
	pdf.Cell(190, 8, "3. ПОДПИСИ СТОРОН")
	pdf.Ln(15)

	pdf.SetFont("Arial", "", 12)
	pdf.Cell(90, 8, "Арендодатель: _______________")
	pdf.Cell(90, 8, "Арендатор: _______________")
	pdf.Ln(12)

	pdf.Cell(90, 8, "(КЭП)")
	pdf.Cell(90, 8, "(КЭП)")
	pdf.Ln(15)

	pdf.SetFont("Arial", "", 10)
	pdf.SetTextColor(100, 100, 100)
	pdf.Cell(190, 6, fmt.Sprintf("Документ сгенерирован платформой ArtHub %s", time.Now().Format("02.01.2006 15:04")))
	pdf.Ln(6)
	pdf.Cell(190, 6, "Подписан квалифицированной электронной подписью (КЭП)")

	fileName := fmt.Sprintf("rent_contract_%d_%d.pdf", requestID, time.Now().Unix())
	filePath := fmt.Sprintf("uploads/%s", fileName)
	pdf.OutputFileAndClose(filePath)

	document := models.Document{
		Type:   "contract_rent",
		Data:   fmt.Sprintf(`{"file":"%s","request_id":%d,"date":"%s"}`, fileName, requestID, time.Now().Format("2006-01-02")),
		Status: "draft",
	}
	db.DB.Create(&document)

	json.NewEncoder(w).Encode(map[string]interface{}{
		"url":         fmt.Sprintf("/uploads/%s", fileName),
		"document_id": document.ID,
	})
}

// DownloadDocument — GET /api/documents/{id}/download (скачать PDF)
func DownloadDocument(w http.ResponseWriter, r *http.Request) {
	params := mux.Vars(r)
	docID, _ := strconv.Atoi(params["docID"])

	var document models.Document
	if err := db.DB.First(&document, docID).Error; err != nil {
		http.Error(w, "Document not found", http.StatusNotFound)
		return
	}

	var data map[string]interface{}
	json.Unmarshal([]byte(document.Data), &data)
	fileName, _ := data["file"].(string)
	filePath := fmt.Sprintf("uploads/%s", fileName)

	file, err := os.Open(filePath)
	if err != nil {
		http.Error(w, "File not found", http.StatusNotFound)
		return
	}
	defer file.Close()

	w.Header().Set("Content-Type", "application/pdf")
	w.Header().Set("Content-Disposition", fmt.Sprintf("attachment; filename=%s", fileName))
	io.Copy(w, file)
}
