var express = require("express");
const db = require('./firebase');
var app = express();
const ONE_HOUR = 60 * 60 * 1000;
app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true}))



app.get('/login', function (req, res){
    res.render('src/login')
});

function getSessionId(req) {
    const cookie = req.headers.cookie || "";
    const match = cookie.match(/sessionId=([^;]+)/);
    return match ? match[1] : null;
}

app.get('/Disconnect', async (req, res) => {
    const sessionId = getSessionId(req);
    if (sessionId) {
        await db.ref("Sessions/" + sessionId).remove();
    }
    res.setHeader("Set-Cookie", "sessionId=; Max-Age=0; Path=/");
    res.render('src/login')
});

app.get('/register', function (req, res){
    res.render('src/register')
});

app.get('/main', async (req, res) => {
    const sessionId = getSessionId(req);
    if (!sessionId) return res.redirect("/login");
    const sessionSnap = await db.ref("Sessions/" + sessionId).once("value");
    const session = sessionSnap.val();
    if (!session) return res.redirect("/login");

    const now = Date.now();
    if (now - session.createdAt > ONE_HOUR) {
      await db.ref("Sessions/" + sessionId).remove();
  
      res.setHeader("Set-Cookie", "sessionId=; Max-Age=0; Path=/");
  
      return res.redirect("/login?expired=1");
    }

    const userId = session.userId;

    const snapshot = await db.ref(`Lists/${userId}`).once('value');
    const lists = snapshot.val() || {};
    res.render('src/index', { lists });


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

function generateSessionId() {
    return Date.now().toString() + "_" + Math.floor(Math.random() * 1000000);
}

app.post("/login_form", async (req, res) => {
    const { Username, Password } = req.body;
    try {
        const snapshot = await db.ref("Users").once("value");
        const users = snapshot.val();
        let userId = null;
        for (const [id, user] of Object.entries(users)) {
            if (user.Username === Username && user.Password === Password) {
            userId = id;
            break;
            }
        }

        if (userId!== null) {
            const sessionId = generateSessionId();
            await db.ref("Sessions/" + sessionId).set({
                userId: userId,
                createdAt: Date.now()
            });
            res.setHeader("Set-Cookie", `sessionId=${sessionId}; HttpOnly; Path=/`);
            res.redirect('/main');

        }   else   {
            res.redirect('/login?error=true');
        }
    } catch (err) {
        console.error("Erreur Firebase :", err);
    }
});

async function loadList(listId) {
    try {
        const response = await fetch(`/api/list/${listId}`);
        if (!response.ok) throw new Error('Erreur de chargement');
  
        const data = await response.json();
  
      // Par exemple, afficher les éléments dans #list-items-container
        const container = document.getElementById('list-items-container');
        container.innerHTML = ''; // vider le contenu
  
        data.items.forEach(item => {
            const el = document.createElement('div');
            el.textContent = `${item.name} - ${item.completed ? '✔' : '✘'}`;
            container.appendChild(el);
        });
  
    }   catch (err)     {
        alert(err.message);
    }
}

app.get('/api/list/:listId', async (req, res) => {
    const userId = req.session.userId;
    if (!userId) return res.status(401).json({ error: 'Non autorisé' });
  
    const listId = req.params.listId;
    try {
        const snapshot = await db.ref(`Lists/${userId}/${listId}`).once('value');
        const listData = snapshot.val();
  
        if (!listData) return res.status(404).json({ error: 'Liste non trouvée' });
  
      // Suppose que la structure des éléments est dans listData.items
        res.json({ items: listData.items || [] });
    } catch (error) {
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

app.listen(8080);
console.log("8080 pour le port bg")