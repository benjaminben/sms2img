import fetch from "node-fetch"
const fs = require("fs")
const { promises: { readFile } } = fs
const { FieldValue } = require("firebase-admin/firestore")
const { Configuration, OpenAIApi } = require("openai")
const twilioCLient = require("twilio")(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
)
const configuration = new Configuration({
  apiKey: process.env.OPENAI_SK
})
const openai = new OpenAIApi(configuration)

const admin = require("firebase-admin")
const { getFirestore } = require("firebase-admin/firestore")
const bucket = admin.storage().bucket()
const firestore = getFirestore()

fs.mkdirSync("./output", {recursive: true})

const generateImage = async (ops={}) => {
  const def = {
    prompt: "Turtle wizard",
    n: 1,
    size: "1024x1024"
  }
  try {
    const bod = Object.assign(def, ops)
    const genResponse = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_SK}`,
      },
      body: JSON.stringify(bod)
    })
    const genJson = await genResponse.json()
    // console.log(genJson)
    return [null, genJson]
  } catch(err) {
    return [err, null]
  }
} 

export const run = async (submission) => {
  try {
    const { Body: prompt, ...Client } = submission
    const params = {
      prompt,
      n: 1,
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
    const prepTransfer = async (br) => {
      const { blob, order } = br
      const name = `${Date.now()}-${prompt.replace(/\W/g, '_')}-${order}.jpg`
      const file = blob
      const entry = { file, name }
      return entry
    }
    const entries = await Promise.all(
      // blobResponses.map((br) => downloadGen(br))
      blobResponses.map((br) => prepTransfer(br))
    )
    // await blobResponse.body.pipe(fs.createWriteStream(filepath))

    const submissionRef = firestore.collection('submissions').doc()

    const uploadFb = async (entry) => {
      const { file, name } = entry
      const dest = `output/${name}`
      await new Promise((resolve, reject) => {
        const blob = bucket.file(dest);
        const blobStream = blob.createWriteStream({ resumable: false });

        const pipedStream = file.body.pipe(blobStream)
    
        // blobStream.on('finish', function () {
        pipedStream.on('finish', function () {
          const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
          resolve(publicUrl);
        }).on('error', function (err) {
          reject(err);
        // }).end(file);
        });
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
      items: entryRefs,
    })
    return `Fulfilled submission at ${Date.now()}`
  } catch(err) {
    console.error(err)
    switch (err.type) {
      case "invalid_request_error":
        if (submission.From) {
          twilioCLient.messages.create({   
            messagingServiceSid: process.env.TWILIO_MESSAGING_SERVICE_SID,
            to: submission.From,
            body: err.message
          })
          .then(message => console.log(message.sid))
          .done()
        }
        break
      default:
    }
    return err.message
  }
}