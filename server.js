if (process.env.NODE_ENV !== "production"){
    require("dotenv").config()
}

//Importing Libraries
const express = require("express")
const app = express()
const bcrypt = require("bcrypt")//Importing Bcrypt package
const initializePassport = require("./passport-config")
const passport = require("passport")
const flash = require("express-flash")
const session = require("express-session")
const { name } = require("ejs")


initializePassport(
    passport,
    email => users.find(user => user.email === email),
    id => users.find(user => user.id === id)
    )

const users = []

//use
app.use(express.urlencoded({extended: false}))
app.use(flash())
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false, //We want to resave the session variable if nothing has changed
    saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())

//post
app.post("/login",checkNotAuthenticated, passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: true
}))


app.post("/register",checkNotAuthenticated, async (req,res) =>{
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        users.push({
            id: Date.now().toString(),
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword,
        })
        console.log(users);
        res.redirect("/login")
    } catch (e){
        console.log(e);
        req.redirect("/register")
    }
})

//Routes
app.get('/' ,checkAuthenticated, (req,res) => {
    res.render("index.ejs", {name: req.user.name})
})

app.get('/login' ,checkNotAuthenticated, (req,res) => {
    res.render("login.ejs")
})

app.get('/register' ,checkNotAuthenticated, (req,res) => {
    res.render("register.ejs")
})
//End Routes

//once user is logged in the cant go back to the login page 
function checkAuthenticated(req,res,next){
    if(req.isAuthenticated()){
        return next()
    }
    res.redirect("/login")
}
//if the user if not logged in they can access the home page
function checkNotAuthenticated(req,res,next){
    if(req.isAuthenticated()){
       return res.redirect("/")
    }
    next()
}
app.listen(3000)