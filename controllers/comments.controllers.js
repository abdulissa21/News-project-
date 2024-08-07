const {
	fetchCommentsByArticleId,
	insertComment,
	selectCommentById,
	updateVotesByCommentId,
	removeCommentById,
} = require("../models/comments.models");
const { fetchArticlesById } = require("../models/articles.models");

function getCommentsByArticleId(req, res, next) {
	const { article_id } = req.params;
	const { limit, p } = req.query;

	Promise.all([
		fetchCommentsByArticleId(article_id, limit, p),
		fetchArticlesById(article_id),
	])
		.then(([comments]) => {
			res.status(200).json({ comments: comments });
		})
		.catch((err) => {
			next(err);
		});
}

function postComment(req, res, next) {
	const { article_id } = req.params;
	const { username, body } = req.body;

	fetchArticlesById(article_id)
		.then((article) => {
			insertComment(article.article_id, username, body)
				.then((comment) => {
					res.status(201).json({ comment: comment });
				})
				.catch((err) => {
					next(err);
				});
		})
		.catch((err) => {
			next(err);
		});
}

function patchVotesByCommentId(req, res, next) {
	const { inc_votes } = req.body;
	const { comment_id } = req.params;

	Promise.all([
		updateVotesByCommentId(comment_id, inc_votes),
		selectCommentById(comment_id),
	])
		.then(([comment]) => {
			res.status(200).json({ comment: comment });
		})
		.catch((err) => {
			next(err);
		});
}

function deleteCommentById(req, res, next) {
	const { comment_id } = req.params;

	Promise.all([removeCommentById(comment_id), selectCommentById(comment_id)])
		.then(() => {
			res.status(204).send();
		})
		.catch((err) => {
			next(err);
		});
}

module.exports = {
	getCommentsByArticleId,
	postComment,
	patchVotesByCommentId,
	deleteCommentById,
};
