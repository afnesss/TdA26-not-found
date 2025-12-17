import cors from "cors";
import express from "express";

const app = express();
const port = process.env.PORT;

if (!port) {
  throw new Error("PORT is undefined or is not set in .env file");
}

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ organization: "Student Cyber Games" });
});

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
