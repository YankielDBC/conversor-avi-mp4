"use client";

import { useState, useRef, useCallback } from "react";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const ffmpegRef = useRef<FFmpeg | null>(null);

  const loadFFmpeg = async () => {
    const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd";
    const ffmpeg = new FFmpeg();
    
    ffmpeg.on("progress", ({ progress: p }) => {
      setProgress(Math.round(p * 100));
    });

    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
      wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
    });

    ffmpegRef.current = ffmpeg;
    return ffmpeg;
  };

  const handleFile = (selectedFile: File) => {
    if (!selectedFile.name.toLowerCase().endsWith(".avi")) {
      setStatus("❌ Por favor selecciona un archivo .avi");
      return;
    }
    setFile(selectedFile);
    setOutputUrl(null);
    setStatus("");
    setProgress(0);
  };

  const convert = async () => {
    if (!file) return;

    try {
      setStatus("⏳ Cargando FFmpeg...");
      setProgress(0);

      let ffmpeg = ffmpegRef.current;
      if (!ffmpeg) {
        ffmpeg = await loadFFmpeg();
      }

      setStatus("📂 Leyendo archivo...");
      await ffmpeg.writeFile("input.avi", await fetchFile(file));

      setStatus("🔄 Convirtiendo...");
      await ffmpeg.exec([
        "-i", "input.avi",
        "-c:v", "libx264",
        "-preset", "fast",
        "-crf", "28",
        "-vf", "scale='min(1280,iw)':-2",
        "-c:a", "aac",
        "-b:a", "128k",
        "-movflags", "+faststart",
        "output.mp4"
      ]);

      const data = await ffmpeg.readFile("output.mp4");
      const uint8 = new Uint8Array(data as Uint8Array | ArrayBuffer);
      const blob = new Blob([uint8], { type: "video/mp4" });
      const url = URL.createObjectURL(blob);

      setOutputUrl(url);
      setStatus("✅ ¡Convertido! Descarga o envía por WhatsApp");
      setProgress(100);

      await ffmpeg.deleteFile("input.avi");
      await ffmpeg.deleteFile("output.mp4");

    } catch (error) {
      setStatus("❌ Error: " + (error as Error).message);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const sendWhatsApp = () => {
    if (outputUrl) {
      window.open("https://web.whatsapp.com", "_blank");
    }
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) handleFile(droppedFile);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-700 to-green-900 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">🎬 AVI → MP4</h1>
          <p className="text-green-200">Conversor optimizado para WhatsApp</p>
        </div>

        <div className="bg-white/20 backdrop-blur-lg rounded-3xl p-6 shadow-2xl">
          <div
            className={`border-3 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${
              isDragging ? "border-green-400 bg-white/20" : "border-white/50"
            }`}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={onDrop}
            onClick={() => document.getElementById("fileInput")?.click()}
          >
            <input
              type="file"
              id="fileInput"
              accept=".avi,video/x-msvideo"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            />
            <div className="text-5xl mb-4">📁</div>
            <p className="text-white text-lg">Toca o arrastra un archivo .avi</p>
            <p className="text-green-200 text-sm mt-2">Soporta archivos AVI</p>
          </div>

          {file && (
            <div className="mt-4 bg-white/10 rounded-xl p-4">
              <p className="text-white font-medium truncate">{file.name}</p>
              <p className="text-green-200 text-sm">{formatSize(file.size)}</p>
              {file.size > 16 * 1024 * 1024 && (
                <p className="text-yellow-300 text-sm mt-2">⚠️ Mayor a 16MB (límite de WhatsApp)</p>
              )}
            </div>
          )}

          <button
            onClick={convert}
            disabled={!file}
            className="w-full mt-4 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl text-lg transition-all active:scale-95"
          >
            🔄 Convertir a MP4
          </button>

          {status && (
            <div className="mt-4 text-center">
              <p className="text-white">{status}</p>
              {progress > 0 && progress < 100 && (
                <div className="mt-2 bg-white/20 rounded-full h-3 overflow-hidden">
                  <div className="bg-green-400 h-full transition-all" style={{ width: `${progress}%` }} />
                </div>
              )}
            </div>
          )}

          {outputUrl && (
            <div className="mt-4 space-y-3">
              <a
                href={outputUrl}
                download={file?.name.replace(".avi", ".mp4") || "video.mp4"}
                className="block w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 rounded-xl text-center transition-all active:scale-95"
              >
                ⬇️ Descargar MP4
              </a>
              
              <button
                onClick={sendWhatsApp}
                className="w-full bg-[#25D366] hover:bg-[#20BD5A] text-white font-bold py-4 rounded-xl text-lg transition-all active:scale-95"
              >
                📱 Enviar por WhatsApp
              </button>
            </div>
          )}
        </div>

        <p className="text-center text-green-200 text-sm mt-6">
          Compatible con iOS y Android
        </p>
      </div>
    </div>
  );
}