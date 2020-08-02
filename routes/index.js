var express = require("express");
var User = require("../models/user");
var router = express.Router();
var passport = require("passport");
const { isLoggedIn } = require("../middleware")
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
router.get("/",function(req,res){
	res.render("root");
})



router.get("/register",function(req,res){
	res.render("register");
})

router.post("/register" ,function(req,res){
	User.register(new User({username: req.body.username}), req.body.password,function(err, user){
		if(err){
			req.flash("error", err.message)
			return res.redirect("register");
		}
		passport.authenticate("local")(req,res, function(){
			req.flash("success", "welcome to yelcamp" + user.username);
			res.redirect("/checkout");
		})
    })
})

router.get("/login",function(req,res){
	res.render("login");
})

router.post("/login" ,passport.authenticate("local",{
	
	successRedirect: "/",
	failureRedirect: "/login"
}),function(req,res){
});

router.get("/logout",function(req,res){
	req.logout();
	req.flash("success", "logged out");
	res.redirect("/");
})

router.get("/checkout",isLoggedIn,function(req,res){
	 if (req.user.isPaid) {
        req.flash('success', 'Your account is already paid');
        return res.redirect('/campgrounds');
    }
	res.render('checkout', {amount:20});
})
router.post('/pay', isLoggedIn, async (req, res) => {
    const { paymentMethodId, items, currency } = req.body;

    const amount = 2000;
  
    try {
      // Create new PaymentIntent with a PaymentMethod ID from the client.
      const intent = await stripe.paymentIntents.create({
        amount,
        currency,
        payment_method: paymentMethodId,
        error_on_requires_action: true,
        confirm: true
      });
  
      console.log("💰 Payment received!");

      req.user.isPaid = true;
      await req.user.save();
      // The payment is complete and the money has been moved
      // You can add any post-payment code here (e.g. shipping, fulfillment, etc)
  
      // Send the client secret to the client to use in the demo
      res.send({ clientSecret: intent.client_secret });
    } catch (e) {
      // Handle "hard declines" e.g. insufficient funds, expired card, card authentication etc
      // See https://stripe.com/docs/declines/codes for more
      if (e.code === "authentication_required") {
        res.send({
          error:
            "This card requires authentication in order to proceeded. Please use a different card."
        });
      } else {
        res.send({ error: e.message });
      }
    }
});
module.exports = router;