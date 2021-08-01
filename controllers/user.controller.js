const UserModel = require('../models/user.model');
const sha256 = require('sha256'); // hash password

module.exports = {
	get: async (req, res) => {
		const query = req.query || {};
		let users;
		try {
			users = await UserModel.find(query).select('_id firstName lastName date_of_birth gender email role username');
		} catch (err) {
			return res.status(201).json({error: err});
		}
		return res.json({users});
	},
	post: async (req, res) => {
		let user = new UserModel({
			firstName: req.body.firstName,
			lastName: req.body.lastName,
			full_name: req.body.lastName + ' ' + req.body.firstName,
			date_of_birth: req.body.date_of_birth,
			gender: req.body.gender,
			email: req.body.email,
			role: req.body.role,
			username: req.body.username,
			password: req.body.password && sha256(req.body.password),
		});
		try {
			await user.save();
		} catch (err) {
			return res.status(201).json({error: err});
		}
		user.password = undefined;
		return res.json({user});
	},
	put: async (req, res) => {
		let user;
		try {
			user = await UserModel.findById(req.params.id);
			if (!user) throw "Not Found User";
		} catch (err) {
			return res.status(404).json({error: err});
		}
		try {
			if (req.body.firstName){user.firstName = req.body.firstName}
			if (req.body.lastName) {user.lastName = req.body.lastName};
			if(req.body.firstName || req.body.lastName){user.full_name = user.lastName + ' ' + user.firstName}
			if (req.body.date_of_birth) {user.date_of_birth = req.body.date_of_birth};
			if (req.body.gender) {user.gender = req.body.gender};
			if (req.body.email) {user.email = req.body.email};
			if (req.body.role) {user.role = req.body.role};
			if (req.body.username) {user.username = req.body.username};
			if (req.body.password) {user.password = sha256(req.body.password)};
			await user.save();
		} catch (err) {
			return res.status(201).json({error: err});
		}
		user.password = undefined;
		return res.json({user});
	},
	delete: async (req, res) => {
		let user;
		try {
			await UserModel.findByIdAndDelete(req.params.id);
		} catch (err) {
			return res.status(201).json({error: err});
		}
		return res.json({result: "deleted successfully"});
	}
}