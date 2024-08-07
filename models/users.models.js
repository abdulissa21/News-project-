const db = require("../db/connection");

function selectUsers() {
	return db.query("SELECT * FROM USERS").then((users) => {
		return users.rows;
	});
}

function selectUserByUsername(username) {
	return db
		.query("SELECT * FROM users WHERE username=$1", [username])
		.then((user) => {
			if (user.rows.length === 0) {
				return Promise.reject({
					status: 404,
					msg: "Username not found.",
				});
			}
			return user.rows;
		});
}

module.exports = { selectUsers, selectUserByUsername };
