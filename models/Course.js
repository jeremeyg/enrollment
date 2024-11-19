const mongoose = require("mongoose");mongoose

const courseSchema = new mongoose.Schema({

	name: {
		type: String, 
		required: [true, "name is required"]
	}, 
	description: {
		type: String, 
		required: [true, "description is required"]
	},
	price: {
		type: Number,
		required: [true, "price is required"]
	},
	isActive: {
		type: Boolean,
		default: true
	},
	dateCreated: {
		type: Date,
		default: Date.now()
	}

});

module.exports = mongoose.model("Course", courseSchema);