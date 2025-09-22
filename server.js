const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, "entries.json");

app.use(express.json());
app.use(express.static(__dirname));

if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, "[]");

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "guestbook_frontend.html"));
});

function readEntries() {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
  } catch {
    return [];
  }
}

function writeEntries(entries) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(entries, null, 2));
}

app.get("/api/entries", (req, res) => {
  res.json(readEntries());
});

app.post("/api/entries", (req, res) => {
  const { name, message } = req.body;
  if (!name || !message) return res.status(400).json({ error: "Name and message are required" });

  const newEntry = { id: Date.now().toString(), name, message };
  const entries = readEntries();
  entries.push(newEntry);
  writeEntries(entries);
  res.status(201).json(newEntry);
});

app.delete("/api/entries/:id", (req, res) => {
  let entries = readEntries();
  const index = entries.findIndex(e => e.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: "Entry not found" });

  entries.splice(index, 1);
  writeEntries(entries);
  res.json({ success: true });
});

app.listen(PORT, () => console.log(`✅ Server running at http://localhost:${PORT}`));