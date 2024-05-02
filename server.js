const express = require('express');
const app = express();
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const PORT = process.env.PORT || 4000;

// Use express middleware to parse JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the 'Develop/public' directory
app.use(express.static(path.join(__dirname, 'Develop', 'public')));

// Start the server on the port provided by Heroku or locally on port 4000
app.listen(PORT, () => {
    console.log(`Server listening on PORT ${PORT}`);
});

// Serve the main page by sending the notes.html file from the public directory
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'Develop', 'public', 'notes.html'));
});

// Serve the notes page, this route is redundant as it serves the same as the root, but keeping as per your setup
app.get('/notes', (req, res) => {
    res.sendFile(path.join(__dirname, 'Develop', 'public', 'notes.html'));
});

// Define the path for the database JSON file using an absolute path
const dbPath = path.join(__dirname, 'Develop', 'db', 'db.json');

// GET route to retrieve notes
app.get('/api/notes', (req, res) => {
    fs.readFile(dbPath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading notes data:', err);
            return res.status(500).send('Error reading notes data.');
        }
        res.json(JSON.parse(data));
    });
});

// POST route to add a new note
app.post('/api/notes', (req, res) => {
    const newNote = { ...req.body, id: uuidv4() };

    fs.readFile(dbPath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading notes data:', err);
            return res.status(500).send('Error reading notes data.');
        }
        const notes = JSON.parse(data);
        notes.push(newNote);

        fs.writeFile(dbPath, JSON.stringify(notes), (err) => {
            if (err) {
                console.error('Error saving the new note:', err);
                return res.status(500).send('Error saving the new note.');
            }
            res.json(newNote);
        });
    });
});

// DELETE route to remove a note by its ID
app.delete('/api/notes/:id', (req, res) => {
    const noteId = req.params.id;

    fs.readFile(dbPath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading notes data:', err);
            return res.status(500).send('Error reading notes data.');
        }
        let notes = JSON.parse(data);
        notes = notes.filter(note => note.id !== noteId);

        fs.writeFile(dbPath, JSON.stringify(notes), (err) => {
            if (err) {
                console.error('Error saving updated notes data:', err);
                return res.status(500).send('Error saving updated notes data.');
            }
            res.status(204).send(); // No Content status because the resource was successfully deleted
        });
    });
});
