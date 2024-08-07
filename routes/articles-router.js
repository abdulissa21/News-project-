const articlesRouter = require("express").Router();
const {
	getArticles,
	getArticlesById,
	patchVotesByArticleId,
	postArticle,
	removeArticleById,
} = require("../controllers/articles.controllers");
const {
	getCommentsByArticleId,
	postComment,
} = require("../controllers/comments.controllers");

articlesRouter.route("/").get(getArticles).post(postArticle);

articlesRouter
	.route("/:article_id")
	.get(getArticlesById)
	.patch(patchVotesByArticleId)
	.delete(removeArticleById);

articlesRouter
	.route("/:article_id/comments")
	.get(getCommentsByArticleId)
	.post(postComment);

module.exports = { articlesRouter };
