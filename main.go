package main

import (
	"embed"
	"fmt"
	"io/fs"
	"net"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"runtime"
)

//go:embed all:web
var content embed.FS

func main() {
	webFS, err := fs.Sub(content, "web")
	if err != nil {
		panic(err)
	}

	mux := http.NewServeMux()
	mux.Handle("/", http.FileServer(http.FS(webFS)))

	listener, err := net.Listen("tcp", "localhost:0")
	if err != nil {
		panic(err)
	}

	addr := listener.Addr().String()
	url := "http://" + addr
	fmt.Printf("Keystroke Kingdom running at %s\n", url)

	writeURLFile(url)

	go openBrowser(url)

	if err := http.Serve(listener, mux); err != nil {
		panic(err)
	}
}

func writeURLFile(url string) {
	exe, err := os.Executable()
	if err != nil {
		exe = "."
	}
	dir := filepath.Dir(exe)
	path := filepath.Join(dir, ".dev-url")
	os.WriteFile(path, []byte(url), 0644)
}

func openBrowser(url string) {
	switch runtime.GOOS {
	case "darwin":
		exec.Command("open", url).Start()
	case "linux":
		exec.Command("xdg-open", url).Start()
	case "windows":
		exec.Command("rundll32", "url.dll,FileProtocolHandler", url).Start()
	}
}
