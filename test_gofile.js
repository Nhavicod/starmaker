fetch("https://api.gofile.io/servers").then(res => res.json()).then(data => {
  const server = data.data.servers[0].name;
  const fd = new FormData();
  fd.append("file", new Blob(["test"]), "test.txt");
  fetch(`https://${server}.gofile.io/contents/uploadfile`, { method: "POST", body: fd })
    .then(r => r.json()).then(d => console.log(JSON.stringify(d, null, 2)));
});
