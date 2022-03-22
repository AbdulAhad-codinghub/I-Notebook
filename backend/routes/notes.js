const express = require('express');
const router = express.Router();
const Note = require('../models/Note');
const fetchuser = require('../middleware/fetchuser');
const { body, validationResult } = require('express-validator');


// ROUTE 1 : Get all the notes using : GET "/api/notes/fetchallnotes" .login Required
router.get('/fetchallnotes', fetchuser, async (req, res) => {
    try {
        const notes = await Note.find({ user: req.user.id });
        res.json(notes)
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server error Occured");
    }
})

// ROUTE 2 : Add a new note using : Post "/api/notes/addnotes" .login Required
router.post('/addnote', fetchuser, [
    body('title', "Enter Valid Title").isLength({ min: 3 }),
    body('description', "Description Must be at least 5 character").isLength({ min: 5 }),
], async (req, res) => {
    try {
        const { title, description, tag, } = req.body;
        //if there are errors return bad request and the errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const note = new Note({
            title, description, tag, user: req.user.id
        })
        const savedNote = await note.save()
        res.json(savedNote)
    }
    catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server error Occured");
    }
})

// ROUTE 3 : Update an existing  note using : put "/api/notes/updatenote" .login Required
router.put('/updatenote/:id', fetchuser, async (req, res) => {
    const { title, description, tag } = req.body;
    //create newNote object
    try {
        const newNote = {};
        if (title) { newNote.title = title };
        if (description) { newNote.description = description };
        if (tag) { newNote.tag = tag };
        // find the note to be updated and update it
        let note = await Note.findById(req.params.id);
        if (!note) { res.status(404).send("Not Found") }
        if (note.user.toString() !== req.user.id) {
            return res.status(401).send("Not Allowed");
        }
        note = await Note.findByIdAndUpdate(req.params.id, { $set: newNote }, { new: true })
        res.json({ note });
    }
    catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server error Occured");
    }
})

// ROUTE 4 : Delete an existing  note using : Delete "/api/notes/deletenote" .login Required
router.delete('/deletenote/:id', fetchuser, async (req, res) => {
    try {
        // find the note to be deleted and delete it
        let note = await Note.findById(req.params.id);
        if (!note) { res.status(404).send("Not Found") }
        //Allow Deletion only if user own this note
        if (note.user.toString() !== req.user.id) {
            return res.status(401).send("Not Allowed");
        }
        note = await Note.findByIdAndDelete(req.params.id)
        res.json({ "Sucess": "Notes has been deleted", note: note });
    }
    catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server error Occured");
    }
})
module.exports = router