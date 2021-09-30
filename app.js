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

const app = express()

app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use(urlencoded({extended: true}))
app.use(json())

mongoose.connect('mongodb://localhost:27017/userDB')

const userScheema = new mongoose.Schema({
    email: String, 
    password: String
})

// const secret = process.env.SECRET
// userScheema.plugin(encrypt, {secret: secret, encryptedFields: ['password']})

const User = mongoose.model('User', userScheema)

app.get('/', (req, res) => {
    res.render('home')
})

app.get('/register', (req, res) => {
    res.render('register')
})

app.get('/login', (req, res) => {
    res.render('login')
})

app.post('/register', (req, res) => {
    bcrypt.hash(req.body.password, saltRounds, (err, hash) => {
        if (err) {
            console.log(err) 
        } else {
            const user = new User({
                email: req.body.username,
                password: hash
            })
            user.save()
            res.render('secrets')
        }
    })
})

app.post('/login', (req, res) => {
    const username = req.body.username
    const userpassword = req.body.password

    User.findOne({email: username}, (err, foundUser) => {
        if (err) {
            console.log(err)
        } else {
            bcrypt.compare(userpassword, foundUser.password, (err, result) => {
                if (err) {
                    console.log(err)
                } else {
                    if (result === true) {
                        res.render('secrets')
                    }
                }
            })
        }
    })
})

app.listen(3000, (req, res) => {
    console.log('Server is up and running on port 3000.')
})


