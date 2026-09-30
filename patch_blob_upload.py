import re

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# 1. Add the import
html = html.replace('import { getAuth, signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";', 'import { getAuth, signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";\n    import { upload } from "@vercel/blob/client";')

# 2. Add the uploadToBlob function
blob_func = """
    async function uploadToBlob(file) {
      const newBlob = await upload(file.name, file, {
        access: 'public',
        handleUploadUrl: '/api/upload',
      });
      return newBlob.url;
    }
"""
html = html.replace('async function uploadToGoFile(file) {', blob_func + '\n    async function uploadToGoFile(file) {')

# 3. Change bg1, videoUrl, and registroVideo to use uploadToBlob
# For PNG background:
old_png = r"""const url = await uploadToGoFile\(file\);\s*await setDoc\(stateDocRef, \{ bg1: url, bg2: url \}, \{ merge: true \}\);"""
new_png = """const url = await uploadToBlob(file);
          await setDoc(stateDocRef, { bg1: url, bg2: url }, { merge: true });"""
html = re.sub(old_png, new_png, html)

# For Video Holografico:
old_vid = r"""const url = await uploadToGoFile\(file\);\s*await setDoc\(stateDocRef, \{ videoUrl: url \}, \{ merge: true \}\);"""
new_vid = """const url = await uploadToBlob(file);
          await setDoc(stateDocRef, { videoUrl: url }, { merge: true });"""
html = re.sub(old_vid, new_vid, html)

# For Registro Video:
old_reg_vid = r"""const url = await uploadToGoFile\(file\);\s*await setDoc\(stateDocRef, \{ registroVideo: url \}, \{ merge: true \}\);"""
new_reg_vid = """const url = await uploadToBlob(file);
          await setDoc(stateDocRef, { registroVideo: url }, { merge: true });"""
html = re.sub(old_reg_vid, new_reg_vid, html)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)
