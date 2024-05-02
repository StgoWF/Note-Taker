const express = require('express');
const app = express();
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const PORT = process.env.PORT || 4000;

// Middlewares to handle JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the 'public' directory under 'Develop'
app.use(express.static(path.join(__dirname, 'Develop', 'public', 'assets')));

// Start the server
app.listen(PORT, () => {
    console.log(`Server listening on PORT ${PORT}`);
});

// Route to serve the main page, 'index.html'
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'Develop', 'public', 'index.html'));
});

// Route to serve the notes page, 'notes.html'
app.get('/notes', (req, res) => {
    res.sendFile(path.join(__dirname, 'Develop', 'public', 'notes.html'));
});

// GET route to retrieve notes from 'db.json'
app.get('/api/notes', (req, res) => {
    fs.readFile(path.join(__dirname, 'Develop', 'db', 'db.json'), 'utf8', (err, data) => {
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

    fs.readFile(path.join(__dirname, 'Develop', 'db', 'db.json'), 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error reading notes data.');
        }
        const notes = JSON.parse(data);
        notes.push(newNote);

        fs.writeFile(path.join(__dirname, 'Develop', 'db', 'db.json'), JSON.stringify(notes), (err) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Error saving the new note.');
            }
            res.json(newNote);
        });
    });
});

// DELETE route to remove a note by its ID
app.delete('/api/notes/:id', (req, res) => {
    const noteId = req.params.id;

    fs.readFile(path.join(__dirname, 'Develop', 'db', 'db.json'), 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error reading notes data.');
        }
        let notes = JSON.parse(data);
        notes = notes.filter(note => note.id !== noteId);

        fs.writeFile(path.join(__dirname, 'Develop', 'db', 'db.json'), JSON.stringify(notes), (err) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Error saving updated notes data.');
            }
            res.status(204).send(); // No Content status because the resource was successfully deleted
        });
    });
});
