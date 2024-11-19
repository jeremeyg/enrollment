const jwt = require("jsonwebtoken");

// User defined string data that will be used to create our JSON web tokens
// Used in the algorithm for encrypting our data which makes it difficult to decode the information without the defined secret keyword
const secret = "CourseBookingAPI";

// [Section] JSON Web Tokens
/*
- JSON Web Token or JWT is a way of securely passing information from the server to the client or to other parts of a server
- Information is kept secure through the use of the secret code
- Only the system that knows the secret code that can decode the encrypted information
- Imagine JWT as a gift wrapping service that secures the gift with a lock
- Only the person who knows the secret code can open the lock
- And if the wrapper has been tampered with, JWT also recognizes this and disregards the gift
- This ensures that the data is secure from the sender to the receiver
*/

//[Section] Token Creation
/*
Analogy
	Pack the gift and provide a lock with the secret code as the key
*/
module.exports.createAccessToken = (user) => {

	// The data will be received from the registration form
	// When the user logs in, a token will be created with user's information
	const data = {
		id: user._id,
		email: user.email,
		isAdmin: user.isAdmin
	};

	// Generate a JSON web token using the jwt's sign method
	// Generates the token using the form data and the secret code with no additional options provided
	return jwt.sign(data, secret, {});

}

/*
============================================================================
Notes on JWT:

1. You should only get a unique jwt with our "secret" keyword included in the algoritm if you log in to our app with the correct email and password.

2. As a user, You should only get your own details from your own token from logging in.

3. JWT is not meant to store sensitive data. For now, for ease of use and for our MVP, we add the email and isAdmin details of the logged in user, however, in the future, you can limit this to only the id and for every route and feature, you can simply lookup for the user in the database to get his details.

4. JWT is like a more secure passport you use around the app to access certain features meant for your type of user.

5. We will verify the legitimacy of a JWT every time a user access a restricted feature. Each JWT contains a secret only our server knows. IF the jwt has been, in any way, changed, We will reject the user and his tampered token. IF the jwt, does not contain a secret OR the secret is different, we will reject his access and token.
============================================================================
*/

//[SECTION] Token Verification
/*
Analogy
	Receive the gift and open the lock to verify if the the sender is legitimate and the gift was not tampered with
- Verify will be used as a middleware in ExpressJS. Functions added as argument in an expressJS route are considered as middleware and is able to receive the request and response objects as well as the next() function. Middlewares will be further elaborated on later sessions.
*/
module.exports.verify = (req,res, next) => {

	console.log(req.headers.authorization);
	// "req.headers.authorization" contains sensitive data and especially our token

	let token = req.headers.authorization; // we saved our token to a variable token

	if(typeof token === "undefined"){
		return res.send({ auth: "Failed. No token"})
	}
	else{
		console.log(token); // "Bearer eysqowksdldxkasd.alkdasdkla.asdklas"
		token = token.slice(7, token.length); // "Bearer eysqowksdldxkasd.alkdasdkla.asdklas"
		// This will remove the unecessary characters such as the Bearer:, so that the token will only remain and be evaluated.
		console.log(token); // eysqowksdldxkasd.alkdasdkla.asdklas"

        //[SECTION] Token decryption
		/*
        Analogy
        	Open the gift and get the content
        - Validate the token using the "verify" method decrypting the token using the secret code.
        - token - the jwt token passed from the request headers.
        - secret - the secret word from earlier which validates our token
        - function(err,decodedToken) - err contains the error in verification, decodedToken contains the decoded data within the token after verification
        */
	    // "err" is a built-in variable of express to handle errors
		jwt.verify(token, secret, function(err, decodedToken){

			//If there was an error in verification, an erratic token, a wrong secret within the token, we will send a message to the client.
			if(err){
				return res.send(
				{
					auth: "Failed",
					message: err.message
				});
			}
			else{
				console.log("result from verify method: ");
				console.log(decodedToken);

				// Else, if our token is verified to be correct, then we will update the request and add the user's decoded details.
				req.user = decodedToken;

				next(); // run the next middleware
			}
		})
	}
}

// The "verifyAdmin" method will only be used to check if the user is an admin or not.
// The "verify" method should be used before "verifyAdmin" because it is used to check the validity of the jwt. Only when the token has been validated should we check if the user is an admin or not.
// The "verify" method is also the one responsible for updating the "req" object to include the "user" details/decoded token in the request body.
// Being an ExpressJS middleware, it should also be able to receive the next() method.
module.exports.verifyAdmin = (req, res, next) =>{

	// Checks if the owner of the token is an admin.
	if(req.user.isAdmin){
		// If it is, move to the next middleware/controller using next() method.
		next();
	}
	// Else, end the request-response cycle by sending the appropriate response and status code.
	else{
		return res.status(403).send({
			auth: "Failed",
			message: "Action Forbidden"
		})
	}

}

module.exports.isLoggedIn = (req, res, next) => {

	if(req.user){
		next();
	} else {
		res.sendStatus(401);
	}

}