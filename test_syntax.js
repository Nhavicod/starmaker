const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
const scriptMatches = html.match(/<script type="module">([\s\S]*?)<\/script>/);
if (scriptMatches) {
    fs.writeFileSync('script_to_test.js', scriptMatches[1]);
    console.log("Extracted module script.");
}
