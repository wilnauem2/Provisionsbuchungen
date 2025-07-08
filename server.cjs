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

// Ensure the data directory exists
const dataDir = path.dirname(DATA_FILE)
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true })
}

// GET: Versicherungsliste lesen
app.get('/api/insurers', (req, res) => {
  fs.readFile(DATA_FILE, 'utf-8', (err, data) => {
    if (err) {
      console.error('Fehler beim Lesen der Datei:', err)
      // If file doesn't exist, return empty array instead of error
      if (err.code === 'ENOENT') {
        return res.json([])
      }
      return res.status(500).json({ error: 'Datei konnte nicht gelesen werden.' })
    }
    try {
      res.json(JSON.parse(data))
    } catch (parseError) {
      console.error('Fehler beim Parsen der Datei:', parseError)
      res.status(500).json({ error: 'Ungültiges JSON in der Datei.' })
    }
  })
})

// PUT: Versicherungsliste komplett überschreiben
app.put('/api/insurers', (req, res) => {
  if (!req.body) {
    return res.status(400).json({ error: 'Keine Daten im Request Body.' })
  }

  const newData = JSON.stringify(req.body, null, 2)

  fs.writeFile(DATA_FILE, newData, 'utf-8', (err) => {
    if (err) {
      console.error('Fehler beim Schreiben der Datei:', err)
      // If error is due to directory not existing, create it and try again
      if (err.code === 'ENOENT') {
        const dataDir = path.dirname(DATA_FILE)
        fs.mkdirSync(dataDir, { recursive: true })
        fs.writeFile(DATA_FILE, newData, 'utf-8', (err) => {
          if (err) {
            console.error('Fehler beim Schreiben der Datei nach Verzeichnis-Erstellung:', err)
            return res.status(500).json({ error: 'Datei konnte nicht gespeichert werden.' })
          }
          res.json({ success: true })
        })
        return
      }
      return res.status(500).json({ error: 'Datei konnte nicht gespeichert werden.' })
    }
    res.json({ success: true })
  })
})

// Server starten
app.listen(PORT, () => {
  console.log(`✅ API-Server läuft unter http://localhost:${PORT}`)
})
