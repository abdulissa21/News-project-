const app = require("../app");
const request = require("supertest");
const db = require("../db/connection.js");
const seed = require("../db/seeds/seed.js");
const data = require("../db/data/test-data");
const { convertTimestampToDate } = require("../db/seeds/utils");

beforeEach(() => seed(data));
afterAll(() => db.end());

describe("/api", () => {
	test("GET STATUS 200: should return an object describing all the available endpoinst on the API.", () => {
		const endpoints = require("../endpoints.json");
		return request(app)
			.get("/api")
			.expect(200)
			.then((apiEndpoints) => {
				expect(apiEndpoints.body.endpoints).toEqual(endpoints);
			});
	});
});

describe("/api/topics", () => {
	test("GET STATUS 200: should return an array of all topic objects with slug and description properties.", () => {
		return request(app)
			.get("/api/topics")
			.expect(200)
			.then((topics) => {
				expect(topics.body.topics.length).toBe(3);
				topics.body.topics.forEach((topic) => {
					expect(typeof topic.description).toBe("string");
					expect(typeof topic.slug).toBe("string");
				});
				expect(topics.body.topics[0]).toMatchObject({
					description: "The man, the Mitch, the legend",
					slug: "mitch",
				});
			});
	});
	test("GET STATUS 400: should return appropriate message for the client when requested an invalid endpoint", () => {
		return request(app)
			.get("/api/t0pics")
			.expect(404)
			.then((response) => {
				expect(response.body.status).toBe(404);
				expect(response.body.msg).toBe("Invalid endpoint.");
			});
	});
});

