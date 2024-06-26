package api

import (
	"encoding/csv"
	"encoding/json"
	"fmt"
	"math"
	"mime/multipart"
	"net/http"
	"strconv"
	"sync"
	"time"
)

type Result struct {
	Id   int              `json:"id"`
	Data []map[string]any `json:"data"`
}

func processFile(file *multipart.FileHeader, fileStruct *Result) error {
	src, err := file.Open()
	var output []map[string]any

	if err != nil {
		return err
	}

	defer src.Close()

	reader := csv.NewReader(src)
	cols, err := reader.Read()
	rows, err := reader.ReadAll()

	if err != nil {
		return err
	}

	colIdx := make(map[int]string)

	for idx, col := range cols {
		colIdx[idx] = col
	}

	for _, row := range rows {
		temp := make(map[string]any)

		for idx, data := range row {
			temp[colIdx[idx]] = data
		}

		output = append(output, temp)
	}

	fileStruct.Data = output
	return nil
}

func UploadFile(w http.ResponseWriter, r *http.Request) {
	start := time.Now()
	err := r.ParseMultipartForm(1000 << 20)
	var wg sync.WaitGroup
	var mutex sync.Mutex
	var data []Result

	if err != nil {
		http.Error(w, "Unable to parse!", http.StatusBadRequest)
		return
	}

	strIds := r.Form["fileIds[]"]
	var fileIds []int

	for _, id := range strIds {
		intId, err := strconv.Atoi(id)

		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
		}

		fileIds = append(fileIds, intId)
	}

	wg.Add(len(strIds))

	for _, files := range r.MultipartForm.File {
		for idx, file := range files {
			go func(file *multipart.FileHeader, fileId int) {
				defer wg.Done()

				result := &Result{Id: fileId}
				err := processFile(file, result)

				if err != nil {
					fileErr := fmt.Sprintf("File procees error for %s!", file.Filename)
					http.Error(w, fileErr, http.StatusBadRequest)
				}

				mutex.Lock()
				data = append(data, *result)
				mutex.Unlock()
			}(file, fileIds[idx])
		}
	}

	wg.Wait()
	seconds := math.Round(time.Since(start).Seconds()*100) / 100
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]any{"duration": seconds, "data": data})
}
