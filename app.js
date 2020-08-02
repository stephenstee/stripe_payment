require('dotenv').config();
var express = require("express");
var app= express()
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var passport = require("passport");
var passportLocalMongoose = require("passport-local-mongoose");
var LocalStrategy = require("passport-local");
var User = require("./models/user")
var flash = require("connect-flash");
var authRoutes = require("./routes/index");
var homeRoutes = require("./routes/home")

mongoose.connect("mongodb://localhost/stripe_payment", {useNewUrlParser:true, useUnifiedTopology:true});

app.use(express.json());
app.use(bodyParser.urlencoded({extended:true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));

app.use(flash());


app.use(require("express-session")({
	secret: "i am the legend",
	resave: false,
	saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req,res,next){
	res.locals.success = req.flash("success");
	res.locals.error = req.flash("error");
	next()
})





app.use(authRoutes);
app.use(homeRoutes);

app.listen(3000,function(){
	console.log("server starts");
})