describe("/api/articles", () => {
	test("GET STATUS 200: should return an array of articles objects with their respective properties.", () => {
		return request(app)
			.get("/api/articles")
			.expect(200)
			.then((articles) => {
				expect(articles.body.articles.length).toBeGreaterThan(9);
				expect(articles.body.articles[0]).toMatchObject({
					article_id: 3,
					author: "icellusedkars",
					title: "Eight pug gifs that remind me of mitch",
					topic: "mitch",
					created_at: convertTimestampToDate(1604394720000),
					votes: 0,
					article_img_url:
						"https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
					comment_count: 2,
				});
				expect(articles.body.articles).toBeSortedBy("created_at", {
					descending: true,
				});
			});
	});

	test("GET STATUS 200: Should return an array of articles sorted by the given column on query sort_by:", () => {
		return request(app)
			.get("/api/articles?sort_by=votes")
			.expect(200)
			.then((articles) => {
				expect(articles.body.articles.length).toBeGreaterThan(9);
				articles.body.articles.forEach((article) => {
					expect(article).toMatchObject({
						article_id: expect.any(Number),
						author: expect.any(String),
						title: expect.any(String),
						topic: expect.any(String),
						created_at: expect.any(String),
						votes: expect.any(Number),
						article_img_url: expect.any(String),
						comment_count: expect.any(Number),
					});
				});
				expect(articles.body.articles).toBeSortedBy("votes", {
					descending: true,
				});
			});
	});

	test("GET STATUS 200: Should return an array of articles sorted by ascending or descending order acording to the query order:", () => {
		return request(app)
			.get("/api/articles?order=asc")
			.expect(200)
			.then((articles) => {
				expect(articles.body.articles.length).toBeGreaterThan(9);
				articles.body.articles.forEach((article) => {
					expect(article).toMatchObject({
						article_id: expect.any(Number),
						author: expect.any(String),
						title: expect.any(String),
						topic: expect.any(String),
						created_at: expect.any(String),
						votes: expect.any(Number),
						article_img_url: expect.any(String),
						comment_count: expect.any(Number),
					});
				});
				expect(articles.body.articles).toBeSortedBy("created_at");
			});
	});

	test("GET STATUS 200: Should consider all queries and return an array of articles sorted and filtered accordingly when passed 2 or more queries:", () => {
		return request(app)
			.get("/api/articles?topic=mitch&sort_by=author&order=asc")
			.expect(200)
			.then((articles) => {
				expect(articles.body.articles.length).toBeGreaterThan(9);
				articles.body.articles.forEach((article) => {
					expect(article).toMatchObject({
						article_id: expect.any(Number),
						author: expect.any(String),
						title: expect.any(String),
						topic: "mitch",
						created_at: expect.any(String),
						votes: expect.any(Number),
						article_img_url: expect.any(String),
						comment_count: expect.any(Number),
					});
				});
				expect(articles.body.articles).toBeSortedBy("author");
			});
	});

	test("GET STATUS 200: Should return an array of articles objects matching the given topic. (Query)", () => {
		return request(app)
			.get("/api/articles?topic=cats")
			.expect(200)
			.then((articles) => {
				expect(articles.body.articles.length).toBe(1);
				expect(articles.body.articles[0]).toMatchObject({
					article_id: 5,
					author: "rogersop",
					title: "UNCOVERED: catspiracy to bring down democracy",
					topic: "cats",
					created_at: expect.any(String),
					votes: 0,
					article_img_url:
						"https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
					comment_count: 2,
				});
			});
	});
	test("GET STATUS 200: Should return an empty array if the given topic exists in the database, but have no articles.(Query)", () => {
		return request(app)
			.get("/api/articles?topic=paper")
			.expect(200)
			.then((articles) => {
				expect(articles.body.articles.length).toBe(0);
			});
	});
	test("GET STATUS 200: Should ignore the query and return all the articles if passed an invalid query.", () => {
		return request(app)
			.get("/api/articles?topicc=cats")
			.expect(200)
			.then((articles) => {
				expect(articles.body.articles.length).toBeGreaterThan(9);
				articles.body.articles.forEach((article) => {
					expect(article).toMatchObject({
						article_id: expect.any(Number),
						author: expect.any(String),
						title: expect.any(String),
						topic: expect.any(String),
						created_at: expect.any(String),
						votes: expect.any(Number),
						article_img_url: expect.any(String),
						comment_count: expect.any(Number),
					});
				});
				expect(articles.body.articles).toBeSortedBy("created_at", {
					descending: true,
				});
			});
	});
	test("GET STATUS 200: Should consider the query limit to limit the number of returned articles for pagination.", () => {
		return request(app)
			.get("/api/articles?limit=5")
			.expect(200)
			.then((articles) => {
				expect(articles.body.total_count).toBe(13);
				expect(articles.body.articles.length).toBe(5);
				articles.body.articles.forEach((article) => {
					expect(article).toMatchObject({
						article_id: expect.any(Number),
						author: expect.any(String),
						title: expect.any(String),
						topic: expect.any(String),
						created_at: expect.any(String),
						votes: expect.any(Number),
						article_img_url: expect.any(String),
						comment_count: expect.any(Number),
					});
				});
				expect(articles.body.articles).toBeSortedBy("created_at", {
					descending: true,
				});
			});
	});
	test("GET STATUS 200: Should consider the query limit to limit the number of returned articles for pagination, even when applied other filter", () => {
		return request(app)
			.get("/api/articles?limit=5&topic=mitch")
			.expect(200)
			.then((articles) => {
				expect(articles.body.total_count).toBe(12);
				expect(articles.body.articles.length).toBe(5);
				articles.body.articles.forEach((article) => {
					expect(article).toMatchObject({
						article_id: expect.any(Number),
						author: expect.any(String),
						title: expect.any(String),
						topic: "mitch",
						created_at: expect.any(String),
						votes: expect.any(Number),
						article_img_url: expect.any(String),
						comment_count: expect.any(Number),
					});
				});
				expect(articles.body.articles).toBeSortedBy("created_at", {
					descending: true,
				});
			});
	});
	test("GET STATUS 200: Should ignore the query limit if filtered by a topic that have 0 articles.", () => {
		return request(app)
			.get("/api/articles?limit=5&topic=paper")
			.expect(200)
			.then((articles) => {
				expect(articles.body.total_count).toBe(0);
				expect(articles.body.articles.length).toBe(0);
			});
	});
	test("GET STATUS 200: Should consider all queries with limit and return an array of articles sorted and filtered accordingly when passed 2 or more queries:", () => {
		return request(app)
			.get("/api/articles?topic=mitch&sort_by=author&order=asc&limit=4")
			.expect(200)
			.then((articles) => {
				expect(articles.body.total_count).toBe(12);
				expect(articles.body.articles.length).toBe(4);
				articles.body.articles.forEach((article) => {
					expect(article).toMatchObject({
						article_id: expect.any(Number),
						author: expect.any(String),
						title: expect.any(String),
						topic: "mitch",
						created_at: expect.any(String),
						votes: expect.any(Number),
						article_img_url: expect.any(String),
						comment_count: expect.any(Number),
					});
				});
				expect(articles.body.articles).toBeSortedBy("author");
			});
	});
	test("GET STATUS 200: Should consider the query p to set the starting page of the returned articles for pagination.", () => {
		return request(app)
			.get("/api/articles?limit=5&p=2")
			.expect(200)
			.then((articles) => {
				expect(articles.body.total_count).toBe(13);
				expect(articles.body.articles.length).toBe(5);
				articles.body.articles.forEach((article) => {
					expect(article).toMatchObject({
						article_id: expect.any(Number),
						author: expect.any(String),
						title: expect.any(String),
						topic: expect.any(String),
						created_at: expect.any(String),
						votes: expect.any(Number),
						article_img_url: expect.any(String),
						comment_count: expect.any(Number),
					});
				});
				expect(articles.body.articles).toBeSortedBy("created_at", {
					descending: true,
				});
			});
	});
	test("GET STATUS 200: Should consider the query p and return 0 articles if P > number of pages needed to show all articles.", () => {
		return request(app)
			.get("/api/articles?limit=5&p=4")
			.expect(200)
			.then((articles) => {
				expect(articles.body.total_count).toBe(13);
				expect(articles.body.articles.length).toBe(0);
				articles.body.articles.forEach((article) => {
					expect(article).toMatchObject({
						article_id: expect.any(Number),
						author: expect.any(String),
						title: expect.any(String),
						topic: expect.any(String),
						created_at: expect.any(String),
						votes: expect.any(Number),
						article_img_url: expect.any(String),
						comment_count: expect.any(Number),
					});
				});
				expect(articles.body.articles).toBeSortedBy("created_at", {
					descending: true,
				});
			});
	});
	test("GET STATUS 400: Shoud return an appropriate message when passed an invalid sort_by query: ", () => {
		return request(app)
			.get("/api/articles?sort_by=downvotes")
			.expect(400)
			.then((response) => {
				expect(response.body.msg).toBe("Invalid sort_by value.");
			});
	});
	test("GET STATUS 400: Shoud return an appropriate message when passed an invalid limit query value: ", () => {
		return request(app)
			.get("/api/articles?limit=B10")
			.expect(400)
			.then((response) => {
				expect(response.body.msg).toBe("Invalid limit query value.");
			});
	});
	test("GET STATUS 400: Shoud return an appropriate message when passed an invalid p query value: ", () => {
		return request(app)
			.get("/api/articles?p=B10")
			.expect(400)
			.then((response) => {
				expect(response.body.msg).toBe("Invalid p query value.");
			});
	});
	test("GET STATUS 400: Shoud return an appropriate message when passed an invalid order query: ", () => {
		return request(app)
			.get("/api/articles?order=ascending")
			.expect(400)
			.then((response) => {
				expect(response.body.msg).toBe("Invalid order value.");
			});
	});
	test("GET STATUS 404: Should return an appropriate message if the passed topic in the query does not exists.", () => {
		return request(app)
			.get("/api/articles?topic=football")
			.expect(404)
			.then((response) => {
				expect(response.body.msg).toBe("Topic not found.");
			});
	});
	test("GET STATUS 404: Should return appropriate message for the client when requested an invalid endpoint", () => {
		return request(app)
			.get("/api/art1cles")
			.expect(404)
			.then((response) => {
				expect(response.body.status).toBe(404);
				expect(response.body.msg).toBe("Invalid endpoint.");
			});
	});
});

