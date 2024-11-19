//[SECTION] Dependencies and Modules
const Course = require("../models/Course");
const User = require("../models/User");
const Enrollment = require("../models/Enrollment");

//[SECTION] Create a course
/*
	Steps: 
	1. Instantiate a new object using the Course model and the request body data
	2. Save the record in the database using the mongoose method "save"
	3. Use the "then" method to send a response back to the client appliction based on the result of the "save" method
*/
module.exports.addCourse = (req, res) => {

    //[Section] Use Promise.catch()
    /*
	- Promise-based methods return "Promises" which can be chained with a .catch() method to handle any errors that occur during execution. This method allows you to handle errors in a more declarative way and can make your code more readable.
	- Using .catch() is considered a best practice for handling errors within JavaScript Promise blocks. (A Promise in JavaScript represents the eventual completion or failure of an asynchronous operation along with its resulting value.)
	- Because .then() operates asynchronously, we utilize .catch() exclusively to handle any errors that may arise from promise resolution.
    */

	// Creates a variable "newCourse" and instantiates a new "Course" object using the mongoose model
	// Uses the information from the request body to provide all the necessary information
	try { 

		let newCourse = new Course({
			name : req.body.name,
			description : req.body.description,
			price : req.body.price
		});

		Course.findOne({ name: req.body.name })
			.then(existingCourse => {

				if(existingCourse){
					// Sent { error: 'Course already exists' }
					// Notice that we didn't response directly in string, instead we added an object with a value of a string. This is a proper response from API to Client. Direct string will only cause an error when connecting it to your frontend.
					// using res.send({ key: value }) is a common and appropriate way to structure a response from an API to the client. This approach allows you to send structured data back to the client in the form of a JSON object, where "key" represents a specific piece of data or a property, and "value" is the corresponding value associated with that key.
					return res.status(409).send({ error: "Course already exists"});
				}

				// Saves the created object to our database
				return newCourse.save()
						.then(savedCourse => res.status(201).send({ savedCourse }))
						// Error handling is done using .catch() to capture any errors that occur during the course save operation.
						// .catch(err => err) captures the error but does not take any action, it's only capturing the error to pass it on to the next .then() or .catch() method in the chain. Postman is waiting for a response to be sent back to it but is not receiving anything.
						// .catch.catch(err => res.send(err)) captures the error and takes action by sending it back to the client/Postman with the use of "res.send"
						.catch(err => {

							console.error("Error in saving the course:", err);

							return res.status(500).send({ error: "Failed to save the course"})

						});

			}).catch(err => {

				console.error("Error in finding course: ", err);

				return res.status(500).send({ message: "Error finding the course" });

			});

	} catch(err) {

		 console.error("Error in finding course: ", err);

		 return res.status(500).send({ message: "Error in getting the variables" });

	}
		
	
}; 


//[SECTION] Retrieve all courses
/*
	Steps: 
	1. Retrieve all courses using the mongoose "find" method
	2. Use the "then" method to send a response back to the client appliction based on the result of the "find" method
*/
module.exports.getAllCourses = (req, res) => {

	return Course.find({})
	.then(courses => {

		if(courses.length > 0){
		    return res.status(200).send({ courses });
		}
		else{
		    // 200 is a result of a successful request, even if the response returned no record/content
		    return res.status(200).send({ message: 'No courses found.' });
		}

	})
	.catch(err => {

		console.error("Error in finding all courses", err);

		return res.status(500).send({ error: "Error finding courses"});

	});

};

/*
	Update the "getAllActive" course controller function. Check if the request finds any course that has "true" value for the "isActive" property in the database. if it does, send the result, if it doesn't, send a message "There are no active courses at the moment"
*/
module.exports.getAllActive = (req, res) => {

	Course.find({ isActive: true })
	.then(courses => {
		// if the courses is not null
		if (courses.length > 0){
		    // send the courses as a response
		    return res.status(200).send({ courses });
		}
		// if there are no results found
		else {
		    // send the message as the response
		    return res.status(200).send({message: "There are no courses at the moment."})
		}
	})
	.catch(err => {

		console.error("Error in finding active courses: ", err);
		return res.status(500).send({ error: "Error in finding active courses"})

	});

};

module.exports.getCourse = (req, res) => {
	const courseId = req.params.courseId;

	Course.findById(courseId)
	.then(course => {
		if (!course) {
			return res.status(404).send({ error: 'Course not found' });
		}
		return res.status(200).send({ course });
	})
	.catch(err => {
		console.error("Error in fetching the course: ", err)
		return res.status(500).send({ error: 'Failed to fetch course' });
	})
};

