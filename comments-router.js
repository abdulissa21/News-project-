const commentsRouter = require("express").Router();
const {
	patchVotesByCommentId,
	deleteCommentById,
} = require("../controllers/comments.controllers");

commentsRouter
	.route("/:comment_id")
	.patch(patchVotesByCommentId)
	.delete(deleteCommentById);

module.exports = { commentsRouter };
