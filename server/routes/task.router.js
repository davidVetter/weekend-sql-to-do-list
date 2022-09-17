const express = require('express'); // import express
const router = express.Router(); // initialize router

const pool = require('../modules/pool'); // import pool

//GET for all tasks sorted by tasks DATE ADDED - newly or oldest is passed as param in url
router.get('/:sortKey', (req, res) => {
    let query = `SELECT * FROM "tasks" ORDER BY "date_added" "${req.params.sortKey}"`;
    pool.query(query).then(result => res.send(result.rows));
});

//POST adding a new task to DB

// PUT for updating if a task is completed ONLY

// PUT for updating any info on a task (edit mode)

// DELETE for removing a task from DB

// Export router
module.exports = router;
