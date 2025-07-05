const admin = require("firebase-admin");
const serviceAccount = require("./firebase-service-account.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://la-to-do-liste-de-jules-default-rtdb.europe-west1.firebasedatabase.app"
});

const db = admin.database();
module.exports = db;