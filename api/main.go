package api

import (
	"net/http"
)

func ServeEntryPoint(w http.ResponseWriter, r *http.Request) {
	http.ServeFile(w, r, "public/index.html")
}