describe("/api/articles/:article_id", () => {
	test("GET STATUS 200: should return an article object for a given id.", () => {
		return request(app)
			.get("/api/articles/1")
			.expect(200)
			.then((article) => {
				expect(article.body.article).toMatchObject({
					title: "Living in the shadow of a great man",
					topic: "mitch",
					author: "butter_bridge",
					body: "I find this existence challenging",
					created_at: convertTimestampToDate(1594329060000),
					votes: 100,
					article_img_url:
						"https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
				});
			});
	});

	test("GET STATUS 404: should return an appropriate response if given an ID that is not in the database.", () => {
		return request(app)
			.get("/api/articles/9999")
			.expect(404)
			.then((response) => {
				expect(response.body.status).toBe(404);
				expect(response.body.msg).toBe("Article not found!");
			});
	});

	test(`GET STATUS 400: should return an appropriate response if given an ID that is not in the database.
		This test is forcing a PSQL ERROR to be treated. (id out of the psql integer range)`, () => {
		return request(app)
			.get("/api/articles/999999999999999999")
			.expect(400)
			.then((response) => {
				expect(response.body.status).toBe(400);
				expect(response.body.msg).toBe("Bad request.");
			});
	});
	test(`GET STATUS 400: should return an appropriate response if given an ID that is not in the database.
		This test is forcing a PSQL ERROR to be treated. (invalid input syntax for type integer: "string")`, () => {
		return request(app)
			.get("/api/articles/ddd")
			.expect(400)
			.then((response) => {
				expect(response.body.status).toBe(400);
				expect(response.body.msg).toBe("Bad request.");
			});
	});
	test(`GET STATUS 400: should return an appropriate response if misstyped endpoint)`, () => {
		return request(app)
			.get("/api/article/1")
			.expect(404)
			.then((response) => {
				expect(response.body.status).toBe(404);
				expect(response.body.msg).toBe("Invalid endpoint.");
			});
	});
});

