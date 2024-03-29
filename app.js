require('dotenv').config()
const express = require('express')
const ejs = require('ejs')
const bodyParser = require('body-parser')
const { urlencoded } = require('body-parser')
const { json } = require('body-parser')
const mongoose = require('mongoose')
const encrypt = require('mongoose-encryption')
const md5 = require('md5')
const bcrypt = require('bcrypt')
const saltRounds = 10
const passport = require('passport')
const passportLocalMongoose = require('passport-local-mongoose')
const session = require('express-session')

//console.log('test');


const app = express()

app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use(urlencoded({extended: true}))
app.use(json())
app.use(session({
    secret: 'This is my secret.',
    resave: false, 
    saveUninitialized: true
}))
app.use(passport.initialize())
app.use(passport.session())

mongoose.connect('mongodb://localhost:27017/userDB')

const userScheema = new mongoose.Schema({
    email: String, 
    password: String
})

userScheema.plugin(passportLocalMongoose)
// const secret = process.env.SECRET
// userScheema.plugin(encrypt, {secret: secret, encryptedFields: ['password']})

const User = mongoose.model('User', userScheema)

passport.use(User.createStrategy())

passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

app.get('/', (req, res) => {
    res.render('home')
})

app.get('/register', (req, res) => {
    res.render('register')
})

app.get('/login', (req, res) => {
    res.render('login')
})

app.get('/secrets', (req, res) => {
    if (req.isAuthenticated()) {
        res.render('secrets')
    } else {
        res.redirect('/login')
    }
})

app.post('/register', (req, res) => {
    User.register({username: req.body.username}, req.body.password, (err, user) => {
        if (err) {
            console.log(err)
            res.redirect('/register')
        } else {
            passport.authenticate('local')(req, res, () => {
                res.redirect('/secrets')
            })
        }
    })
})

app.post('/login', (req, res) => {
    const user = new User({
        username: req.body.username,
        password: req.body.password
    })

    req.login(user, (err) => {
        if (err) {
            console.log(err)
        } else {
            passport.authenticate('local')(req, res, () => {
                res.redirect('/secrets')
            })
        }
    })
    
})

app.get('/logout', function(req, res){
    req.logout();
    res.redirect('/');
  });

app.listen(3000, (req, res) => {
    console.log('Server is up and running on port 3000.')
})


