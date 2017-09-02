const express = require('express');
const mustache = require('mustache-express');
const bodyparser = require('body-parser');
let session = require('express-session')

const server = express();

//Set up body-parser
server.use(bodyparser.urlencoded({ extended: false }));

//Set up Mongoose
const mongoose = require('mongoose');
mongoose.Promise = require('bluebird');

//Set up Mustache
server.engine('mustache', mustache());
server.set('views', './templates');
server.set('view engine', 'mustache');

//css
server.use(express.static('templates'));

//Set up Sessions
server.use(session({
    secret: 'secret string',
    resave: false,
    saveUninitialized: true
}));

//Connect to Mongoose
mongoose.connect('mongodb://localhost:27017/snippets');


//Set up root login page
server.get('/', function (req, res) {
    res.render('login')
});


//******************************* Login Schema *************************/
const loginSchema = new mongoose.Schema({
    username: String,
    password: String,
});

const Login = mongoose.model('Login', loginSchema);
//********************************************************************** */


//Verify the login credentials with sessions            
server.post('/loginVerification', function (req, res) {
    let user = null;
    let username = req.body.username;
    let password = req.body.password;

    Login.find({ $and: [{ username: username }, { password: password }] }, function (err, results) {

        if (results.length) {
            user = results;
            console.log('user =' + user);
        } else {
            console.log('err =' + err);
        }
    }).then(function () {
        if (user !== null) {
            req.session.person = user;
            res.redirect('/home');

        } else {
            res.redirect('/registration')
        };
    });
});


//Set up home page 
server.get('/home', function (req, res) {
    if (req.session.person !== undefined) {
        Snippet.find()
            .then(function (data) {

                res.render('snippet', {
                    snippet: data,
                })
            })
            .catch(function () {
                console.log("clearly, this isn't working");
            });
    } else {
        res.redirect('/');
    };
});

//*************************** Registration Page ******************************
//Set up registration page
server.get('/registration', function (req, res) {
    res.render('registration');
});

//Add new user
server.post('/reg', function (req, res) {

    Login.create({
        username: req.body.newUsername,
        password: req.body.newPassword,
    })
        .then(function (data) {
            console.log("saved it!")
            res.redirect('/')
        });
});


//******************************* Set Up Snippet Schema *********************************/
const snippetSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    body: String,
    notes: String,
    language: String,
    tags: [String],
});

const Snippet = mongoose.model('Snippet', snippetSchema);
//****************************************************************************** */

//Add Snippet to Database
server.post('/add', function (req, res) {
    let tagString = req.body.newTag;
    let tagArray = tagString.split(',');

    for (let i = 0; i < tagArray.length; i++) {
        tagArray[i] = tagArray[i].trim()
    }

    Snippet.create({
        name: req.body.name,
        body: req.body.newSnippet,
        notes: req.body.notes,
        language: req.body.language,
        tags: tagArray,
    })
        .then(function (data) {
            console.log("saved it!")
            res.redirect('/home')
        })

        .catch(function () {
            console.log("womp, womp")
        });
});

//******************************* Search for Snippets *********************************/
server.post('/search', function (req, res) {
    let searchValue = req.body.searchValue;
    let testObj = {};
    testObj[searchValue] = req.body.searchbox;

    if (searchValue === "tags") {

        Snippet.find({
            tags: req.body.searchbox
        })
            .then(function (results) {
                res.render('snippet', {
                    snippet: results,
                });
            })
            .catch(function (err) {
                console.log("This did not work. I'm sorry")
                console.error(err);
            })
    } else {
        console.log(testObj)
        Snippet.find(testObj)
            .then(function (results) {
                res.render('snippet', {
                    snippet: results,
                });
            })
            .catch(function () {
                console.log('not finding anything')
            });
    };
});


//******************************* Details Page *********************************/

server.get('/details/:id', function (req, res) {
    const id = req.params.id;
    Snippet.findOne({
        _id: id
    }).then(function (results) {
        res.render('details', {
            snippet: results,
        });
    });
});



//Set up Server
server.listen(3000, function () {
    console.log("Let's do this!")
});

