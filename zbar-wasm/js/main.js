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
    const
        afterFunctionCalled = performance.now(),
        canvas = el.canvas,
        ctx = canvas.getContext('2d');

    function getOffCtx2d(width, height) {
        if (usingOffscreenCanvas) {
            if (!offCanvas || (offCanvas.width !== width) || (offCanvas.height !== height)) {
                // Only resizing the canvas caused Chromium to become progressively slower
                offCanvas = new OffscreenCanvas(width, height)
            }

            return offCanvas.getContext('2d')
        }
    }

    canvas.width = source.naturalWidth || source.videoWidth || source.width
    canvas.height = source.naturalHeight || source.videoHeight || source.height

    if (canvas.height && canvas.width) {
        const offCtx = getOffCtx2d(canvas.width, canvas.height) || ctx

        offCtx.drawImage(source, 0, 0)

        const
            afterDrawImage = performance.now(),
            imageData = offCtx.getImageData(0, 0, canvas.width, canvas.height),
            afterGetImageData = performance.now();

        return zbarWasm
            .scanImageData(imageData)
            .then(symbols => {
                const afterScanImageData = performance.now()

                symbols.forEach(symbol => {
                    const lastPoint = symbol.points[symbol.points.length - 1]
                    ctx.moveTo(lastPoint.x, lastPoint.y)
                    symbol.points.forEach(point => ctx.lineTo(point.x, point.y))

                    ctx.lineWidth = Math.max(Math.min(canvas.height, canvas.width) / 100, 1)
                    ctx.strokeStyle = '#00e00060'
                    ctx.stroke()
                })

                // el.result.innerText = JSON.stringify(symbols, null, 2)
                if (symbols[0]?.typeName) {
                    alert(symbols[0]?.decode())
                    stopStream()
                    setTimeout(()=>{
                        window.history.go(-1);
                    }, 500);
                }


                el.result.innerText = symbols[0]?.typeName + " " + symbols[0]?.decode()

                el.waitingTime.innerText = formatNumber(afterFunctionCalled - afterPreviousCallFinished)
                el.drawImageTime.innerText = formatNumber(afterDrawImage - afterFunctionCalled)
                el.getImageDataTime.innerText = formatNumber(afterGetImageData - afterDrawImage)
                el.scanImageDataTime.innerText = formatNumber(afterScanImageData - afterGetImageData)
                el.timing.className = 'visible'

                afterPreviousCallFinished = performance.now()
            })

    } else {
        el.result.innerText = 'Source not ready'
        el.timing.className = ''

        return Promise.resolve()
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
    if (!requestId) {
        navigator.mediaDevices.getUserMedia({
            audio: false, video: {
                facingMode: 'environment', focusMode: "continuous", width: { ideal: 1280 },
                height: { ideal: 720 },
            }
        })
            .then(stream => {
                el.video.srcObject = stream
                detectVideo(true)
            })
            .catch(error => {
                el.result.innerText = JSON.stringify(error)
                el.timing.className = ''
            })

    } else {
        detectVideo(false)
    }
}

document.addEventListener("DOMContentLoaded", function (event) {

    startStream()
});
function stopStream() {
    cancelAnimationFrame(requestId)
    requestId = null;

}
// window.addEventListener('resize', () => {

// });