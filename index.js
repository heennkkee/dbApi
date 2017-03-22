const sqlite = require("sqlite3").verbose();
const bodyParser = require('body-parser');
const expressSanitizer = require('express-sanitizer');
const path = require('path');

const express = require('express');

const app = express();

const port = 1337;
var dbPath = 'data/data.sqlite';

var db = new sqlite.Database(dbPath);

//POST Data middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

//Sanitize data
app.use(expressSanitizer());

// Allow headers
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use(express.static(path.join(__dirname, 'include')));

app.get('/help', (req, res) => {
    res.json({
        '/heroes': 'GET, gets all heros',
        '/hero/:id': 'GET, gets specific hero',
        '/hero/update/:id': 'POST, needs parameter "name" with POST, updates name of hero with id',
        '/hero/delete/:id': 'GET, deletes hero with id'
    });
});

app.get('/heroes', (req, res) => {
    db.all('SELECT * FROM HEROES', function(err, rows) {
        res.json({"data": rows});
    });
});

app.get('/heroes/:id', (req, res) => {
    db.get('SELECT * FROM HEROES WHERE ID = $id', {$id: req.params.id}, function(err, rows) {
        if (err) {
            res.json('error');
        } else if (rows === undefined) {
            res.json({"data": []});
        } else {
            res.json({"data": rows});
        }
    });
});


app.get('/heroes/delete/:id', (req, res) => {
    db.run("DELETE FROM HEROES WHERE ID = $id", {$id: req.params.id});
    res.json({"msg": "Hero " + req.params.id + " deleted."});
});

app.post('/heroes/update/:id', (req, res) => {
    var name = req.sanitize(req.body.name);

    db.run('UPDATE HEROES SET NAME = $name WHERE ID = $id', {$id: req.params.id, $name: name});
    res.json({"msg": "Hero " + req.params.id + " updated to name: " + name});
});

app.post('/heroes/add', (req, res) => {
    var name = req.sanitize(req.body.name);
    db.serialize(function() {
        db.run('INSERT INTO HEROES (NAME) VALUES($name)', {$name: name});
        db.get('SELECT * FROM HEROES ORDER BY ID DESC LIMIT 1', function(err, row) {
            if (err) {
                res.json('error');
            } else if (row === undefined) {
                res.json({"data": []});
            } else {
                res.json({"data": row});
            }
        })
    })
});

app.get('/postData', (req, res) => {
    res.end(`
        <html>
        <head>
            <script src="functions.js"></script>
        </head>
        <body onload="readPin()">
            <h1>Hejsan</h1>
            <p>IP: <select id="url"><option value="lushi.asuscomm.com:1042">lushi.asuscomm.com:1042</option><option value="192.168.1.53:80">192.168.1.53:80</option></select></p>
            <p>MODE: <select id="mode"><option value="/set">Set</option><option value="/read">Read</option></select></p>
            <p>PIN: <select id="pin"><option value="2">2</option></select></p>
            <p>VALUE: <select id="value"><option value="0">0</option><option value="1">1</option></select></p>
            <button onclick="sendData()">Skicka data</button>
            <p>Logg: <br><span id="log"></span></p>
        </body>
        </html>`);
});

app.get('/restore', (req, res) => {

    var heroes = [{ id: 11, name: 'Mr. Nice' },
    { id: 12, name: 'Narco' },
    { id: 13, name: 'Bombasto' },
    { id: 14, name: 'Celeritas' },
    { id: 15, name: 'Magneta' },
    { id: 16, name: 'RubberMan' },
    { id: 17, name: 'Dynama' },
    { id: 18, name: 'Dr IQ' },
    { id: 19, name: 'Magma' },
    { id: 20, name: 'Tornado' }];
    db.serialize(function() {
        db.run("DELETE FROM HEROES");
        for (hero in heroes) {
            console.log("inserting ", hero);
            db.run('INSERT INTO HEROES (id, name) VALUES (' + heroes[hero].id + ', "' + heroes[hero].name + '")');
        }
        res.redirect('/heroes');
    })

});

app.get('/setup', (req, res) => {
    db.run('CREATE TABLE HEROES ("id" INTEGER PRIMARY KEY AUTOINCREMENT, "name" VARCHAR(50))');
});

app.get('/clear', (req, res) => {
    db.run('DROP TABLE HEROES');
});

app.listen(port, (err) => {
    if (err) {
        return console.log('someting bad happened', err);
    }
    console.log(`server is listening on port ${port}`);
})
