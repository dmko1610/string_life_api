const express = require('express')
const cors = require('cors')
const sqlite3 = require('sqlite3').verbose()

const app = express()
app.use(cors())
app.use(express.json())

const isTest = process.env.NODE_ENV === 'test'
const db = new sqlite3.Database(isTest ? ":memory:" : './string_life_db.db')

db.run("CREATE TABLE IF NOT EXISTS stringLife (id INTEGER PRIMARY KEY NOT NULL, name TEXT NOT NULL, type TEXT NOT NULL, replacement_date INTEGER, progress INTEGER)")

app.get("/items", (req, res) => {
  db.all("SELECT * FROM stringLife", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message })
    res.json(rows)
  })
})

app.post('/items', (req, res) => {
  const { name, type, replacement_date, progress } = req.body
  const query = "INSERT INTO stringLife (name, type, replacement_date, progress) VALUES (?, ?, ?, ?)"
  db.run(query, [name, type, replacement_date, progress], function (err) {
    if (err) {
      return res.status(400).json({ error: res.message })
    }
    res.json({ id: this.lastID, name, type, replacement_date, progress })
  })
})

app.put("/items/:id", (req, res) => {
  const { id } = req.params
  const { name, type, replacement_date, progress } = req.body

  const query = "UPDATE stringLife SET name = ?, type = ?, replacement_date = ?, progress = ? WHERE id = ?"
  db.run(query, [name, type, replacement_date, progress, id], function (err) {
    if (err) {
      return res.status(400).json({ error: err.message })
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: "Item not found" })
    }
    res.json({ id, name, type, replacement_date, progress })
  })
})

app.delete("/items/:id", (req, res) => {
  const { id } = req.params

  const query = "DELETE FROM stringLife WHERE id = ?"
  db.run(query, [id], function (err) {
    if (err) {
      return res.status(400).json({ error: err.message })
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Item not found' })
    }

    res.json({ message: "Item deleted successfully", id })
  })
})

if (!isTest) {

  const PORT = 3000
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
}

module.exports = { app, db }