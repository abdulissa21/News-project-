const express = require("express");
const app = express();
const { apiRouter } = require("./routes/api-router");
const cors = require("cors");

const {
	handleCustomErrors,
	handlePsqlErrors,
	handleServerErrors,
} = require("./middlewares/errorHandling");

app.use(express.json());
app.use(cors());

// Router:
app.use("/api", apiRouter);

// Error Handling:
app.use(handleCustomErrors);
app.use(handlePsqlErrors);
app.use(handleServerErrors);

// Invalid Endpoints:
app.use((req, res, next) => {
	res.status(404).json({ status: 404, msg: "Invalid endpoint." });
});

module.exports = app;