describe("/api/articles/:article_id/comments", () => {
	test("GET STATUS 200: should return an array of comments for the given article_id.", () => {
		return request(app)
			.get("/api/articles/1/comments")
			.expect(200)
			.then((comments) => {
				expect(comments.body.comments.length).toBeGreaterThan(9);
				comments.body.comments.forEach((comment) => {
					expect(comment).toMatchObject({
						comment_id: expect.any(Number),
						body: expect.any(String),
						votes: expect.any(Number),
						author: expect.any(String),
						article_id: expect.any(Number),
						created_at: expect.any(String),
					});
				});
				expect(comments.body.comments).toBeSortedBy("created_at", {
					descending: true,
				});
			});
	});
	test("GET STATUS 200: should consider limit query and return an array of comments for the given article_id limited by the query number.", () => {
		return request(app)
			.get("/api/articles/1/comments?limit=5")
			.expect(200)
			.then((comments) => {
				expect(comments.body.comments.length).toBe(5);
				comments.body.comments.forEach((comment) => {
					expect(comment).toMatchObject({
						comment_id: expect.any(Number),
						body: expect.any(String),
						votes: expect.any(Number),
						author: expect.any(String),
						article_id: expect.any(Number),
						created_at: expect.any(String),
					});
				});
				expect(comments.body.comments).toBeSortedBy("created_at", {
					descending: true,
				});
			});
	});
	test("GET STATUS 200: should consider limit query and p query return an array of comments for the given article_id limited by the query number, starting from p.", () => {
		return request(app)
			.get("/api/articles/1/comments?limit=8&p=2")
			.expect(200)
			.then((comments) => {
				expect(comments.body.comments.length).toBe(3);
				comments.body.comments.forEach((comment) => {
					expect(comment).toMatchObject({
						comment_id: expect.any(Number),
						body: expect.any(String),
						votes: expect.any(Number),
						author: expect.any(String),
						article_id: expect.any(Number),
						created_at: expect.any(String),
					});
				});
				expect(comments.body.comments).toBeSortedBy("created_at", {
					descending: true,
				});
			});
	});
	test("GET STATUS 200: Should return and empty array if the p query is > the number of pages to show all articles.", () => {
		return request(app)
			.get("/api/articles/1/comments?p=3")
			.expect(200)
			.then((comments) => {
				expect(comments.body.comments.length).toBe(0);
				comments.body.comments.forEach((comment) => {
					expect(comment).toMatchObject({
						comment_id: expect.any(Number),
						body: expect.any(String),
						votes: expect.any(Number),
						author: expect.any(String),
						article_id: expect.any(Number),
						created_at: expect.any(String),
					});
				});
				expect(comments.body.comments).toBeSortedBy("created_at", {
					descending: true,
				});
			});
	});
	test("GET STATUS 200: shoud return an empty array for an article that have no comments.", () => {
		return request(app)
			.get("/api/articles/2/comments")
			.expect(200)
			.then((comments) => {
				expect(comments.body.comments.length).toBe(0);
			});
	});
	test("GET STATUS 400: Shoud return an appropriate message when passed an invalid limit query value: ", () => {
		return request(app)
			.get("/api/articles/1/comments?limit=B10")
			.expect(400)
			.then((response) => {
				expect(response.body.msg).toBe("Invalid limit query value.");
			});
	});
	test("GET STATUS 400: Shoud return an appropriate message when passed an invalid p query value: ", () => {
		return request(app)
			.get("/api/articles/1/comments?p=B10")
			.expect(400)
			.then((response) => {
				expect(response.body.msg).toBe("Invalid p query value.");
			});
	});
	test("GET STATUS 404: should return an appropriate message if the article does not exist.", () => {
		return request(app)
			.get("/api/articles/9999/comments")
			.expect(404)
			.then((response) => {
				expect(response.body.status).toBe(404);
				expect(response.body.msg).toBe("Article not found!");
			});
	});
	test(`GET STATUS 400: should return an appropriate response if given an ID that is not in the database.
		This test is forcing a PSQL ERROR to be treated. (id out of the psql integer range)`, () => {
		return request(app)
			.get("/api/articles/999999999999999999/comments")
			.expect(400)
			.then((response) => {
				expect(response.body.status).toBe(400);
				expect(response.body.msg).toBe("Bad request.");
			});
	});
	test(`GET STATUS 400: should return an appropriate response if given an ID that is not in the database.
		This test is forcing a PSQL ERROR to be treated. (invalid input syntax for type integer: "string")`, () => {
		return request(app)
			.get("/api/articles/ddd/comments")
			.expect(400)
			.then((response) => {
				expect(response.body.status).toBe(400);
				expect(response.body.msg).toBe("Bad request.");
			});
	});
	test(`GET STATUS 404: should return an appropriate response if misstyped endpoint)`, () => {
		return request(app)
			.get("/api/articles/1/comm3nts")
			.expect(404)
			.then((response) => {
				expect(response.body.status).toBe(404);
				expect(response.body.msg).toBe("Invalid endpoint.");
			});
	});
});

