import dotenv from "dotenv";
import express from "express";

dotenv.config();

const app = express();
const port = process.env.PORT || 5500;
const appScheme = process.env.APP_SCHEME || "rn-signer-demo";

app.get("/", (req, res) => {
  const bundle = req.query.bundle;
  const orgId = req.query.orgId;

  console.log("redirecting");
  res.redirect(`${appScheme}://home?bundle=${bundle}&orgId=${orgId}`);
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
