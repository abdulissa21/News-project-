const { fetchApiInfo } = require("../models/api.models");

function getApiInfo(req, res, next) {
	fetchApiInfo()
		.then((apiInfo) => {
			res.status(200).json({ endpoints: JSON.parse(apiInfo) });
		})
		.catch((err) => {
			next(err);
		});
}

module.exports = { getApiInfo };
