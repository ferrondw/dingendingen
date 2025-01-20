// server.js
const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const app = express();
const PORT = 420;

const dataFilePath = path.join(__dirname, 'public', 'dingen.json');

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Serve static files (like your HTML, CSS, etc.) from the 'public' folder
app.use(express.static('public'));

// Get all items (with hidden status)
app.get('/api/items', (req, res) => {
    fs.readFile(dataFilePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ message: 'Error reading data file' });
        }
        const jsonData = JSON.parse(data);
        res.json(jsonData);
    });
});

// Update an item's hidden status
app.put('/api/items/:index', (req, res) => {
    const { index } = req.params;
    const { hidden, text } = req.body;

    fs.readFile(dataFilePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ message: 'Error reading data file' });
        }

        const jsonData = JSON.parse(data);
        const item = jsonData.items[index];

        if (item) {
            // Modify the item
            if (text !== undefined) item.text = text;
            item.hidden = hidden;

            // Save the updated data back to the JSON file
            fs.writeFile(dataFilePath, JSON.stringify(jsonData, null, 2), (err) => {
                if (err) {
                    return res.status(500).json({ message: 'Error writing data file' });
                }
                res.status(200).json(item);
            });
        } else {
            res.status(404).json({ message: 'Item not found' });
        }
    });
});

// Add a new item
app.post('/api/items', (req, res) => {
    const { text } = req.body;

    fs.readFile(dataFilePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ message: 'Error reading data file' });
        }

        const jsonData = JSON.parse(data);
        const newItem = {
            text,
            hidden: false,
        };

        jsonData.items.push(newItem);

        fs.writeFile(dataFilePath, JSON.stringify(jsonData, null, 2), (err) => {
            if (err) {
                return res.status(500).json({ message: 'Error writing data file' });
            }
            res.status(201).json(newItem);
        });
    });
});

// Delete an item (by marking it as hidden)
app.delete('/api/items/:index', (req, res) => {
    const { index } = req.params;

    fs.readFile(dataFilePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ message: 'Error reading data file' });
        }

        const jsonData = JSON.parse(data);
        const item = jsonData.items[index];

        if (item) {
            item.hidden = true;

            fs.writeFile(dataFilePath, JSON.stringify(jsonData, null, 2), (err) => {
                if (err) {
                    return res.status(500).json({ message: 'Error writing data file' });
                }
                res.status(200).json(item);
            });
        } else {
            res.status(404).json({ message: 'Item not found' });
        }
    });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