describe("POST - /api/articles/:article_id/comments", () => {
	test("POST STATUS 201: Should post a comment in the database and return the posted comment.", () => {
		const newPost = {
			username: "icellusedkars",
			body: "This is the icellusedkars new comment!",
		};

		return request(app)
			.post("/api/articles/2/comments")
			.send(newPost)
			.expect(201)
			.then((comment) => {
				expect(comment.body.comment.length).toBe(1);
				expect(comment.body.comment[0]).toMatchObject({
					comment_id: 19,
					body: "This is the icellusedkars new comment!",
					article_id: 2,
					author: "icellusedkars",
					votes: 0,
					created_at: expect.any(String),
				});
			});
	});
	test("POST STATUS 201: Should ignore not needed keys on the body object, post a comment in the database and return the posted comment.", () => {
		const newPost = {
			username: "icellusedkars",
			body: "This is the icellusedkars new comment!",
			votes: 100,
		};

		return request(app)
			.post("/api/articles/2/comments")
			.send(newPost)
			.expect(201)
			.then((comment) => {
				expect(comment.body.comment.length).toBe(1);
				expect(comment.body.comment[0]).toMatchObject({
					comment_id: 19,
					body: "This is the icellusedkars new comment!",
					article_id: 2,
					author: "icellusedkars",
					votes: 0,
					created_at: expect.any(String),
				});
			});
	});
	test("POST STATUS 400: Should return an appropriate message when passed an incomplete body (No username)", () => {
		const newPost = {
			body: "This is the icellusedkars new comment!",
		};
		return request(app)
			.post("/api/articles/2/comments")
			.send(newPost)
			.expect(400)
			.then((response) => {
				expect(response.body.msg).toBe("Bad request.");
			});
	});
	test("POST STATUS 400: Should return an appropriate message when passed an incomplete body (No body)", () => {
		const newPost = {
			username: "icellusedkars",
		};
		return request(app)
			.post("/api/articles/2/comments")
			.send(newPost)
			.expect(400)
			.then((response) => {
				expect(response.body.msg).toBe("Bad request.");
			});
	});
	test("POST STATUS 400: Should return an appropriate message when passed an invalid article ID", () => {
		const newPost = {
			username: "icellusedkars",
			body: "This is the icellusedkars new comment!",
		};
		return request(app)
			.post("/api/articles/ddd/comments")
			.send(newPost)
			.expect(400)
			.then((response) => {
				expect(response.body.msg).toBe("Bad request.");
			});
	});
	test("POST STATUS 404: Should return an appropriate message when passed an inexistent article ID", () => {
		const newPost = {
			username: "icellusedkars",
			body: "This is the icellusedkars new comment!",
		};
		return request(app)
			.post("/api/articles/999/comments")
			.send(newPost)
			.expect(404)
			.then((response) => {
				expect(response.body.msg).toBe("Article not found!");
			});
	});
	test("POST STATUS 404: Should return an appropriate message when passed an inexistent username", () => {
		const newPost = {
			username: "Filipe",
			body: "This is the Filipe's new comment!",
		};
		return request(app)
			.post("/api/articles/2/comments")
			.send(newPost)
			.expect(404)
			.then((response) => {
				expect(response.body.msg).toBe("Username not found.");
			});
	});
});

describe("PATCH /api/articles/:article_id", () => {
	test("STATUS 200: Should update the article with the new quantity of votes passed in the body object", () => {
		const newVote = { inc_votes: 1 };

		return request(app)
			.patch("/api/articles/1")
			.send(newVote)
			.expect(200)
			.then((updatedArticle) => {
				expect(updatedArticle.body.article.length).toBe(1);
				expect(updatedArticle.body.article[0]).toMatchObject({
					article_id: 1,
					title: "Living in the shadow of a great man",
					topic: "mitch",
					author: "butter_bridge",
					body: "I find this existence challenging",
					created_at: expect.any(String),
					votes: 101,
					article_img_url:
						"https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
				});
			});
	});
	test("STATUS 200: Should update the article with the new quantity of votes passed in the body object (Testing for negative update)", () => {
		const newVote = { inc_votes: -50 };

		return request(app)
			.patch("/api/articles/1")
			.send(newVote)
			.expect(200)
			.then((updatedArticle) => {
				expect(updatedArticle.body.article.length).toBe(1);
				expect(updatedArticle.body.article[0]).toMatchObject({
					article_id: 1,
					title: "Living in the shadow of a great man",
					topic: "mitch",
					author: "butter_bridge",
					body: "I find this existence challenging",
					created_at: expect.any(String),
					votes: 50,
					article_img_url:
						"https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
				});
			});
	});
	test("STATUS 200: Should update the article votes to negative numbers when trying to decrease more than the current number of votes", () => {
		const newVote = { inc_votes: -110 };

		return request(app)
			.patch("/api/articles/1")
			.send(newVote)
			.expect(200)
			.then((updatedArticle) => {
				expect(updatedArticle.body.article.length).toBe(1);
				expect(updatedArticle.body.article[0]).toMatchObject({
					article_id: 1,
					title: "Living in the shadow of a great man",
					topic: "mitch",
					author: "butter_bridge",
					body: "I find this existence challenging",
					created_at: expect.any(String),
					votes: -10,
					article_img_url:
						"https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
				});
			});
	});
	test("STATUS 200: Should ignore unecessary keys on the body object and still update votes", () => {
		const newVote = { inc_votes: 1, username: "Filipe" };

		return request(app)
			.patch("/api/articles/1")
			.send(newVote)
			.expect(200)
			.then((updatedArticle) => {
				expect(updatedArticle.body.article.length).toBe(1);
				expect(updatedArticle.body.article[0]).toMatchObject({
					article_id: 1,
					title: "Living in the shadow of a great man",
					topic: "mitch",
					author: "butter_bridge",
					body: "I find this existence challenging",
					created_at: expect.any(String),
					votes: 101,
					article_img_url:
						"https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
				});
			});
	});
	test("STATUS 200: Should consider string '2' for inc_votes and still update the article.", () => {
		const newVote = { inc_votes: "2" };

		return request(app)
			.patch("/api/articles/1")
			.send(newVote)
			.expect(200)
			.then((updatedArticle) => {
				expect(updatedArticle.body.article.length).toBe(1);
				expect(updatedArticle.body.article[0]).toMatchObject({
					article_id: 1,
					title: "Living in the shadow of a great man",
					topic: "mitch",
					author: "butter_bridge",
					body: "I find this existence challenging",
					created_at: expect.any(String),
					votes: 102,
					article_img_url:
						"https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
				});
			});
	});
	test("STATUS 404: Should return appropriate message for an inexistent article ID", () => {
		const newVote = { inc_votes: 1 };

		return request(app)
			.patch("/api/articles/999")
			.send(newVote)
			.expect(404)
			.then((response) => {
				expect(response.body.status).toBe(404);
				expect(response.body.msg).toBe("Article not found!");
			});
	});
	test("STATUS 400: Should return appropriate message for an invalid id type", () => {
		const newVote = { inc_votes: 1 };

		return request(app)
			.patch("/api/articles/ddd")
			.send(newVote)
			.expect(400)
			.then((response) => {
				expect(response.body.status).toBe(400);
				expect(response.body.msg).toBe("Bad request.");
			});
	});
	test("STATUS 400: Should return appropriate message for an invalid inc_votes type on the body object", () => {
		const newVote = { inc_votes: "string" };

		return request(app)
			.patch("/api/articles/1")
			.send(newVote)
			.expect(400)
			.then((response) => {
				expect(response.body.status).toBe(400);
				expect(response.body.msg).toBe("Bad request.");
			});
	});
	test("STATUS 400: Should return appropriate message for an invalid body object", () => {
		const newVote = { update_votes: 1 };

		return request(app)
			.patch("/api/articles/1")
			.send(newVote)
			.expect(400)
			.then((response) => {
				expect(response.body.status).toBe(400);
				expect(response.body.msg).toBe("Bad request.");
			});
	});
});

