const express = require("express");
const cors = require("cors");
const db = require("./db");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/lists", (req, res) => {
  db.all(
    "SELECT id, title, description FROM lists ORDER BY id DESC",
    (err, rows) => {
      if (err) {
        console.error("Database error on GET /lists:", err);
        return res.status(500).json({ error: "database error" });
      }

      return res.json(rows);
    }
  );
});

app.post("/lists", (req, res) => {
  const title = req.body?.title?.trim();
  const description = req.body?.description?.trim() || null;

  if (!title) {
    return res.status(400).json({ error: "title is required" });
  }

  db.run(
    "INSERT INTO lists(title, description) VALUES(?, ?)",
    [title, description],
    function (err) {
      if (err) {
        console.error("Database error on POST /lists:", err);
        return res.status(500).json({ error: "database error" });
      }

      return res.status(201).json({
        id: this.lastID,
        title,
        description
      });
    }
  );
});

app.put("/lists/:id", (req, res) => {
  const listId = Number.parseInt(req.params.id, 10);
  const title = req.body?.title?.trim();
  const description = req.body?.description?.trim() || null;

  if (Number.isNaN(listId)) {
    return res.status(400).json({ error: "invalid list id" });
  }

  if (!title) {
    return res.status(400).json({ error: "title is required" });
  }

  db.run(
    "UPDATE lists SET title = ?, description = ? WHERE id = ?",
    [title, description, listId],
    function (err) {
      if (err) {
        console.error("Database error on PUT /lists/:id:", err);
        return res.status(500).json({ error: "database error" });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: "list not found" });
      }

      return res.json({
        id: listId,
        title,
        description
      });
    }
  );
});

app.delete("/lists/:id", (req, res) => {
  const listId = Number.parseInt(req.params.id, 10);

  if (Number.isNaN(listId)) {
    return res.status(400).json({ error: "invalid list id" });
  }

  db.run("DELETE FROM lists WHERE id = ?", [listId], function (err) {
    if (err) {
      console.error("Database error on DELETE /lists/:id:", err);
      return res.status(500).json({ error: "database error" });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: "list not found" });
    }

    return res.json({ success: true, deletedId: listId });
  });
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
