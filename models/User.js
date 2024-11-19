const mongoose = require("mongoose");mongoose

const userSchema = new mongoose.Schema({

	 firstName: {
		type: String, 
		required: [true, "firstName is required"]
	}, 
	lastName: {
		type: String, 
		required: [true, "lastName is required"]
	},
	email: {
		type: String,
		required: [true, "email is required"]
	},
	password: {
		type: String,
		required: [true, "password is required"]
	},
	isAdmin: {
		type: Boolean,
		default: false 
	},
	mobileNo: {
		type: Number,
		required: [true, "mobileNo is required"]
	}

});

module.exports = mongoose.model("User", userSchema);