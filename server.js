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
const methodOverride = require("method-override")

//supabase configuration
const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://llfhkqdenvzoutfuqglg.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxsZmhrcWRlbnZ6b3V0ZnVxZ2xnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTIyMTExMjUsImV4cCI6MjAyNzc4NzEyNX0.cJBk8QaFjwAPUd6Q93Ipti5dG2U-p_flNQYHfDk_SAY'

const supabase = createClient(supabaseUrl, supabaseKey);



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
app.use(methodOverride("_method"))

// User registration endpoint
app.post("/register", checkNotAuthenticated, async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10); // Hash the password

        // Insert user data into Supabase
        const { data, error } = await supabase
            .from('users')
            .insert([
                {
                    username: req.body.name,
                    email: req.body.email,
                    password: hashedPassword,
                },
            ]);

        if (error) {
            console.error(error);
            return res.status(500).send('Error registering user');
        }

        console.log('User registered:', data);
        res.redirect("/login");
    } catch (e) {
        console.error(e);
        res.redirect("/register");
    }
});

// Login endpoint
app.post("/login", checkNotAuthenticated, passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: true
}));


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

app.delete("/logout", (req, res) =>{
    req.logOut(req.user,err =>{
        if(err) return next(err)
        res.redirect("/")
    })
})
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

function togglePassword() {
    const passwordField = document.getElementById('password');
    const showPasswordCheckbox = document.getElementById('showPassword');

    if (showPasswordCheckbox.checked) {
        passwordField.type = 'text'; // Show password
    } else {
        passwordField.type = 'password'; // Hide password
    }
}
app.listen(3000)