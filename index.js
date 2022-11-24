require('dotenv').config()
const fs = require("fs")
const { promises: { readFile } } = fs
const fetch = require("node-fetch")
const admin = require("firebase-admin")
const { initializeApp, cert } = require("firebase-admin/app")
const { getFirestore, FieldValue } = require("firebase-admin/firestore")
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

const projectName = process.env.PROJECT_NAME
const fbApp = initializeApp({
  credential: cert(serviceAccount),
  storageBucket: `${projectName}.appspot.com`,
  databaseURL: `${projectName}.firebaseio.com`
})

const bucket = admin.storage().bucket()
const firestore = getFirestore()

const generateImage = async (ops={}) => {
  const def = {
    prompt: "Turtle wizard",
    n: 1,
    size: "1024x1024"
  }
  try {
    const bod = Object.assign(def, ops)
    console.log(bod)
    const genResponse = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_SK}`,
      },
      body: JSON.stringify(bod)
    })
    const genJson = await genResponse.json()
    return [null, genJson]
  } catch(err) {
    return [err, null]
  }
} 

const run = async (submission) => {
  try {
    const { Body: prompt, ...Client } = submission
    console.log(prompt)
    const params = {
      prompt,
      n: 2,
    }
    const [genErr, genJson] = await generateImage(params)
    if (genErr) { throw genErr }
    if (genJson.error) { throw genJson.error }

    const blobResponses = await Promise.all(new Array(params.n).fill()
      .map((_,idx) =>
        fetch(genJson.data[idx].url)
          .then(blob => ({ blob, order: idx }))
    ))
    const downloadGen = async (br) => {
      const { blob, order } = br
      const name = `${Date.now()}-${prompt.replace(/\W/g, '_')}-${order}.jpg`
      const filepath = `./output/${name}`
      const dest = fs.createWriteStream(filepath)
      await new Promise((resolve, reject) => {
        blob.body.pipe(dest)
        blob.body.on('end', () => resolve())
        dest.on('error', reject)
      })
      const file = await readFile(filepath)
      const entry = { file, name }
      return entry
    }
    const entries = await Promise.all(
      blobResponses.map((br) => downloadGen(br))
    )
    // await blobResponse.body.pipe(fs.createWriteStream(filepath))

    const submissionRef = firestore.collection('submissions').doc()

    const uploadFb = async (entry) => {
      const { file, name } = entry
      const dest = `output/${name}`
      await new Promise((resolve, reject) => {
        const blob = bucket.file(dest);
        const blobStream = blob.createWriteStream({ resumable: false });
    
        blobStream.on('finish', function () {
          const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
          resolve(publicUrl);
        }).on('error', function (err) {
          reject(err);
        }).end(file);
      })
      const entryRef = firestore.collection("entry").doc()
      await entryRef.set({
        submissionRef,
        prompt,
        model: "dall-e 2",
        storagePath: dest,
      })
      return entryRef
    }
    const entryRefs = await Promise.all(entries.map(e => uploadFb(e)))
    
    await submissionRef.set({
      ...params,
      timestamp: FieldValue.serverTimestamp(),
      items: entryRefs.map(ref => ref),
    })
    return `Fulfilled submission at ${Date.now()}`
  } catch(err) {
    console.error(err)
    return err.message
  }
}

app.post("/sms2img", async (req, res, next) => {
  const succ = await run(req.body)
  res.status(succ.code || 200).send(`You succ: ${succ}`)
})

// run()
app.listen(8080, () => {
  console.log("alive on 8080")
})