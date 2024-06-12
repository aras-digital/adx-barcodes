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
        <iframe src="https://aras-digital.github.io/adx-barcodes/zbar-wasm/index.html" style="width: 600px; height: 400px;"></iframe>
        <script>
            window.addEventListener('message', (event) => {
                    alert(`Message from iframe: ${event.data.value}`);
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


## License Notice

This application incorporates open source software components: ZXing-js, Quagga-js, and ZBar.

- **ZXing-js** is licensed under the Apache License 2.0. You can access the ZXing-js source code at [ZXing-js source code](https://github.com/zxing-js/library).
- **Quagga-js** is distributed under the MIT License. The source code for Quagga-js is available at [Quagga-js source code](https://github.com/serratus/quaggaJS).
- **ZBar** is licensed under the GNU Lesser General Public License (LGPL) Version 2.1. You can find the source code of ZBar at [ZBar source code](https://github.com/mchehab/zbar).
