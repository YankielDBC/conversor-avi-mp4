# Conversor AVI → MP4 para WhatsApp

Conversor web que funciona en celular, tablet y PC. Convierte videos AVI a MP4 optimizados para enviar por WhatsApp.

## 🚀 Desplegar en Vercel

1. **Sube este proyecto a GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/TU_USUARIO/conversor-app.git
   git push -u origin main
   ```

2. **Conecta con Vercel**
   - Ve a [vercel.com](https://vercel.com)
   - Importa el repositorio de GitHub
   - Deploy automático

3. **Listo** - Obtén tu URL (ej: `conversor-app.vercel.app`) y accédela desde cualquier dispositivo.

## 📱 Características

- ✅ Funciona en iOS y Android
- ✅ Arrastra o selecciona archivos AVI
- ✅ Conversión con FFmpeg WASM (en el navegador)
- ✅ Descarga MP4 o envía por WhatsApp
- ✅ Alerta si el archivo supera 16MB (límite de WhatsApp)
- ✅ Diseño responsive y moderno

## ⚠️ Limitaciones

- Requiere conexión a internet
- Archivos muy grandes pueden fallar por límite de memoria del navegador
- La primera conversión tarda más (carga de FFmpeg)

## 🛠️ Desarrollo local

```bash
npm install
npm run dev
```

Luego abre `http://localhost:3000`