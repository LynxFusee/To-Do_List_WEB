var express = require("express");
const db = require('./firebase');
var app = express();

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true}))



app.get('/login', function (req, res){
    res.render('src/login')
});

app.get('/register', function (req, res){
    res.render('src/register')
});


app.get('/main', async (req, res) => {
    const snapshot = await db.ref("messages").once("value");
    const messages = snapshot.val() || {};
    res.render('src/index', { messages });
});
  
  // Traitement du formulaire
app.post('/envoyer', async (req, res) => {
    const { auteur, contenu } = req.body;
    await db.ref("messages").push({ auteur, contenu });
    res.redirect('/main');
});

app.post("/register_form", async (req, res) => {
    console.log(req.body);
    const { Username, Password } = req.body;
    let maxUserId;
    await db.ref('Users').once('value').then(snapshot => {
        const data = snapshot.val();
        if (data) {
            const userIds = Object.keys(data).map(id => parseInt(id, 10));
            maxUserId = Math.max(...userIds);
        } 
    });
    await db.ref('Users/' + (maxUserId+1) ).set({Username: Username, Password: Password});
    res.redirect('/login');
});

app.post("/login_form", async (req, res) => {
    const { Username, Password } = req.body;
    try {
        const snapshot = await db.ref("Users").once("value");
        const users = snapshot.val();
        const userFound = Object.values(users).some(user =>
            user.Username === Username && user.Password === Password
        );

        if (userFound) {
            res.redirect('/main');
        }   else   {
            res.redirect('/login?error=true');
        }
    } catch (err) {
        console.error("Erreur Firebase :", err);
    }
});

app.listen(8080);
console.log("8080 pour le port bg")