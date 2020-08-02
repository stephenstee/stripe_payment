var express = require("express");
var router = express.Router();
const {isLoggedIn, isPaid} = require("../middleware");

router.use(isLoggedIn,isPaid)


router.get("/home", function (req,res){
	if(req.query.paid) res.locals.success = "payment succeeded, welcome";
	res.render("welcome");
})

	router.get("/home/mypage", function(req,res){
	res.render("home")
})

module.exports = router;