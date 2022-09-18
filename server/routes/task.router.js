const { response } = require('express');
const express = require('express'); // import express
const router = express.Router(); // initialize router

const pool = require('../modules/pool'); // import pool

// GET for all tasks sorted by tasks DATE ADDED - newest or oldest is passed as param in url
router.get('/:sortKey', (req, res) => {
    let sort = req.params.sortKey.toUpperCase();
    console.log('This is sort: ', sort);
    let query = `SELECT * FROM "tasks" ORDER BY "dateAdded" DESC, "id";`;
    if (sort === 'ASC') { // uses ascending sort if ASC was passed or use DESC by default
        query = `SELECT * FROM "tasks" ORDER BY "dateAdded" ASC, "id";`;
    };
    pool.query(query)
        .then(result => res.send(result.rows));
});

// GET for getting a single row
router.get('/:taskid/task', (req, res) => {
    let taskID = req.params.taskid;
    const query = `SELECT * FROM "tasks" WHERE id=$1;`;
    pool.query(query, [taskID])
        .then(result => res.send(result.rows));
});

router.get('/:sortBy/:sortKey/anySort', (req, res) => {
    const sortBy = `"${req.params.sortBy}"`;
    const sortKey = req.params.sortKey.toUpperCase();
    console.log('This is sortBy', sortBy);
    let query = (`SELECT * FROM "tasks" ORDER BY LOWER(` + sortBy + `) ` + sortKey + `;`);
    if (sortBy === `"dueDate"` || sortBy === `"dateComplete"` || sortBy === `"dateAdded"`) {
        query = (`SELECT * FROM "tasks" ORDER BY ` + sortBy + ' ' + sortKey + `;`);
    }
    pool.query(query).then(result => {
        console.log(result.rows);
        res.send(result.rows);
    });
});

// POST adding a new task to DB
router.post('/', (req, res) => {
    let newTask = req.body; // gets req.body (data sent in through POST)
    console.log('Adding this task: ', newTask); // logs newTask being added to DB
    if(!newTask.taskName || !newTask.taskDescription) {
        res.sendStatus(400); // sends 'bad request' status if either input is missing
        return; // ends function so multiple responses aren't attempted
    };
    if(!newTask.dueDate) {
        newTask.dueDate = null; // allows dueDate to be an optional add when creating new task
    };
    //SQL query to use on DB
    let query = `INSERT INTO "tasks" ("taskName", "taskDescription", "dueDate")
                 VALUES ($1, $2, $3);`;
    // perform query on DB
    pool.query(query, [newTask.taskName, newTask.taskDescription, newTask.dueDate])
        .then(result => res.sendStatus(201)).catch(error => {
            console.log('Error adding new task!', error);
            res.sendStatus(500);
        });
});

// PUT for updating if a task is completed ONLY
router.put('/:taskid/complete', (req, res) => {
    // which task to change by id that is passed as a parameter in the URL
    const taskId = req.params.taskid;
    console.log('Req.params in PUT complete: ', taskId);
    // SQL statement that toggles isComplete boolean between true and false
    const query = `UPDATE "tasks" SET "isComplete"=(NOT "isComplete") WHERE id=$1;`;
    pool.query(query, [taskId])
        .then((response) => res.sendStatus(200))
        .catch(error => {
        console.log(error);
        res.sendStatus(500);
    });
});

// PUT for updating any info on a task (edit mode)
router.put('/:taskid/edit', (req, res) => {
    //get task id from params in url
    const taskId = req.params.taskid;
    console.log('This is taskId: ', taskId);
    // Call function that will check the non-required data is present and sets
    // a default value if they are not
    let objWithDefault = setDefaults(req.body);
    const taskName = objWithDefault.taskName;
    const taskDescription = objWithDefault.taskDescription;
    const isComplete = objWithDefault.isComplete;
    console.log('This is isComplete: ', isComplete);
    const dateComplete = objWithDefault.dateComplete;
    console.log('This is dateComplete: ', dateComplete);
    const dueDate = objWithDefault.dueDate;
    console.log('This is dueDate: ', dueDate);
    //SQL UPDATE query to make changes to a record
    const query = `UPDATE "tasks" 
                   SET "taskName"=$1, "taskDescription"=$2, "isComplete"=$3, "dateComplete"=$4, "dueDate"=$5 
                   WHERE id=$6`;
    pool.query(query, [taskName, taskDescription, isComplete, dateComplete, dueDate, taskId])
        .then((response) => res.sendStatus(200))
        .catch(error => {
            console.log(error);
            res.sendStatus(500);
        });
});

// DELETE for removing a task from DB
router.delete('/:taskid', (req, res) => {
    console.log('Req paramas: ', req.params);
    const taskId = req.params.taskid;
    const query = `DELETE FROM "tasks" WHERE id=$1`;
    pool.query(query, [taskId])
        .then((response) => res.sendStatus(204))
        .catch(error => {
            console.log(error);
            res.sendStatus(500);
        });
});

// Export router
module.exports = router;

// This function sets some default values if values aren't present during edit PUT
function setDefaults(obj) {
    if (!obj.isComplete) {
        obj.isComplete = false;
    }
    if (!obj.dateComplete) {
        obj.dateComplete = null;
    }
    if (!obj.dueDate) {
        obj.dueDate = null;
    }
    return obj;
}
