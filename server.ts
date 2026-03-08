import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const db = new Database("attendance.db");

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    employee_id TEXT UNIQUE NOT NULL,
    profile_picture TEXT
  );

  CREATE TABLE IF NOT EXISTS attendance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    image_data TEXT,
    location TEXT,
    FOREIGN KEY (user_id) REFERENCES users (id)
  );
`);

// Migration: Add profile_picture if it doesn't exist
try {
  db.exec("ALTER TABLE users ADD COLUMN profile_picture TEXT");
} catch (e) {
  // Column already exists
}

// Seed some users if empty
const userCount = db.prepare("SELECT count(*) as count FROM users").get() as { count: number };
if (userCount.count === 0) {
  const insert = db.prepare("INSERT INTO users (name, employee_id) VALUES (?, ?)");
  insert.run("John Doe", "EMP001");
  insert.run("Jane Smith", "EMP002");
  insert.run("Alex Johnson", "EMP003");
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // API Routes
  app.get("/api/users", (req, res) => {
    const users = db.prepare("SELECT * FROM users").all();
    res.json(users);
  });

  app.put("/api/users/:id", (req, res) => {
    const { id } = req.params;
    const { name, employee_id, profile_picture } = req.body;
    
    if (!name || !employee_id) {
      return res.status(400).json({ error: "Name and Employee ID are required" });
    }

    try {
      const stmt = db.prepare("UPDATE users SET name = ?, employee_id = ?, profile_picture = ? WHERE id = ?");
      const info = stmt.run(name, employee_id, profile_picture || null, id);
      if (info.changes === 0) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Database error or duplicate Employee ID" });
    }
  });

  app.post("/api/attendance", (req, res) => {
    const { user_id, image_data, location } = req.body;
    if (!user_id || !image_data) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    try {
      const stmt = db.prepare("INSERT INTO attendance (user_id, image_data, location) VALUES (?, ?, ?)");
      const info = stmt.run(user_id, image_data, location || "Unknown");
      res.json({ success: true, id: info.lastInsertRowid });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Database error" });
    }
  });

  app.get("/api/attendance", (req, res) => {
    const records = db.prepare(`
      SELECT a.*, u.name, u.employee_id 
      FROM attendance a 
      JOIN users u ON a.user_id = u.id 
      ORDER BY a.timestamp DESC
    `).all();
    res.json(records);
  });

  app.get("/api/attendance/:userId", (req, res) => {
    const { userId } = req.params;
    const records = db.prepare(`
      SELECT a.*, u.name, u.employee_id 
      FROM attendance a 
      JOIN users u ON a.user_id = u.id 
      WHERE a.user_id = ?
      ORDER BY a.timestamp DESC
    `).all(userId);
    res.json(records);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.resolve(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
