const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the 'public' directory
app.use(express.static('public'));

// Start the server
app.listen(PORT, () => {
    console.log(`Server listening on PORT ${PORT}`);
});


const path = require('path');

// Route to serve the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/index.html'));
});

// Route to serve the notes page
app.get('/notes', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/notes.html'));
});

const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// Middlewares to handle JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// GET route to retrieve notes
app.get('/api/notes', (req, res) => {
    fs.readFile('./Develop/db/db.json', 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error reading notes data.');
        }
        res.json(JSON.parse(data));
    });
});

// POST route to add a new note
app.post('/api/notes', (req, res) => {
    const newNote = { ...req.body, id: uuidv4() };

    fs.readFile('./Develop/db/db.json', 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error reading notes data.');
        }
        const notes = JSON.parse(data);
        notes.push(newNote);

        fs.writeFile('./Develop/db/db.json', JSON.stringify(notes), (err) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Error saving the new note.');
            }
            res.json(newNote);
        });
    });
});
