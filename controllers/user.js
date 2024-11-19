// [SECTION] Dependencies and Modules
const bcrypt = require('bcrypt');
// The "User" variable is defined using a capitalized letter to indicate that what we are using is the "User" model for code readability
const User = require("../models/User");
const Enrollment = require("../models/Enrollment");
const auth = require("../auth");

//[SECTION] Check if the email already exists
/*
	Steps: 
	1. Use mongoose "find" method to find duplicate emails
	2. Use the "then" method to send a response back to the client application based on the result of the "find" method
*/

module.exports.checkEmailExists = (req,res) => {

	if(req.body.email.includes("@")){

		// The result is sent back to the client via the "then" method found in the route file
		return User.find({ email: req.body.email })
				.then(result => {

					// The "find" method returns a record if a match is found
					if (result.length > 0) {

			            // If there is a duplicate email, send true with 409 http status back to the client
						return res.status(409).send({ error: "Duplicate Email Found" });

					// No duplicate email found
					// The user is not yet registered in the database
					} else {

			            // If there is no duplicate email, send false with 404 http status back to the client
						return res.status(404).send({ message: "Email not found" });
					}

				// if an error occured in the .catch(), send the error with the 500 http status back to the client
				}).catch(err => {
					console.error("Error in find", err)
					return res.status(500).send({ error: "Error in find"});
				});

	} else {
		res.status(400).send({ error: "Invalid Email"})
	}
	


}

//[SECTION] User registration
/*
	Steps:
	1. Create a new User object using the mongoose model and the information from the request body
	2. Make sure that the password is encrypted
	3. Save the new User to the database
*/
module.exports.registerUser = (req,res) => {

	// Checks if the email is in the right format
	if (!req.body.email.includes("@")){
	   	return res.status(400).send({ error: "Email invalid" });
	}
	// Checks if the mobile number has the correct number of characters
	else if (req.body.mobileNo.length !== 11){
	    return res.status(400).send({ error: "Mobile number invalid" });
	}
	// Checks if the password has atleast 8 characters
	else if (req.body.password.length < 8) {
	    return res.status(400).send({ error: "Password must be atleast 8 characters" });
	// If all needed requirements are achieved
	} else {

		// Creates a variable "newUser" and instantiates a new "User" object using the mongoose model
		// Uses the information from the request body to provide all the necessary information
		let newUser = new User({
			firstName : req.body.firstName,
			lastName : req.body.lastName,
			email : req.body.email,
			mobileNo : req.body.mobileNo,
			password : bcrypt.hashSync(req.body.password, 10)
		});

		// Saves the created object to our database
		// Then, return result to the handler function. No return keyword used because we're using arrow function's implicit return feature
		// catch the error and return to the handler function. No return keyword used because we're using arrow function's implicit return feature
		return newUser.save()
				.then((user) => res.status(201).send({ message: "Registered Successfully" }))
				.catch(err => {
					console.error("Error in saving: ", err)
					return res.status(500).send({ error: "Error in save"})
				})
		
	}
};

//[SECTION] User authentication
/*
	Steps:
	1. Check the database if the user email exists
	2. Compare the password provided in the login form with the password stored in the database
	3. Generate/return a JSON web token if the user is successfully logged in and return false if not
*/

module.exports.loginUser = (req,res) => {

	if(req.body.email.includes("@")){

		return User.findOne({ email : req.body.email })
		.then(result => {

			if(result == null){

				// return res.send("No Email Found");
				return res.status(404).send({ error: "No Email Found" });

			} else {

				const isPasswordCorrect = bcrypt.compareSync(req.body.password, result.password);

				if (isPasswordCorrect) {

					return res.status(200).send({ access : auth.createAccessToken(result)});

				} else {

					// return res.send("Email and password do not match");
					return res.status(401).send({ error: "Email and password do not match" });

				}

			}

		})
		.catch(err => {
					console.error("Error in find: ", err)
					return res.status(500).send({ error: "Error in find"})
				})

	} else {

		return res.status(400).send({error: "Invalid Email"})

	}

	
};


//[SECTION] Retrieve user details
/*
	Steps:
	1. Retrieve the user document using it's id
	2. Change the password to an empty string to hide the password
	3. Return the updated user record
*/
// The "getProfile" method now has access to the "req" and "res" objects because of the "next" function in the "verify" method.
module.exports.getProfile = (req, res) => {

	const userId = req.user.id;

	// The "return" keyword ensures the end of the getProfile method.
	// Since getProfile is now used as a middleware it should have access to "req.user" if the "verify" method is used before it.
	// Order of middlewares is important. This is because the "getProfile" method is the "next" function to the "verify" method, it receives the updated request with the user id from it.
	return User.findById(userId)
	        .then(user => {
	            if (!user) {
	                return res.status(404).send({ error: 'User not found' });
	            }

	            // Exclude sensitive information like password
	            user.password = undefined;

	            return res.status(200).send({ user });
	        })
	        .catch(err => {
	        	console.error("Error in fetching user profile", err)
	        	return res.status(500).send({ error: 'Failed to fetch user profile' })
	        });


};

