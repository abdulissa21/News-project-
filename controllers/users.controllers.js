const { selectUsers, selectUserByUsername } = require("../models/users.models");

function getUsers(req, res, next) {
	selectUsers()
		.then((users) => {
			res.status(200).json({ users: users });
		})
		.catch((err) => {
			next(err);
		});
}

function getUserByUsername(req, res, next) {
	const { username } = req.params;

	selectUserByUsername(username)
		.then((user) => {
			res.status(200).json({ user: user });
		})
		.catch((err) => {
			next(err);
		});
}

module.exports = { getUsers, getUserByUsername };
