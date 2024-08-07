const fs = require("fs/promises");

function fetchApiInfo() {
	return fs.readFile("./endpoints.json", "utf-8", (err, fileContent) => {
		return fileContent;
	});
}

module.exports = { fetchApiInfo };
