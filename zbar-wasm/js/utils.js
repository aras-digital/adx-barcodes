export function isOffscreenCanvasWorking() {
    try {
        return Boolean(new OffscreenCanvas(1, 1).getContext('2d'));
    } catch {
        return false;
    }
}

export function formatNumber(number, fractionDigits = 1) {
    return number.toLocaleString(undefined, { 
        minimumFractionDigits: fractionDigits, 
        maximumFractionDigits: fractionDigits 
    });
}
