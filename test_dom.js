const fs = require('fs');
const { JSDOM } = require('jsdom');

const html = fs.readFileSync('index.html', 'utf8');
const dom = new JSDOM(html, { runScripts: "dangerously" });
const window = dom.window;

window.onerror = function(message, source, lineno, colno, error) {
    console.log('JS Error:', message, 'at line', lineno);
};

// Fire loaded event
window.document.dispatchEvent(new window.Event('DOMContentLoaded'));

setTimeout(() => {
    console.log("Check btn-open-admin:", window.document.getElementById('btn-open-admin') ? 'Exists' : 'Null');
    console.log("Check modal:", window.document.getElementById('admin-modal') ? 'Exists' : 'Null');
}, 1000);