//[SECTION] Update a course
/*
	Steps: 
	1. Create an object containing the data from the request body
	2. Retrieve and update a course using the mongoose "findByIdAndUpdate" method, passing the ID of the record to be updated as the first argument and an object containing the updates to the course
	3. Use the "then" method to send a response back to the client appliction based on the result of the "find" method
*/
module.exports.updateCourse = (req, res)=>{

	// Made variable names more descriptive to enhance code readability.
	const courseId = req.params.courseId;

	let updatedCourse = {
        name: req.body.name,
        description: req.body.description,
        price: req.body.price
    }

    // findByIdandUpdate() finds the the document in the db and updates it automatically
    // req.body is used to retrieve data from the request body, commonly through form submission
    // req.params is used to retrieve data from the request parameters or the url
    // req.params.courseId - the id used as the reference to find the document in the db retrieved from the url
    // updatedCourse - the updates to be made in the document
    return Course.findByIdAndUpdate(courseId, updatedCourse, {new: true})
    .then(course => {
        if (course) {

            return res.status(200).send({ 
					message: 'Course updated successfully', 
					updatedCourse: course 
				});
        } else {

             return res.status(404).send({ error: 'Course not found' });
        }

        /*if(!course){

        	return res.status(404).send({ error: 'Course not found' });
        }

        return res.status(200).send({ 
					message: 'Course updated successfully', 
					updatedCourse: course 
				});*/
    })
    .catch(err => {

    	console.error("Error in updating a course: ", err);

    	return res.status(500).send({ error: 'Error in updating a course.' });
    })
};

//[SECTION] Archive a course
/*
	Steps: 
	1. Create an object and with the keys to be updated in the record
	2. Retrieve and update a course using the mongoose "findByIdAndUpdate" method, passing the ID of the record to be updated as the first argument and an object containing the updates to the course
	3. If a course is updated send a response of "true" else send "false"
	4. Use the "then" method to send a response back to the client appliction based on the result of the "findByIdAndUpdate" method
*/
module.exports.archiveCourse = (req, res) => {

    let updateActiveField = {
        isActive: false
    }
    
    return Course.findByIdAndUpdate(req.params.courseId, updateActiveField, {new: true})
    .then(archiveCourse => {
        if (!archiveCourse) {
        	return res.status(404).send({ error: 'Course not found' });
        }
        return res.status(200).send({ 
        	message: 'Course archived successfully', 
        	archiveCourse: archiveCourse 
        });
    })
    .catch(err => {
    	console.error("Error in archiving a course: ", err)
    	return res.status(500).send({ error: 'Failed to archive course' })
    });

};

//[SECTION] Activate a course
/*
	Steps: 
	1. Create an object and with the keys to be updated in the record
	2. Retrieve and update a course using the mongoose "findByIdAndUpdate" method, passing the ID of the record to be updated as the first argument and an object containing the updates to the course
	3. If the user is an admin, update a course else send a response of "false"
	4. If a course is updated send a response of "true" else send "false"
	5. Use the "then" method to send a response back to the client appliction based on the result of the "findByIdAndUpdate" method
*/
module.exports.activateCourse = (req, res) => {

    let updateActiveField = {
        isActive: true
    }
    
    return Course.findByIdAndUpdate(req.params.courseId, updateActiveField, {new: true})
    .then(activateCourse => {
        if (!activateCourse) {
        	return res.status(404).send({ error: 'Course not found' });
        }
        return res.status(200).send({ 
        	message: 'Course activated successfully', 
        	activateCourse: activateCourse
        });
    })
    .catch(err => {
    	console.error("Error in activating a course: ", err)
    	return res.status(500).send({ error: 'Failed to activating a course' })
    });
};

/*
// Controller action to search for courses by course name
module.exports.searchCoursesByName = async (req, res) => {
  try {

  	console.log(req.body);

    const { courseName } = req.body;

    // Use a regular expression to perform a case-insensitive search
    const courses = await Course.find({
      name: { $regex: courseName, $options: 'i' }
    });

    res.json(courses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};*/

module.exports.searchCoursesByPriceRange = async (req, res) => {
    try {
        // Extract minPrice and maxPrice from the request body
        const minPrice = req.body.minPrice;
        const maxPrice = req.body.maxPrice;

        // Validate that both minPrice and maxPrice are provided
        if (!minPrice || !maxPrice) {
            return res.status(400).json({ error: 'Both minPrice and maxPrice are required in the request body.' });
        }

        // Query the database for courses within the specified price range
        const courses = await Course.find({
            price: { $gte: minPrice, $lte: maxPrice }
        });

        // Return the array of courses
        res.json(courses);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error.' });
    }
};