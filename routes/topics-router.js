const topicsRouter = require("express").Router();
const { getTopics, postTopic } = require("../controllers/topics.controllers");

topicsRouter.route("/").get(getTopics).post(postTopic);

module.exports = { topicsRouter };
