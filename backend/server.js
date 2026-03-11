const express = require("express");
const cors = require("cors");
const db = require("./db");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/users", (req, res) => {
  console.log("GET request received on /users");
  db.all("SELECT * FROM users", (err, rows) => {
    if (err) {
      console.log("Error on db: "+ err);
      return res.status(500).json(err);
    }
    res.json(rows);
  });
});

app.post("/users", (req, res) => {
  const { name } = req.body;

  db.run(
    "INSERT INTO users(name) VALUES(?)",
    [name],
    function (err) {
      if (err) return res.status(500).json(err);

      res.json({
        id: this.lastID,
        name
      });
    }
  );
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
