const fs = require('fs');
fs.writeFileSync('test.txt', 'hello gofile');
fetch("https://api.gofile.io/servers").then(res => res.json()).then(data => {
  const server = data.data.servers[0].name;
  const fd = new FormData();
  const fileData = fs.readFileSync('test.txt');
  fd.append("file", new Blob([fileData]), "test.txt");
  fd.append("token", "LBRXKRTeYjMsKssLNP2ndcCb6SUi3rBP");
  fetch(`https://${server}.gofile.io/contents/uploadfile`, { method: "POST", body: fd })
    .then(r => r.json()).then(d => console.log(JSON.stringify(d, null, 2)));
});
