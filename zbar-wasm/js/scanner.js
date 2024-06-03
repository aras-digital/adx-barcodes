import { isOffscreenCanvasWorking, formatNumber } from './utils.js';

class BarcodeScanner {
    constructor(elements) {
        this.el = elements;
        this.offCanvas = null;
        this.requestId = null;
        this.afterPreviousCallFinished = null;
        this.usingOffscreenCanvas = isOffscreenCanvasWorking();
        this.el.usingOffscreenCanvas.innerText = this.usingOffscreenCanvas ? 'yes' : 'no';
    }

    getOffCtx2d(width, height) {
        if (this.usingOffscreenCanvas) {
            if (!this.offCanvas || this.offCanvas.width !== width || this.offCanvas.height !== height) {
                this.offCanvas = new OffscreenCanvas(width, height);
            }
            return this.offCanvas.getContext('2d');
        }
    }

    detect(source) {
        const afterFunctionCalled = performance.now();
        const { canvas } = this.el;
        const ctx = canvas.getContext('2d');
        canvas.width = source.naturalWidth || source.videoWidth || source.width;
        canvas.height = source.naturalHeight || source.videoHeight || source.height;

        if (canvas.height && canvas.width) {
            const offCtx = this.getOffCtx2d(canvas.width, canvas.height) || ctx;
            offCtx.drawImage(source, 0, 0);
            const afterDrawImage = performance.now();
            const imageData = offCtx.getImageData(0, 0, canvas.width, canvas.height);
            const afterGetImageData = performance.now();

            return zbarWasm.scanImageData(imageData)
                .then(symbols => this.handleScanResult(symbols, ctx, afterFunctionCalled, afterDrawImage, afterGetImageData))
                .catch(error => {
                    console.error('Error scanning image data:', error);
                    this.el.result.innerText = 'Error scanning barcode';
                });
        } else {
            this.el.result.innerText = 'Source not ready';
            this.el.timing.className = '';
            return Promise.resolve();
        }
    }

    handleScanResult(symbols, ctx, afterFunctionCalled, afterDrawImage, afterGetImageData) {
        const afterScanImageData = performance.now();
        symbols.forEach(symbol => {
            const lastPoint = symbol.points[symbol.points.length - 1];
            ctx.moveTo(lastPoint.x, lastPoint.y);
            symbol.points.forEach(point => ctx.lineTo(point.x, point.y));

            ctx.lineWidth = Math.max(Math.min(this.el.canvas.height, this.el.canvas.width) / 100, 1);
            ctx.strokeStyle = '#00e00060';
            ctx.stroke();
        });

        if (symbols.length > 0) {
            this.el.result.innerText = `${symbols[0].typeName} ${symbols[0].decode()}`;
            this.stopStream();
            setTimeout(() => {
                window.history.back();
            }, 500);
        } else {
            this.el.result.innerText = 'No barcode detected';
        }

        this.el.waitingTime.innerText = formatNumber(afterFunctionCalled - this.afterPreviousCallFinished);
        this.el.drawImageTime.innerText = formatNumber(afterDrawImage - afterFunctionCalled);
        this.el.getImageDataTime.innerText = formatNumber(afterGetImageData - afterDrawImage);
        this.el.scanImageDataTime.innerText = formatNumber(afterScanImageData - afterGetImageData);
        this.el.timing.className = 'visible';
        this.afterPreviousCallFinished = performance.now();
    }

    startStream() {
        if (!this.requestId) {
            navigator.mediaDevices.getUserMedia({
                audio: false, 
                video: {
                    facingMode: 'environment',
                    focusMode: "continuous",
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                }
            }).then(stream => {
                this.el.video.srcObject = stream;
                this.detectVideo(true);
            }).catch(error => {
                console.error('Error accessing media devices:', error);
                this.el.result.innerText = JSON.stringify(error);
                this.el.timing.className = '';
            });
        } else {
            this.detectVideo(false);
        }
    }

    detectVideo(active) {
        if (active) {
            this.detect(this.el.video)
                .then(() => this.requestId = requestAnimationFrame(() => this.detectVideo(true)));
        } else {
            cancelAnimationFrame(this.requestId);
            this.requestId = null;
        }
    }

    stopStream() {
        if (this.requestId) {
            cancelAnimationFrame(this.requestId);
            this.requestId = null;
        }
    }
}

export { BarcodeScanner };
