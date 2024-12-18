import express from "express";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const port = process.env.PORT || 5500;
const appScheme = process.env.APP_SCHEME || "aa-rn-expo-example";

app.get("/", (req, res) => {
	const bundle = req.query.bundle;
	const orgId = req.query.orgId;

	if (!bundle || !orgId) {
		return res.status(400).send("Missing bundle or orgId");
	}

	res.redirect(`${appScheme}:///?bundle=${bundle}&orgId=${orgId}`);
});

app.listen(port, () => {
	console.log(`Server is running on port ${port}`);
});