describe("DELETE /api/comments/:comment_id", () => {
	test("STATUS 200: Shoud delete a given comment and respond with status 204 and no content.", () => {
		return request(app).delete("/api/comments/13").expect(204);
	});
	test("STATUS 404: Should return appropriate message when trying to remove an inexistent comment", () => {
		return request(app)
			.delete("/api/comments/99")
			.expect(404)
			.then((response) => {
				expect(response.body.msg).toBe("Comment not found.");
			});
	});
	test("STATUS 400: Should return appropriate message when pass an invalid id to be removed", () => {
		return request(app)
			.delete("/api/comments/ddd")
			.expect(400)
			.then((response) => {
				expect(response.body.status).toBe(400);
				expect(response.body.msg).toBe("Bad request.");
			});
	});
});

describe("PATCH /api/comments/:comment_id", () => {
	test("STATUS 200: Should update the number of votes for a comment based on the given body value:", () => {
		const newVotes = { inc_votes: 50 };

		return request(app)
			.patch("/api/comments/3")
			.send(newVotes)
			.expect(200)
			.then((comment) => {
				expect(comment.body.comment.length).toBe(1);
				expect(comment.body.comment[0]).toMatchObject({
					comment_id: 3,
					body: "Replacing the quiet elegance of the dark suit and tie with the casual indifference of these muted earth tones is a form of fashion suicide, but, uh, call me crazy — onyou it works.",
					article_id: 1,
					author: "icellusedkars",
					votes: 150,
					created_at: expect.any(String),
				});
			});
	});
	test("STATUS 200: Should update the number of votes for a comment based on the given body value: (Testing for negative updates)", () => {
		const newVotes = { inc_votes: -50 };

		return request(app)
			.patch("/api/comments/3")
			.send(newVotes)
			.expect(200)
			.then((comment) => {
				expect(comment.body.comment.length).toBe(1);
				expect(comment.body.comment[0]).toMatchObject({
					comment_id: 3,
					body: "Replacing the quiet elegance of the dark suit and tie with the casual indifference of these muted earth tones is a form of fashion suicide, but, uh, call me crazy — onyou it works.",
					article_id: 1,
					author: "icellusedkars",
					votes: 50,
					created_at: expect.any(String),
				});
			});
	});
	test("STATUS 200: Should update the number of votes for a comment based on the given body value: (Testing for votes being negative after the update)", () => {
		const newVotes = { inc_votes: -150 };

		return request(app)
			.patch("/api/comments/3")
			.send(newVotes)
			.expect(200)
			.then((comment) => {
				expect(comment.body.comment.length).toBe(1);
				expect(comment.body.comment[0]).toMatchObject({
					comment_id: 3,
					body: "Replacing the quiet elegance of the dark suit and tie with the casual indifference of these muted earth tones is a form of fashion suicide, but, uh, call me crazy — onyou it works.",
					article_id: 1,
					author: "icellusedkars",
					votes: -50,
					created_at: expect.any(String),
				});
			});
	});
	test("STATUS 200: Should ignore unecessary fields on the body and still update the comment votes.", () => {
		const newVotes = { inc_votes: 1, username: "Filipe" };

		return request(app)
			.patch("/api/comments/3")
			.send(newVotes)
			.expect(200)
			.then((comment) => {
				expect(comment.body.comment.length).toBe(1);
				expect(comment.body.comment[0]).toMatchObject({
					comment_id: 3,
					body: "Replacing the quiet elegance of the dark suit and tie with the casual indifference of these muted earth tones is a form of fashion suicide, but, uh, call me crazy — onyou it works.",
					article_id: 1,
					author: "icellusedkars",
					votes: 101,
					created_at: expect.any(String),
				});
			});
	});
	test("STATUS 404: Should return appropriate message for an inexistent comment id.", () => {
		const newVotes = { inc_votes: 1 };

		return request(app)
			.patch("/api/comments/999")
			.send(newVotes)
			.expect(404)
			.then((response) => {
				expect(response.body.msg).toBe("Comment not found.");
			});
	});
	test("STATUS 400: Should return appropriate message for an invalid comment id type.", () => {
		const newVotes = { inc_votes: 1 };

		return request(app)
			.patch("/api/comments/ddd")
			.send(newVotes)
			.expect(400)
			.then((response) => {
				expect(response.body.msg).toBe("Bad request.");
			});
	});
	test("STATUS 400: Should return appropriate message for an invalid inc_votes type in the passed body.", () => {
		const newVotes = { inc_votes: "string" };

		return request(app)
			.patch("/api/comments/3")
			.send(newVotes)
			.expect(400)
			.then((response) => {
				expect(response.body.msg).toBe("Bad request.");
			});
	});
	test("STATUS 400: Should return appropriate message for an invalid body.", () => {
		const newVotes = { update_votes: "string" };

		return request(app)
			.patch("/api/comments/3")
			.send(newVotes)
			.expect(400)
			.then((response) => {
				expect(response.body.msg).toBe("Bad request.");
			});
	});
});

