# 🔍 Adx Barcodes

Adx barcode scanning web application

## 🛠️ Usage


### Static Html

```html
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>Parent Page</title>
    </head>
    <body>
        <h1>Ana Sayfa</h1>
        <iframe src="zbar-wasm/index.html" style="width: 600px; height: 400px;"></iframe>
        <script>
            window.addEventListener('message', (event) => {
                alert(`İframe'den gelen mesaj: ${event.data.value}`);
            }, false);
        </script>
    </body>
    </html>

```
---
# 🚀 Demo
[https://aras-digital.github.io/adx-barcodes/](https://aras-digital.github.io/adx-barcodes/)
# 🧪 Test
[https://aras-digital.github.io/adx-barcodes/test.html](https://aras-digital.github.io/adx-barcodes/test.html)
