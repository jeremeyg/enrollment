// [SECTION] Dependencies and Modules
const express = require("express");

const userController = require("../controllers/user");
const passport = require("passport");
// const auth = require("../auth"); //not using destructured/deconstructed object
const { verify, verifyAdmin, isLoggedIn } = require("../auth"); //using destructured/deconstructed object


// [SECTION] Routing Component
const router = express.Router();


// [SECTION] Routes
router.post("/checkEmail", userController.checkEmailExists);

router.post("/register", userController.registerUser);

router.post("/login", userController.loginUser);

// s42 Activity
//[SECTION] Route for retrieving user details
// The "getProfile" controller method is passed as middleware, the controller will have access to the "req" and "res" objects.
// This will also make our code look cleaner and easier to read as our routes no longer deal with logic.
// All business logic will now be handled by the controller.
router.post("/details", verify, userController.getProfile); //using destructured object
// router.post("/details", auth.verify, userController.getProfile); // not using destructured object

//[SECTION] Route to enroll user to a course
router.post('/enroll', verify, userController.enroll);

//[SECTION] Route to get the user's enrollements array
router.get('/getEnrollments', verify, userController.getEnrollments);

//[SECTION] PUT route for resetting the password
router.put('/reset-password', verify, userController.resetPassword);

//[SECTION] Update user profile route
router.put('/profile', verify, userController.updateProfile);


//[SECTION] Google Login
//[SECTION] Route for initiating the Google OAuth consent screen
router.get("/google", 
	// Uses the "authenticate" method of passport to verify the email credentials in Google's APIs
	passport.authenticate("google", {
		// Scopes that are allowed when retrieving user data
		scope: ["email", "profile"],
		// Allows the OAuth consent screen to be "prompted" when the route is accessed to select a new account every time the user tries to login.
		// Comment this out and access this route twice to see the difference
		// If removed, automatically redirects the user to "/google/success" route
		// If added, always returns the OAuth consent screen to allow the user to choose an account
		prompt: "select_account"

	}
));

//[SECTION] Route for callback URL for Google OAuth authentication
router.get("/google/callback",
	// If authentication is unsuccessful, redirect to "/users/failed" route
	passport.authenticate("google", {
		failureRedirect: "/users/failed"	
	}),
	// If authentication is successful, redirect to "/users/success" route
	function(req, res){
		res.redirect("/users/success");
	}
);

//[SECTION] Route for failed Google OAuth authentication
router.get("/failed", (req,res) => {

	console.log("User is not authenticated");
	res.send("Failed");

});

//[SECTION] Route for successful Google OAuth authentication
router.get("/success", isLoggedIn, (req,res) => {

	console.log("You are logged in");
	console.log(req.user);
	res.send(`Welcome ${req.user.displayName}`);

});

//[SECTION] Route for logging out of the application
router.get("/logout", (req, res) => {
	// Destroys the session that stores the Google OAuth Client credentials
	// Allows for release of resources when the account information is no longer needed in the browser
	req.session.destroy((err) => {

		if(err){
			console.error("Error while destroying session:", err)
		} else {

			req.logout(() => {
				// Redirects the page to "http://localhost:4000" route to visual redirection in frontend.
				console.log("You are logged out");
				res.redirect("/");

			})

		}

	})

});

// Route to update another user as an admin
router.put('/updateAdmin', verify, verifyAdmin, userController.updateAdmin);

// Route to update enrollment status for a user in a specific course
router.put('/updateEnrollmentStatus', verify, verifyAdmin, userController.updateEnrollmentStatus);


module.exports = router;