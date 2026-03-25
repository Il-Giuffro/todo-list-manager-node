const express = require("express");
const cors = require("cors");
const db = require("./db");

const app = express();

app.use(cors());
app.use(express.json());

function isValidStatus(status) {
  return status === "todo" || status === "done";
}

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

app.get("/lists/:id", (req, res) => {
  const listId = Number.parseInt(req.params.id, 10);

  if (Number.isNaN(listId)) {
    return res.status(400).json({ error: "invalid list id" });
  }

  db.get(
    "SELECT id, title, description FROM lists WHERE id = ?",
    [listId],
    (err, row) => {
      if (err) {
        console.error("Database error on GET /lists/:id:", err);
        return res.status(500).json({ error: "database error" });
      }

      if (!row) {
        return res.status(404).json({ error: "list not found" });
      }

      return res.json(row);
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

app.get("/lists/:id/items", (req, res) => {
  const listId = Number.parseInt(req.params.id, 10);

  if (Number.isNaN(listId)) {
    return res.status(400).json({ error: "invalid list id" });
  }

  db.get("SELECT id FROM lists WHERE id = ?", [listId], (listError, listRow) => {
    if (listError) {
      console.error("Database error on GET /lists/:id/items:", listError);
      return res.status(500).json({ error: "database error" });
    }

    if (!listRow) {
      return res.status(404).json({ error: "list not found" });
    }

    db.all(
      `
      SELECT id, list_id, text, status
      FROM list_items
      WHERE list_id = ?
      ORDER BY id DESC
      `,
      [listId],
      (err, rows) => {
        if (err) {
          console.error("Database error on GET /lists/:id/items:", err);
          return res.status(500).json({ error: "database error" });
        }

        return res.json(rows);
      }
    );
  });
});

app.get("/lists/:listId/items/:itemId", (req, res) => {
  const listId = Number.parseInt(req.params.listId, 10);
  const itemId = Number.parseInt(req.params.itemId, 10);

  if (Number.isNaN(listId) || Number.isNaN(itemId)) {
    return res.status(400).json({ error: "invalid id" });
  }

  db.get(
    `
    SELECT id, list_id, text, status
    FROM list_items
    WHERE id = ? AND list_id = ?
    `,
    [itemId, listId],
    (err, row) => {
      if (err) {
        console.error("Database error on GET /lists/:listId/items/:itemId:", err);
        return res.status(500).json({ error: "database error" });
      }

      if (!row) {
        return res.status(404).json({ error: "item not found" });
      }

      return res.json(row);
    }
  );
});

app.post("/lists/:id/items", (req, res) => {
  const listId = Number.parseInt(req.params.id, 10);
  const text = req.body?.text?.trim();
  const status = req.body?.status?.trim() || "todo";

  if (Number.isNaN(listId)) {
    return res.status(400).json({ error: "invalid list id" });
  }

  if (!text) {
    return res.status(400).json({ error: "text is required" });
  }

  if (!isValidStatus(status)) {
    return res.status(400).json({ error: "invalid status" });
  }

  db.get("SELECT id FROM lists WHERE id = ?", [listId], (listError, listRow) => {
    if (listError) {
      console.error("Database error on POST /lists/:id/items:", listError);
      return res.status(500).json({ error: "database error" });
    }

    if (!listRow) {
      return res.status(404).json({ error: "list not found" });
    }

    db.run(
      "INSERT INTO list_items(list_id, text, status) VALUES(?, ?, ?)",
      [listId, text, status],
      function (err) {
        if (err) {
          console.error("Database error on POST /lists/:id/items:", err);
          return res.status(500).json({ error: "database error" });
        }

        return res.status(201).json({
          id: this.lastID,
          list_id: listId,
          text,
          status
        });
      }
    );
  });
});

app.put("/lists/:listId/items/:itemId", (req, res) => {
  const listId = Number.parseInt(req.params.listId, 10);
  const itemId = Number.parseInt(req.params.itemId, 10);
  const text = req.body?.text?.trim();
  const status = req.body?.status?.trim();

  if (Number.isNaN(listId) || Number.isNaN(itemId)) {
    return res.status(400).json({ error: "invalid id" });
  }

  if (!text) {
    return res.status(400).json({ error: "text is required" });
  }

  if (!isValidStatus(status)) {
    return res.status(400).json({ error: "invalid status" });
  }

  db.run(
    `
    UPDATE list_items
    SET text = ?, status = ?
    WHERE id = ? AND list_id = ?
    `,
    [text, status, itemId, listId],
    function (err) {
      if (err) {
        console.error("Database error on PUT /lists/:listId/items/:itemId:", err);
        return res.status(500).json({ error: "database error" });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: "item not found" });
      }

      return res.json({
        id: itemId,
        list_id: listId,
        text,
        status
      });
    }
  );
});

app.patch("/lists/:listId/items/:itemId/status", (req, res) => {
  const listId = Number.parseInt(req.params.listId, 10);
  const itemId = Number.parseInt(req.params.itemId, 10);
  const status = req.body?.status?.trim();

  if (Number.isNaN(listId) || Number.isNaN(itemId)) {
    return res.status(400).json({ error: "invalid id" });
  }

  if (!isValidStatus(status)) {
    return res.status(400).json({ error: "invalid status" });
  }

  db.run(
    `
    UPDATE list_items
    SET status = ?
    WHERE id = ? AND list_id = ?
    `,
    [status, itemId, listId],
    function (err) {
      if (err) {
        console.error(
          "Database error on PATCH /lists/:listId/items/:itemId/status:",
          err
        );
        return res.status(500).json({ error: "database error" });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: "item not found" });
      }

      return res.json({
        id: itemId,
        list_id: listId,
        status
      });
    }
  );
});

app.delete("/lists/:listId/items/:itemId", (req, res) => {
  const listId = Number.parseInt(req.params.listId, 10);
  const itemId = Number.parseInt(req.params.itemId, 10);

  if (Number.isNaN(listId) || Number.isNaN(itemId)) {
    return res.status(400).json({ error: "invalid id" });
  }

  db.run(
    "DELETE FROM list_items WHERE id = ? AND list_id = ?",
    [itemId, listId],
    function (err) {
      if (err) {
        console.error("Database error on DELETE /lists/:listId/items/:itemId:", err);
        return res.status(500).json({ error: "database error" });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: "item not found" });
      }

      return res.json({ success: true, deletedId: itemId, listId });
    }
  );
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
