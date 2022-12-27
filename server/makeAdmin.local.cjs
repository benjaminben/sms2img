/********************************************************************
  
This script adds a custom claim of {admin: true} on a provider user,
which is required to use the included validateAdmin.js middleware in firebase functions
NB: Must have ./sa.json with proper permissions in local secrets folder
*********************************************************************/

const admin = require('firebase-admin');
const argv = require('minimist')(process.argv.slice(2));
const serviceAccount = require("./sa.json");

if (!argv.uid) {
  console.error(`Argument --uid required`);
} else {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  admin.auth().setCustomUserClaims(argv.uid, {admin: true});
}