describe("GET /api/users", () => {
	test("STATUS 200: Should return an array of users objects with their respective properties:", () => {
		return request(app)
			.get("/api/users")
			.expect(200)
			.then((users) => {
				expect(users.body.users.length).toBe(4);
				users.body.users.forEach((user) => {
					expect(user).toMatchObject({
						username: expect.any(String),
						name: expect.any(String),
						avatar_url: expect.any(String),
					});
				});
			});
	});
	test("STATUS 200: Should return an array with the user object passed as parameter:", () => {
		return request(app)
			.get("/api/users/icellusedkars")
			.expect(200)
			.then((user) => {
				expect(user.body.user.length).toBe(1);
				expect(user.body.user[0]).toMatchObject({
					username: "icellusedkars",
					name: "sam",
					avatar_url:
						"https://avatars2.githubusercontent.com/u/24604688?s=460&v=4",
				});
			});
	});
	test("STATUS 404: Should return an appropriate message if the passed user does not exists:", () => {
		return request(app)
			.get("/api/users/sam")
			.expect(404)
			.then((response) => {
				expect(response.body.msg).toBe("Username not found.");
			});
	});
});

describe("POST /api/articles", () => {
	test("STATUS 201: Should post an article in the database and returns the posted article object.", () => {
		const newPost = {
			author: "rogersop",
			title: "The new rogersop Article!",
			body: "That should be a very interesting article, but I can't think of what to write in here.",
			topic: "paper",
			article_img_url:
				"https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
		};

		return request(app)
			.post("/api/articles")
			.send(newPost)
			.expect(201)
			.then((article) => {
				expect(article.body.article.length).toBe(1);
				expect(article.body.article[0]).toMatchObject({
					author: "rogersop",
					title: "The new rogersop Article!",
					body: "That should be a very interesting article, but I can't think of what to write in here.",
					topic: "paper",
					article_img_url:
						"https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
					article_id: expect.any(Number),
					votes: 0,
					created_at: expect.any(String),
					comment_count: 0,
				});
			});
	});
	test("STATUS 201: Should ignore not needed fields and still post an article in the database and returns the posted article object.", () => {
		const newPost = {
			author: "rogersop",
			title: "The new rogersop Article!",
			body: "That should be a very interesting article, but I can't think of what to write in here.",
			topic: "paper",
			article_img_url:
				"https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
			votes: 1,
		};

		return request(app)
			.post("/api/articles")
			.send(newPost)
			.expect(201)
			.then((article) => {
				expect(article.body.article.length).toBe(1);
				expect(article.body.article[0]).toMatchObject({
					author: "rogersop",
					title: "The new rogersop Article!",
					body: "That should be a very interesting article, but I can't think of what to write in here.",
					topic: "paper",
					article_img_url:
						"https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
					article_id: expect.any(Number),
					votes: 0,
					created_at: expect.any(String),
					comment_count: 0,
				});
			});
	});
	test("STATUS 201: Should use the default img_url if body have no article_img_url.", () => {
		const newPost = {
			author: "rogersop",
			title: "The new rogersop Article!",
			body: "That should be a very interesting article, but I can't think of what to write in here.",
			topic: "paper",
		};

		return request(app)
			.post("/api/articles")
			.send(newPost)
			.expect(201)
			.then((article) => {
				expect(article.body.article.length).toBe(1);
				expect(article.body.article[0]).toMatchObject({
					author: "rogersop",
					title: "The new rogersop Article!",
					body: "That should be a very interesting article, but I can't think of what to write in here.",
					topic: "paper",
					article_img_url:
						"https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
					article_id: expect.any(Number),
					votes: 0,
					created_at: expect.any(String),
					comment_count: 0,
				});
			});
	});
	test("STATUS 400: Should return appropriate message for the client if passed a body with missing mandatory fields.", () => {
		const newPost = {
			// Missing author
			title: "The new rogersop Article!",
			body: "That should be a very interesting article, but I can't think of what to write in here.",
			topic: "paper",
		};
		return request(app)
			.post("/api/articles")
			.send(newPost)
			.expect(400)
			.then((response) => {
				expect(response.body.msg).toBe("Bad request.");
			});
	});
	test("STATUS 404: Should return appropriate message for the client if passed an username that does not exists in the database.", () => {
		const newPost = {
			author: "filipe",
			title: "The new rogersop Article!",
			body: "That should be a very interesting article, but I can't think of what to write in here.",
			topic: "paper",
		};
		return request(app)
			.post("/api/articles")
			.send(newPost)
			.expect(404)
			.then((response) => {
				expect(response.body.msg).toBe("Author not found.");
			});
	});
	test("STATUS 404: Should return appropriate message for the client if passed an topic that does not exists in the database.", () => {
		const newPost = {
			author: "rogersop",
			title: "The new rogersop Article!",
			body: "That should be a very interesting article, but I can't think of what to write in here.",
			topic: "coding",
		};
		return request(app)
			.post("/api/articles")
			.send(newPost)
			.expect(404)
			.then((response) => {
				expect(response.body.msg).toBe("Topic not found.");
			});
	});
});

