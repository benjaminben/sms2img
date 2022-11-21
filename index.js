require('dotenv').config()
const fs = require("fs")
const fetch = require("node-fetch")
const admin = require("firebase-admin")
const serviceAccount = require("./sa.json")
const { Configuration, OpenAIApi } = require("openai")
const express = require('express')
const configuration = new Configuration({
  apiKey: process.env.OPENAI_SK
})
const openai = new OpenAIApi(configuration)
const app = express()
app.use(express.json())
app.use(express.urlencoded())

fs.mkdirSync("./output", {recursive: true})

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "thumpdiffusion.appspot.com",
})

const bucket = admin.storage().bucket()

const generateImage = async (p) => {
  try {
    const genResponse = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_SK}`,
      },
      body: JSON.stringify({
        prompt: p,
        n: 1,
        size: "1024x1024",
      })
    })
    const genJson = await genResponse.json()
    return [null, genJson]
  } catch(err) {
    return [err, null]
  }
} 

const run = async (prompt) => {
  // const response = await openai.createImage({
  //   prompt,
  //   n: 1,
  //   size: "1024x1024"
  // })

  try {
    const [genErr, genJson] = await generateImage(prompt)
    if (genErr) { throw genErr }
    if (genJson.error) { throw genJson.error }

    const filename = `${Date.now()}-${prompt.replace(/\W/g, '_')}.jpg`
    const filepath = `./output/${filename}`
    const blobResponse = await fetch(genJson.data[0].url)
    await new Promise((resolve, reject) => {
      const dest = fs.createWriteStream(filepath)
      blobResponse.body.pipe(dest)
      blobResponse.body.on('end', () => resolve())
      dest.on('error', reject)
    })
    // await blobResponse.body.pipe(fs.createWriteStream(filepath))

    const file = fs.readFileSync(filepath)

    const fbUrl = await new Promise((resolve, reject) => {
      const blob = bucket.file(`output/${filename}`);
      const blobStream = blob.createWriteStream({ resumable: false });
  
      blobStream.on('finish', function () {
        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
        resolve(publicUrl);
      }).on('error', function (err) {
        reject(err);
      }).end(file);
  
      // blobStream;
      
      // fs.createReadStream(filepath).pipe(blobStream);
    })
    console.log(fbUrl)
    // bucket.upload(filepath, {
    //   destination: `output/${filename}`,
    //   metadata: {
    //     contentType: "image/jpeg",
    //   }
    // fs.unlinkSync(filepath)
  } catch(err) {
    console.error(err)
  }
}

app.post("/sms2img", (req, res, next) => {
  run(req.body.Body)
})

// run()
app.listen(8080, () => {
  console.log("alive on 8080")
})