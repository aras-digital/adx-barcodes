import { BarcodeScanner } from './scanner.js';

document.addEventListener("DOMContentLoaded", function () {
    const elements = {};
    document.querySelectorAll('[id]').forEach(element => elements[element.id] = element);
    const scanner = new BarcodeScanner(elements);
    scanner.startStream();
});
