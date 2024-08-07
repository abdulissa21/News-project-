const db = require("../db/connection");
const { convertTimestampToDate } = require("../db/seeds/utils");

function fetchArticles(
	topic,
	sort_by = "created_at",
	order = "desc",
	limit = 10,
	p = 1
) {
	if (!["asc", "desc"].includes(order)) {
		return Promise.reject({ status: 400, msg: "Invalid order value." });
	}

	if (!/^[\d]{1,}/.test(limit)) {
		return Promise.reject({
			status: 400,
			msg: "Invalid limit query value.",
		});
	}

	if (!/^[\d]{1,}/.test(p)) {
		return Promise.reject({
			status: 400,
			msg: "Invalid p query value.",
		});
	}

	if (
		![
			"article_id",
			"title",
			"topic",
			"author",
			"body",
			"created_at",
			"votes",
		].includes(sort_by)
	) {
		return Promise.reject({ status: 400, msg: "Invalid sort_by value." });
	}

	let sqlString = `SELECT a.*, 
	count(b.article_id)::int as comment_count FROM articles a
	LEFT JOIN comments b
	ON a.article_id = b.article_id `;

	if (topic) {
		sqlString += `WHERE a.topic = '${topic}' `;
	}

	sqlString += `GROUP BY a.article_id
	ORDER BY a.${sort_by} ${order} LIMIT ${limit} OFFSET ${limit * (p - 1)}`;

	return db.query(sqlString).then((articles) => {
		return articles.rows;
	});
}

function fetchArticlesById(article_id) {
	return db
		.query(
			`SELECT a.*, count(b.article_id)::int as comment_count FROM articles a 
			LEFT JOIN comments b
			ON a.article_id = b.article_id
			WHERE a. article_id = $1
			GROUP BY a.article_id`,
			[article_id]
		)
		.then((article) => {
			if (article.rows.length === 0) {
				return Promise.reject({
					status: 404,
					msg: "Article not found!",
				});
			}
			return article.rows[0];
		});
}

function updateArticlesById(article_id, inc_votes) {
	if (!inc_votes) {
		return Promise.reject({ status: 400, msg: "Bad request." });
	}

	return db
		.query(
			`UPDATE articles SET votes = votes + $1 
			WHERE article_id = $2 RETURNING *`,
			[inc_votes, article_id]
		)
		.then((updatedArticle) => {
			return updatedArticle.rows;
		});
}

function insertArticle(article) {
	const { created_at } = convertTimestampToDate({
		created_at: new Date().getTime(),
	});

	if (!article.article_img_url) {
		article.article_img_url =
			"https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700";
	}

	return db
		.query(
			`INSERT INTO articles (title, topic, author, body, created_at, votes, article_img_url)
		 VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
			[
				article.title,
				article.topic,
				article.author,
				article.body,
				created_at,
				0,
				article.article_img_url,
			]
		)
		.then((article) => {
			article.rows[0].comment_count = 0;
			return article.rows;
		});
}

function fetchTotalArticles(topic) {
	let sqlString = `SELECT COUNT(article_id) as total_count FROM articles `;

	if (topic) {
		sqlString += `WHERE topic='${topic}'`;
	}
	return db.query(sqlString).then((total_count) => {
		return total_count.rows[0].total_count;
	});
}

function deleteArticleById(article_id) {
	return db
		.query("DELETE FROM articles WHERE article_id=$1 RETURNING *;", [
			article_id,
		])
		.then((data) => {
			if (data.rows.length === 0) {
				return Promise.reject({
					status: 404,
					msg: "Article not found.",
				});
			}
			return data.rows;
		});
}

module.exports = {
	fetchArticles,
	fetchArticlesById,
	updateArticlesById,
	insertArticle,
	fetchTotalArticles,
	deleteArticleById,
};
