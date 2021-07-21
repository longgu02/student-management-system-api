const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
	first_name: {
		type: String,
		required: true
	},
	last_name: {
		type: String,
		required: true
	},
	date_of_birth: {
		type: Date,
	},
	gender: {
		type: String,
		enum: ['NAM', 'NỮ'],
	},
	email: {
		type: String
	},
	role: {
		type: String,
		enum: ['ADMIN', 'TEACHER', 'MENTOR', 'STUDENT']
	},
	username: {
		type: String,
		required: true,
		unique: true,
		index: true
	},
	password: {
		type: String,
		required: true
	}
})

module.exports = mongoose.model('User', userSchema);