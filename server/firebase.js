// const admin = require("firebase-admin")
// const { getFirestore } = require("firebase-admin/firestore")
const { initializeApp, cert } = require("firebase-admin/app")
const serviceAccount = require("./sa.json")
const projectName = process.env.PROJECT_NAME

initializeApp({
  credential: cert(serviceAccount),
  storageBucket: `${projectName}.appspot.com`,
  databaseURL: `${projectName}.firebaseio.com`
})

// const bucket = admin.storage().bucket()
// const firestore = getFirestore()

// module.exports = {
//   bucket,
//   firestore,
// }