// Express Configurations
const express = require('express');
const session = require('express-session');
const app = express();
const port = 3000;

// BCrypt configurations
const bcrypt = require('bcrypt');
const saltRounds = 10;

// Session configurations
app.use(session({
    secret: 'some secret',
    cookie: { maxAge: 30000},
    saveUninitialized: true,
    resave: true
}))

// CORS
let cors = require('cors');
app.use(cors());

// MySQL Configurations
const mysql = require('mysql');
const connection = mysql.createConnection({
    host : 'localhost',
    user: 'root',
    password: 'admin',
    database: 'mundus' 
});

// Port listener
app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});

// --------- Favorites ---------
// Get URL with ID
app.get('/favorites/:id', function (req, res) {
    // Check if "id" is a number
    let usr_id = req.params.id;
    let regex = new RegExp("^[0-9]*$");
    if (!regex.test(req.params.id)) {
        usr_id = 0;
    }
    
    // Get all favorites of the user
    connection.query(`select * from favorites where usr_id=?`, [usr_id], function (err, rows) {
    if (err) throw err;

    res.send(rows);
    });
});

// Add a favorite
app.post('/favorite/:author?/:category?/:country?/:language?/:source?/:title?/:url?/:usr_id', (req, res) => {
    let author = req.params.author;
    let category = req.params.category;
    let country = req.params.country;
    let language = req.params.language;
    let source = req.params.source;
    let title = req.params.title;
    let url = req.params.url;
    let usr_id = req.params.usr_id;

    connection.query(`insert into favorites(author, title, url, source, category, language, country, usr_id) 
        values(?, ?, ?, ?, ?, ?, ?, ?)`,
         [author, title, url, source, category, language, country, usr_id], (err, result) => {
            if (err) throw err;

            res.send("Favorite added");
        }
    );
});

// Delete a favorite
app.delete('/favorites/delete/:id', (req, res) => {
    let fav_id = req.params.id;
    let regex = new RegExp("^[0-9]*$");
    if (!regex.test(fav_id)) {
        fav_id = 0;
    }
    connection.query('delete from favorites where fav_id=?', [fav_id], (err, result) => {
        if (err) throw err;

        res.send("Favorite deleted");
    });
});

// --------- User ---------
// Login
app.post('/login/:email?/:password', (req, res) => {
    let email = req.params.email;
    let password = req.params.password;
    connection.query('select count(*) as ctn, email as mail, password as pswd from users where email=?', [email, password], (err, rows) => {
        if (err) throw err;
        
        bcrypt.compare(password, rows[0].pswd, function (err, result) {
            if (err) throw err;

            if (rows[0].ctn !== 0 && result) {
                console.log(req.sessionID);
                if (req.session.authentificated) {
                    //res.json(req.session);
                    res.sendStatus(200);
                } else {
                    req.session.authentificated = true;
                    req.session.user = {
                        email, password
                    };
                    //res.json(req.session);
                    res.sendStatus(200);
                }
            } else {
                res.json({ msg: 'Mauvais email ou mot de passe.' });
            }
        })
    });
});

// Signin
app.post('/signin/:email?/:password', (req, res) => {
    let email = req.params.email;
    let password = req.params.password;
    connection.query('select count(*) as ctn from users where email=?', [email], (err, rows) => {
        if (err) throw err;

        if (rows[0].ctn !== 0) {
            res.json({ msg: 'Cet email existe déjà.'})
        } else {
            bcrypt.hash(password, saltRounds, function(err, hash) {
                if (err) throw err;
                connection.query('insert into users(email, password) values(?, ?)', [email, hash], (err, rows) => {
                    if (err) throw err;
    
                    res.json({ msg: 'Utilisateur ajouté.'});
                });
            });
        }
    });
});

// Get user infos
app.get('/user/:id', (req, res) => {
    let usr_id = req.params.id;
    let regex = new RegExp("^[0-9]*$");
    if (!regex.test(usr_id)) {
        usr_id = 0;
    }
    connection.query('select * from users where usr_id=?', [usr_id], (err, rows) => {
        if (err) throw err;

        res.send(rows);
    });
});
// Change user infos
app.put('/update/:id?/:firstname?/:lastname?/:email', (req, res) => {
    let usr_id = req.params.id;
    let regex = new RegExp("^[0-9]*$");
    if (!regex.test(usr_id)) {
        usr_id = 0;
    }
    let firstname = req.params.firstname;
    let lastname = req.params.lastname;
    let email = req.params.email;
    connection.query('update users set firstname=?, lastname=?, email=? where usr_id=?', 
    [firstname, lastname, email, usr_id], (err, rows) => {
        if (err) throw err;

        res.json({ msg: 'Utilisateur modifié' });
    });
});

// Change password (WIP : !! À Améliorer !!)
app.put('/updatePassword/:id?/:newPassword', (req, res) => {
    let usr_id = req.params.id;
    let regex = new RegExp("^[0-9]*$");
    if (!regex.test(usr_id)) {
        usr_id = 0;
    }
    bcrypt.hash(req.params.newPassword, saltRounds, function (err, hash) {
        if (err) throw err;

        connection.query('update users set password=? where usr_id=?', [hash, usr_id], (err, rows) => {
            if (err) throw err;

            res.json({ msg: 'Mot de passe modifié.'});
        })
    });
});