/*
 - The status code of a response is a three-digit integer code that describes the result of the request and the semantics of the response, including whether the request was successful and what content is enclosed (if any). All valid status codes are within the range of 100 to 599, inclusive.
- The first digit of the status code defines the class of response. The last two digits do not have any categorization role. There are five values for the first digit:
    - 1xx (Informational): The request was received, continuing process
    - 2xx (Successful): The request was successfully received, understood, and accepted
    - 3xx (Redirection): Further action needs to be taken in order to complete the request
    - 4xx (Client Error): The request contains bad syntax or cannot be fulfilled
    - 5xx (Server Error): The server failed to fulfill an apparently valid request
- HTTP response status codes indicate whether or not a specific HTTP request has been successfully completed
- For a get request, 200 code refers to successful request, meaning the server processed the request and returned a response back to the client without any errors
- 500 http status refers to an internal server error which means that the request is valid, but an error occured in sending the response e.g. database issues, server-side codes, or server problems 
 */

//[SECTION] Enroll a user to a course
/*
    Steps:
    1. Retrieve the user's id
    2. Change the password to an empty string to hide the password
    3. Return the updated user record
*/

module.exports.enroll = (req, res) => {

	// The user's id from the decoded token after verify()
	console.log(req.user.id);
	// The course from our request body
	console.log(req.body.enrolledCourses);

	if(req.user.isAdmin){

		return res.status(403).send(false);

	}

	let newEnrollment = new Enrollment({

		userId: req.user.id,
		enrolledCourses: req.body.enrolledCourses,
		totalPrice: req.body.totalPrice

	});

	return newEnrollment.save()
			.then(enrolled => res.status(201).send(enrolled))
			.catch(err => res.status(500).send(err));
}

//[SECTION] Get enrollments
/*
    Steps:
    1. Use the mongoose method "find" to retrieve all enrollments for the logged in user
    2. If no enrollments are found, return a 404 error. Else return a 200 status and the enrollment record
*/
module.exports.getEnrollments = (req, res) => {
    return Enrollment.find({userId : req.user.id})
        .then(enrollments => {
            if (enrollments.length > 0) {
                return res.status(200).send(enrollments);
            }
            return res.status(404).send(false);
        })
        .catch(err => res.status(500).send(err));
};


// Function to reset the password
module.exports.resetPassword = async (req, res) => {
  try {

  	console.log(req.body);

    const { newPassword } = req.body;
    const { id } = req.user; // Extracting user ID from the authorization header

    // Hashing the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Updating the user's password in the database
    await User.findByIdAndUpdate(id, { password: hashedPassword });

    // Sending a success response
    res.status(200).json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }

};


// Controller function to update the user profile
module.exports.updateProfile = async (req, res) => {
  try {

  	console.log(req.body);
  	console.log(req.user);

    // Get the user ID from the authenticated token
    const userId = req.user.id;

    // Retrieve the updated profile information from the request body
    const { firstName, lastName, mobileNo } = req.body;

    // Update the user's profile in the database
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { firstName, lastName, mobileNo },
      { new: true }
    );

    res.json(updatedUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to update profile' });
  }
};

// Function to update another user as an admin
module.exports.updateAdmin = async (req, res) => {
    try {
        // Check if the requesting user has admin privileges
        const requestingUser = req.user; 
        if (!requestingUser || !requestingUser.isAdmin) {
            return res.status(403).json({ error: 'Unauthorized: Admin privileges required.' });
        }

        // Extract user ID from the request body
        const userIdToUpdate = req.body.userId;
        if (!userIdToUpdate) {
            return res.status(400).json({ error: 'User ID is required in the request body.' });
        }

        // Retrieve the user to be updated from the database
        const userToUpdate = await User.findById(userIdToUpdate);
        if (!userToUpdate) {
            return res.status(404).json({ error: 'User not found.' });
        }

        // Save the updated user to the database
        await userToUpdate.save();

        // Return success message
        res.json({ message: 'User updated successfully.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error.' });
    }
};

module.exports.updateEnrollmentStatus = async (req, res) => {
    try {
        // Check if the requesting user has admin privileges
        const requestingUser = req.user; 
        if (!requestingUser || !requestingUser.isAdmin) {
            return res.status(403).json({ error: 'Unauthorized: Admin privileges required.' });
        }

        // Extract data from the request body
        const userId = req.body.userId;
        const courseId = req.body.courseId;
        const newStatus = req.body.enrollmentStatus;

        // Validate that userId, courseId, and newStatus are provided
        if (!userId || !courseId || !newStatus) {
            return res.status(400).json({ error: 'userId, courseId, and enrollmentStatus are required in the request body.' });
        }

        // Retrieve the user from the database
        const userToUpdate = await Enrollment.findById(userId);
        if (!userToUpdate) {
            return res.status(404).json({ error: 'User not found.' });
        }

        // Check if the course is already present in the user's enrolled courses
        const courseIndex = userToUpdate.enrolledCourses.findIndex(course => course.courseId == courseId);

        // If the course is found, update the status
        if (courseIndex !== -1) {
            userToUpdate.status = newStatus;
        } else {
            // If the course is not found, add it to the enrolledCourses array with the new status
            userToUpdate.enrolledCourses.push({
                courseId: courseId,
                status: newStatus
            });
        }

        // Save the updated user to the database
        await userToUpdate.save();

        // Return success message
        res.json({ message: 'Enrollment status updated successfully.' }, );
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error.' });
    }
};