const
    el = {},
    usingOffscreenCanvas = isOffscreenCanvasWorking();

document
    .querySelectorAll('[id]')
    .forEach(element => el[element.id] = element)

let
    offCanvas,
    afterPreviousCallFinished,
    requestId = null;

el.usingOffscreenCanvas.innerText = usingOffscreenCanvas ? 'yes' : 'no'


function isOffscreenCanvasWorking() {
    try {
        return Boolean((new OffscreenCanvas(1, 1)).getContext('2d'))

    } catch {
        return false
    }
}


function formatNumber(number, fractionDigits = 1) {
    return number.toLocaleString(
        undefined, { minimumFractionDigits: fractionDigits, maximumFractionDigits: fractionDigits }
    )
}


function detect(source) {
    const afterFunctionCalled = performance.now(),
          canvas = el.canvas,
          ctx = canvas.getContext('2d');

    canvas.width = source.naturalWidth || source.videoWidth || source.width;
    canvas.height = source.naturalHeight || source.videoHeight || source.height;

    if (canvas.height && canvas.width) {
        const offCtx = getOffCtx2d(canvas.width, canvas.height) || ctx;

        offCtx.drawImage(source, 0, 0);

        const afterDrawImage = performance.now(),
              imageData = offCtx.getImageData(0, 0, canvas.width, canvas.height),
              afterGetImageData = performance.now();

        zbarWasm.scanImageData(imageData)
            .then(symbols => {
                const afterScanImageData = performance.now();

                if (symbols.length > 0) {
                    const barcodeData = symbols.map(symbol => `${symbol.typeName}: ${symbol.decode()}`).join(', ');
                    sendBarcodeData(barcodeData); // Taranan barkod verisini Angular uygulamasına gönder
                }

                updateUI(symbols, afterFunctionCalled, afterDrawImage, afterGetImageData, afterScanImageData, ctx); // UI güncelleme işlemleri
            }).catch(error => {
                console.error('Error scanning image data:', error);
                el.result.innerText = 'Error scanning barcode';
            });
    } else {
        el.result.innerText = 'Source not ready';
        el.timing.className = '';
        return Promise.resolve();
    }
}



function detectVideo(active) {
    if (active) {
        detect(el.video)
            .then(() => requestId = requestAnimationFrame(() => detectVideo(true)))

    } else {
        cancelAnimationFrame(requestId)
        requestId = null
    }
}

function startStream() {
    const videoElement = document.getElementById('video');
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
        .then(function(stream) {
            videoElement.srcObject = stream;
            videoElement.play();
            initBarcodeScanner(videoElement);
        })
        .catch(function(error) {
            console.error("Kamera erişimi sağlanamadı:", error);
        });
    } else {
        console.error("Bu tarayıcı medya cihazlarına erişimi desteklemiyor.");
    }
}

function initBarcodeScanner(video) {
    const zbar = new ZBarScanner({
        video: video,
        onDetected: function(result) {
            console.log("Taranan barkod:", result);
            alert('Barkod bulundu: ' + result);
            // Tarayıcıyı durdur ve gerekiyorsa başka işlemler yap
        }
    });
    zbar.start();
}

document.addEventListener("DOMContentLoaded", function () {
    startStream();
});
function stopStream() {
    cancelAnimationFrame(requestId)
    requestId = null;

}
function sendBarcodeData(barcodeData) {
    window.parent.postMessage({
      type: 'barcode',
      data: barcodeData
    }, '*'); 
  }