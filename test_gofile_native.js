import fs from 'fs';
fs.writeFileSync('test.txt', 'hello gofile');

async function testUpload() {
    try {
        const res = await fetch("https://api.gofile.io/servers");
        const srvData = await res.json();
        const server = srvData.data.servers[0].name;

        const formData = new FormData();
        const blob = new Blob([fs.readFileSync('test.txt')]);
        formData.append("file", blob, 'test.txt');
        formData.append("token", "LBRXKRTeYjMsKssLNP2ndcCb6SUi3rBP");

        const uploadRes = await fetch(`https://${server}.gofile.io/contents/uploadfile`, {
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
