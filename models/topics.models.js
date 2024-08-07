const db = require("../db/connection");

function fetchTopics(topic) {
	let sqlString = "SELECT * FROM topics ";

	if (topic) {
		sqlString += `where slug = '${topic}'`;
	}
	return db.query(sqlString).then((topics) => {
		if (topics.rows.length === 0) {
			return Promise.reject({ status: 404, msg: "Topic not found." });
		}
		return topics.rows;
	});
}

function insertTopic(newTopic) {
	return db
		.query(
			"INSERT INTO topics (slug,description) VALUES ($1, $2) RETURNING *;",
			[newTopic.slug, newTopic.description]
		)
		.then((newTopic) => {
			return newTopic.rows;
		});
}

module.exports = { fetchTopics, insertTopic };
