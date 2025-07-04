var express = require("express");
var app = express();

app.use(express.static("public"));
app.set("view engine", "ejs");

app.get('/main', function (req, res){
    res.render('src/index')
});

app.get('/login', function (req, res){
    res.render('src/login')
});

app.listen(8080);
console.log("8080 pour le port bg")