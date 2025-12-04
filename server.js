import express from 'express';
import path from "path";

const app = express();
const PORT = process.env.PORT || 3000;
const __dirname = path.resolve();

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
})

app.get('/api/', (req, res) => {
  res.json({ organization: "Student Cyber Games" });
});



app.listen (PORT, '0.0.0.0', () => {
  console.log('server is listening on port: '+ PORT);
});