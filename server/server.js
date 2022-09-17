const express = required('express'); // import express
const taskRouter = require('./routes/task.router'); // import koala router
const PORT = process.env.PORT || 5000; // setup PORT to use env variable port OR default to 5000
const app = express(); // initialize express

app.use(express.urlencoded({extended: true})); // read data on POSTs
app.use(express.static('server/public')); // setup static files, checks here for matching paths first

// Routes
app.use('/tasks', taskRouter)

// Start listening for request on specificied PORT (keeps server running)
app.listen(PORT, () => console.log('Listening on Port', PORT));