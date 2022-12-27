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

async function generateImage(ops={}) {
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

async function prepTransfer(br) {
  const { blob, order, prompt } = br
  const name = `${Date.now()}-${prompt.replace(/\W/g, '_')}-${order}.jpg`
  const file = blob
  const entry = { file, name }
  return entry
}

async function uploadFb(entry, fields) {
  const { file, name } = entry
  const dest = `output/${name}`
  await new Promise((resolve, reject) => {
    const blob = bucket.file(dest);
    const blobStream = blob.createWriteStream({ resumable: false });

    const pipedStream = file.body.pipe(blobStream)

    pipedStream.on('finish', function () {
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
      resolve(publicUrl);
    }).on('error', function (err) {
      reject(err);
    });
  })

  const entryRef = firestore.collection("entry").doc()
  await entryRef.set({
    storagePath: dest,
    ...fields,
  })
  return entryRef
}

async function findOrCreateSmsUser(phoneNumber) {
  const userRef = firestore.doc(`smsUsers/${phoneNumber}`)
  const userSnapshot = await userRef.get()
  const results = { ref: userRef }
  if (userSnapshot.exists) {
    results.data = userSnapshot.data()
  } else {
    const data = {
      createdAt: FieldValue.serverTimestamp(),
      blocked: false,
    }
    await userRef.set(data)
    results.data = data
  }
  return results
}

export const run = async (submission) => {
  let smsUserRef, smsUserData
  try {
    const { Body: prompt, ...Client } = submission
    if (!Client.From) {
      throw { type: "bad_submission", message: "Invalid submission: missing `From` value" }
    }
    ;({ref: smsUserRef, data: smsUserData} = await findOrCreateSmsUser(Client.From))
    if (smsUserData.blocked) { throw { type: "smsUser_blocked", message: "BLOCKED" } }

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
          .then(blob => ({ blob, order: idx, prompt }))
    ))

    const entries = await Promise.all(blobResponses.map((br) => prepTransfer(br)))
    const submissionRef = firestore.collection('submissions').doc()
    const entryRefs = await Promise.all(entries.map(entry => uploadFb(entry, {
      submissionRef,
      prompt,
      model: "dall-e 2",
    })))
    
    await submissionRef.set({
      ...params,
      timestamp: FieldValue.serverTimestamp(),
      items: entryRefs,
    })
    await submissionRef.collection('private').doc('sender').set({ smsUserRef })
    return `Fulfilled submission at ${Date.now()}`
  } catch(err) {
    console.error(err)
    let result = null
    switch (err.type) {
      case "invalid_request_error":
        result = {code: 400, message: "OpenAI Invalid Request"}
        if (submission.From) {
          if (smsUserData.warnOpenAiInvalidRequest) {
            break
          }
          twilioCLient.messages.create({   
            messagingServiceSid: process.env.TWILIO_MESSAGING_SERVICE_SID,
            to: submission.From,
            body: err.message
          })
          .then(message => {
            return smsUserRef.update({ warnOpenAiInvalidRequest: FieldValue.serverTimestamp() })
          })
          .done()
        }
        break
      default:
        result = {code: 400, ...err}
    }
    return result
  }
}