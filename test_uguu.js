import fs from 'fs';
fs.writeFileSync('test.txt', 'hello uguu');

async function testUpload() {
    try {
        const formData = new FormData();
        const blob = new Blob([fs.readFileSync('test.txt')]);
        formData.append("files[]", blob, 'test.txt');

        const uploadRes = await fetch(`https://uguu.se/upload`, {
            method: "POST",
            body: formData
        });
        
        const data = await uploadRes.json();
        console.log("Response:", JSON.stringify(data, null, 2));
    } catch(err) {
        console.error(err);
    }
}
testUpload();
