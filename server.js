const express = require('express');
const app = express();
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const PORT = process.env.PORT || 4000;

// Middlewares to handle JSON and URL-encoded data (moved up before routes)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the correct directory
// Adjusted path to match your project structure
app.use(express.static(path.join(__dirname, 'Develop', 'public')));

// Start the server
app.listen(PORT, () => {
    console.log(`Server listening on PORT ${PORT}`);
});

// Route to serve the main page
// Corrected file path to ensure it matches the static file directory path
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'Develop', 'public', 'notes.html'));
});

// Route to serve the notes page
// This is redundant if it serves the same as the root, but keeping as per your setup
app.get('/notes', (req, res) => {
    res.sendFile(path.join(__dirname, 'Develop', 'public', 'notes.html'));
});

// GET route to retrieve notes
// Adjusted the path to ensure it points to the correct location of your JSON file
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
// Adjusted the path for file operations to match the correct file location
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

// DELETE route to remove a note by its ID
// Path consistency maintained for file operations
app.delete('/api/notes/:id', (req, res) => {
    const noteId = req.params.id;

    fs.readFile('./Develop/db/db.json', 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error reading notes data.');
        }
        let notes = JSON.parse(data);
        notes = notes.filter(note => note.id !== noteId);

        fs.writeFile('./Develop/db/db.json', JSON.stringify(notes), (err) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Error saving updated notes data.');
            }
            res.status(204).send(); // No Content status because the resource was successfully deleted
        });
    });
});
