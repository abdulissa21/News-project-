const { fetchTopics, insertTopic } = require("../models/topics.models");

function getTopics(req, res, next) {
	fetchTopics()
		.then((topics) => {
			res.status(200).json({
				topics: topics,
			});
		})
		.catch((err) => {
			next(err);
		});
}

function postTopic(req, res, next) {
	const newTopic = req.body;

	insertTopic(newTopic)
		.then((newTopic) => {
			res.status(201).json({ topic: newTopic });
		})
		.catch((err) => {
			next(err);
		});
}

module.exports = { getTopics, postTopic };
