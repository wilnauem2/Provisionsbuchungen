// server.js
const express = require('express')
const fs = require('fs')
const cors = require('cors')
const path = require('path')

const app = express()
const PORT = 3001

app.use(cors())
app.use(express.json())

const DATA_FILE = path.join(__dirname, 'src/data/insurers.json')

// GET: Versicherungsliste lesen
app.get('/api/insurers', (req, res) => {
  fs.readFile(DATA_FILE, 'utf-8', (err, data) => {
    if (err) {
      console.error('Fehler beim Lesen der Datei:', err)
      return res.status(500).json({ error: 'Datei konnte nicht gelesen werden.' })
    }
    res.json(JSON.parse(data))
  })
})

// PUT: Versicherungsliste komplett überschreiben
app.put('/api/insurers', (req, res) => {
  const newData = JSON.stringify(req.body, null, 2)

  fs.writeFile(DATA_FILE, newData, 'utf-8', (err) => {
    if (err) {
      console.error('Fehler beim Schreiben der Datei:', err)
      return res.status(500).json({ error: 'Datei konnte nicht gespeichert werden.' })
    }
    res.json({ success: true })
  })
})

// Server starten
app.listen(PORT, () => {
  console.log(`✅ API-Server läuft unter http://localhost:${PORT}`)
})
