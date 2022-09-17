const express = require('express'); // import express
const router = express.Router(); // initialize router

const pool = require('../modules/pool'); // import pool

//GET for all tasks sorted by tasks DATE ADDED - newly or oldest is passed as param in url
router.get('/:sortKey', (req, res) => {
    let sort = req.params.sortKey.toUpperCase();
    console.log('This is sort: ', sort);
    let query = `SELECT * FROM "tasks" ORDER BY "dateAdded" ${sort}`;
    pool.query(query).then(result => res.send(result.rows));
});

//POST adding a new task to DB
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
    let objWithDefault = setDefaults(req.body);
    const taskName = objWithDefault.taskName;
    const taskDescription = objWithDefault.taskDescription;
    const isComplete = objWithDefault.isComplete;
    const dateComplete = objWithDefault.dateComplete;
    const dueDate = objWithDefault.dueDate;
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

// Export router
module.exports = router;

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
