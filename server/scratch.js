require('dotenv').config({path: __dirname + "/../.env.local"})
require("./firebase")

const admin = require("firebase-admin")
const { getFirestore } = require("firebase-admin/firestore")
const bucket = admin.storage().bucket()
const firestore = getFirestore()

async function main() {
  const fetchImport = await import("node-fetch")
  const fetch = fetchImport.default
  
  const result = await new Promise(async (resolve, reject) => {
    const blob = bucket.file(`scratch/${Date.now()}.jpg`);
    const blobStream = blob.createWriteStream({ resumable: false });
    
    const testImg = await fetch("https://http.cat/200.jpg")
    const pipedStream = testImg.body.pipe(blobStream)

    pipedStream.on('finish', function () {
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
      resolve(publicUrl);
    }).on('error', function (err) {
      reject(err);
    })
  })

  console.log("RESULT:", result)
}

main()