describe("POST /api/topics", () => {
	test("STATUS 201: Should post a new topic into the database and returns the posted topic object.", () => {
		const newTopic = {
			slug: "new topic",
			description: "This will be our new topic!",
		};

		return request(app)
			.post("/api/topics")
			.send(newTopic)
			.expect(201)
			.then((newTopic) => {
				expect(newTopic.body.topic.length).toBe(1);
				expect(newTopic.body.topic[0].slug).toBe("new topic");
				expect(newTopic.body.topic[0].description).toBe(
					"This will be our new topic!"
				);
			});
	});
	test("STATUS 201: Should ignore unecessary keys on the body and still post the topic.", () => {
		const newTopic = {
			slug: "new topic",
			description: "This will be our new topic!",
			author: "Filipe",
		};

		return request(app)
			.post("/api/topics")
			.send(newTopic)
			.expect(201)
			.then((newTopic) => {
				expect(newTopic.body.topic.length).toBe(1);
				expect(newTopic.body.topic[0].slug).toBe("new topic");
				expect(newTopic.body.topic[0].description).toBe(
					"This will be our new topic!"
				);
			});
	});
	test("STATUS 201: Should accept and post a new topic without a description.", () => {
		const newTopic = {
			slug: "New topic",
		};

		return request(app)
			.post("/api/topics")
			.send(newTopic)
			.expect(201)
			.then((newTopic) => {
				expect(newTopic.body.topic.length).toBe(1);
				expect(newTopic.body.topic[0].slug).toBe("New topic");
				expect(newTopic.body.topic[0].description).toBe(null);
			});
	});
	test("STATUS 409: Should return an appropriate message when trying to add a topic that already exists.", () => {
		const newTopic = {
			slug: "cats",
			description: "This would be a duplicated topic!",
		};

		return request(app)
			.post("/api/topics")
			.send(newTopic)
			.expect(409)
			.then((newTopic) => {
				expect(newTopic.body.msg).toBe("Topic already exists.");
			});
	});
	test("STATUS 400: Should return an appropriate message when trying to add a topic without the needed keys on the body.", () => {
		const newTopic = {
			description: "Where is our body slug?!",
		};

		return request(app)
			.post("/api/topics")
			.send(newTopic)
			.expect(400)
			.then((newTopic) => {
				expect(newTopic.body.msg).toBe("Bad request.");
			});
	});
});

describe("DELETE /api/articles/:article_id", () => {
	test("STATUS 200: Delete the given article and all it's comments from the database.", () => {
		return request(app).delete("/api/articles/1").expect(200);
	});
	test("STATUS 404: Should return appropriate message when trying to delete an article that does not exists.", () => {
		return request(app)
			.delete("/api/articles/99")
			.expect(404)
			.then((response) => {
				expect(response.body.msg).toBe("Article not found.");
			});
	});
	test("STATUS 400: Should return appropriate message when trying to delete an article with invalid article_id.", () => {
		return request(app)
			.delete("/api/articles/ddd")
			.expect(400)
			.then((response) => {
				expect(response.body.msg).toBe("Bad request.");
			});
	});
});
