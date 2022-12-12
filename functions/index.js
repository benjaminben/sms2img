const functions = require("firebase-functions");
const {getFunctions} = require('firebase-admin/functions')
const {initializeApp, cert} = require('firebase-admin/app')
const serviceAccount = require("./sa.json")
const admin = require('firebase-admin')

// // Create and deploy your first functions
// // https://firebase.google.com/docs/functions/get-started
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

initializeApp({
  credential: cert(serviceAccount),
})

exports.dispatchSms2img = functions.tasks.taskQueue({
  retryConfig: {
    maxAttempts: 3,
    minBackoffSeconds: 60,
  },
  rateLimits: {
    maxConcurrentDispatches: 1,
    maxDispatchesPerSecond: 1,
  }
}).onDispatch(async (body) => {
  const { projectId } = JSON.parse(process.env.FIREBASE_CONFIG)
  const fetchImport = await import("node-fetch")
  const fetch = fetchImport.default
  // Forward to next.js api route
  functions.logger.info(`Dispatch body:`, JSON.stringify(body))
  const res = await fetch(`https://${projectId}.web.app/api/sms2img`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body),
  })
  return res
})

exports.enqueueSms2img = functions.https.onRequest(
  async (_request, response) => {
    functions.logger.info(`Enqueue body:`, JSON.stringify(_request.body))
    const queue = getFunctions().taskQueue("dispatchSms2img")
    await queue.enqueue(_request.body)
    response.sendStatus(200)
  }
)