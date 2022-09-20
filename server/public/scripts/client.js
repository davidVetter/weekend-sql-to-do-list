let sortToggle = true; // if true sort by descending order else by ascending order
let taskToEdit; // keep track of the task id for various functions
let readyToEdit = false; // Helps to make sure the correct task is edited

$(onReady); // runs onReady function when page loads

// Things that get done when page loads
function onReady() {
    //console.log('jQuery connnected');
    $('#editDiv').hide();
    $('#testElement').hide();
    $('#addFormDiv').hide();
    // Display the tasks from DB
    showTasks();
    // Call function to setup click events
    clickHandlers();
    // This function will montior window resizes and call a function
    // after the specified amount of time (150ms)
    //  **The timer is reset on each window resize event to prevent numerous excess
    //  calls to the server and database**
    $(window).resize(debounce(showTasks, 150));
}

function clickHandlers() {
    // This is a series of on click events
    $('#mainSection').on('click', '.deleteBtn', deleteConfirm);
    $('#mainSection').on('click', '.markComplete', markTaskComplete);
    $('#mainSection').on('click', '.editBtn', editWhichTask);
    $('.showHideBtn').on('click', displayAddTask);
    $('#addBtn').on('click', addTask);
    $('#cancelAddBtn').on('click', clearAddInputs);
    $('#editSubmitBtn').on('click', editTask);
    $('#cancelEditBtn').on('click', resetEdit);
    $('#sortDateDiv').on('click', setSort);
    $('#sortDueDiv').on('click', setSortDue);
    // This handles the two select elements and makes them run functions on a user
    // select of a child option element
    $('#sortSelectOption').change(showTasksAnySort);
    $('#mediumLayoutDiv').change('#sortSelectOption',showTasksAnySort);
    $('#mediumLayoutDiv').on('click', '.showHideBtn',displayAddTask);
}

// This function will perform a GET to return all rows from the db
// The response is sent to a function that determines the screen size currently
// and triggers the correct display function to perform on the returned data
// The order of the returned data is toggled from ASC to DESC on each GET
// *This is tied to the sort button in the DATE ADDED heading on the main display table*
function showTasks() {
    let sort = 'DESC';
    if (!sortToggle) {
        sort = 'ASC';
    }
    $.ajax({
        type: 'GET',
        url: `/tasks/${sort}`
    }).then(function(response) {
        console.log('Response from showTasks: ', response);
        // displayList(response);
        checkScreenSize(response);
    }).catch((error) => console.log('Error in showTasks', error));
}

// This function will perform a GET to return all rows from the db
// The response is sent to a function that determines the screen size currently
// and triggers the correct display function to perform on the returned data
// The order of the returned data is toggled from ASC to DESC on each GET
// *This is tied to the sort button in the DUE DATE heading on the main display table*
function showTasksDue() {
    let sort = 'DESC';
    if (!sortToggle) {
        sort = 'ASC';
    }
    $.ajax({
        type: 'GET',
        url: `/tasks/${sort}/duedate`
    }).then(function(response) {
        console.log('Response from showTasks: ', response);
        // displayList(response);
        checkScreenSize(response);
    }).catch((error) => console.log('Error in showTasks', error));
}

// This function will perform a GET based on the ORDER BY option from the select elements
// Each version of the DOM has a sort select element
function showTasksAnySort() {
    // This check makes sure a valid option was selected
    if ($('#sortSelectOption').val() === 'Select option to sort...') {
        return; 
    }
    // Split the value recieved at the comma
    // intially added in value attribute for option element
    // Pass the two values as params for the GET
    // Response is sent to functions to determine screen size
    // and display correctly
    let sortArray = $('#sortSelectOption').val().split(',');
    let sortBy = sortArray[0];
    let sort = sortArray[1];

    $.ajax({
        type: 'GET',
        url: `/tasks/${sortBy}/${sort}/anySort`
    }).then(function(response) {
        console.log('Response from showTasks: ', response);
        resetEdit();
        // displayList(response);
        checkScreenSize(response);
    }).catch((error) => console.log('Error in showTasks', error));
}

// This function will return only the task that has been marked for edit
// The info is then passed to a function that will use the data to fill
// edit inputs at the top of the DOM
function getEditInputs() {
    $.ajax({
        type: 'GET',
        url: `/tasks/${taskToEdit}/task`
    }).then((response) => {
        console.log('Response from setEditInputs: ', response);
        setEditInputs(response);
    })
}

// This function will handle the POST for adding a new task to the DB
// Refresh display after getting response and clears the input fields
function addTask() {
    $.ajax({
        type: 'POST',
        url: `/tasks`,
        data: {
            taskName: $('#taskNameIn').val(),
            taskDescription: $('#taskDescriptionIn').val(),
            dueDate: $('#dueDateIn').val()
        }
    }).then((response) => {
        console.log('Response from server ', response);
        showTasks();
        clearAddInputs();
    }).catch((error) => console.log(error));
}

// This function will do a DELETE to delete a task from the db
// The list of tasks is refreshed redisplayed
function deleteTask(event) {
    const taskId = $(event.target).data('taskid');
    console.log(taskId);
    $.ajax({
        type: 'DELETE',
        url: `/tasks/${taskId}`
    }).then(function(response) {
        console.log('Response from deleteTask: ', response);
        showTasks();
    }).catch((error) => console.log('Error in DELETE', error));
}

// This function is used to perform a PUT that will toggle if a task is complete or not
// It checks for a certain class being present to determine which route to use
// Class is applied to the task when the task is being displayed if task is complete or not
// at that time
function markTaskComplete(event) {
    const taskId = $(event.target).data('taskid');
    if ($(event.target).hasClass('YesBtn')) {
        $.ajax({
            type: 'PUT',
            url: `/tasks/${taskId}/notcomplete`
        }).then(function (){
            showTasks();
        }).catch((error) => console.log('Error in mark task complete', error));
    } else {
    $.ajax({
        type: 'PUT',
        url: `/tasks/${taskId}/complete`
    }).then(function (){
        showTasks();
    }).catch((error) => console.log('Error in mark task complete', error));
}
}

// This function will perform a PUT that can edit an existing task in the db
function editTask() {
    const taskId = taskToEdit;
    const addObj = getEditInfo();
    if (readyToEdit === false) { // check that toggle is true, makes sure correct id is being used
        console.log('Error occurred while trying to edit');
        return;
    };

    //console.log('This is addObj in editTask: ', addObj);
    // These next three checks handle the scenarios where mixed data exists
    // in regards to a task being complete and a complete date

    // If no complete selection on the DOM but a date complete entered
    // then task is marked complete
    if(!addObj.isComplete && addObj.dateComplete) {
        addObj.isComplete = true;
    }
    // if task is marked complete but no date complete, current date is filled to dateComplete
    if (addObj.isComplete && !addObj.dateComplete) {
        addObj.dateComplete = formatDate(new Date());
        //console.log("This is dateComplete: ", addObj.dateComplete);
    }
    // if complete selection is ACTUALLY marked "No" from select element
    // always clear dateComplete
    if (addObj.isComplete === 'false') {
        addObj.dateComplete = null;
    };

    $.ajax({
        type: 'PUT',
        url: `/tasks/${taskId}/edit`,
        data: {
            taskName: addObj.taskName,
            taskDescription: addObj.taskDescription,
            isComplete: addObj.isComplete,
            dateComplete: addObj.dateComplete,
            dueDate: addObj.dueDate
        }
    }).then(function() {
        showTasks(); // re-display tasks
        resetEdit(); // clear edit inputs, hide them
    }).catch((error) => console.log(error));
}

// This function will build a table on the DOM will all the tasks and their info
// This task format is used for screen 960px and above
// Each task is it's own row
// If this function is called, smaller screen layout is deleted and hidden
// Data comes in as an array of objects
function displayList(tasks) {
    $('#taskList').empty();
    $('#tableWrapper').show();
    $('#mediumLayoutDiv').hide();
    $('#mediumLayoutDiv').empty();
    for (let record of tasks) {
        let cleanRow = formatRow(record);
        $('#taskList').append(`
            <tr class='taskRows ${cleanRow.isComplete}Class'>
                <td class="botBorderCells nameCell">
                    <div id="nameOuterDiv">
                        <div id="nameInnerDiv">
                            <p>${cleanRow.taskName}</p>
                        </div>
                    </div>
                </td>
                <td class="descriptionCell botBorderCells">
                    <div id="descriptionBig">
                        <div id="descriptionInnerDiv">
                            <p>${cleanRow.taskDescription}</p>
                        </div>
                    </div>
                </td>
                <td class="botBorderCells centerDateCell">${cleanRow.dueDate}</td>
                <td class="completeCell botBorderCells">${cleanRow.isComplete}</td>
                <td class="botBorderCells centerDateCell">${cleanRow.dateComplete}</td>
                <td class="botBorderCells centerDateCell">${cleanRow.dateAdded}</td>
                <td id="buttonCell">
                    <div id="buttonDiv">
                            <img class="markComplete inputBtn ${cleanRow.isComplete}Btn"
                                data-taskid="${record.id}"
                                src="../../img/icons8-done-64.png">
                            <img class="editBtn inputBtn"
                                data-taskid="${record.id}"
                                src="../../img/icons8-edit-64.png">
                            <img class="deleteBtn inputBtn"
                                data-taskid="${record.id}"
                                src="../../img/icons8-trash-can-64.png">
                    </div>
                </td>
            </tr>
        `);
    }
}

// This function is used to display the tasks as column of div elements
// Used for screens less than 960px
// Always empties and hides the table from bigger screens
// Data comes in as an array of objects
function displayListMedium(tasks) {
    $('#taskList').empty();
    $('#tableWrapper').hide();
    $('#mediumLayoutDiv').show();
    $('#mediumLayoutDiv').empty();
    $('#mediumLayoutDiv').append(`<div id="showHideBtnDivMed">
                                    <img title="Create New Task" class="showHideBtn" src="./img/icons8-create-50.png">
                                    <select id="sortSelectOption">
                                        <option>Select option to sort...</option>
                                        <option value="taskName, ASC">Name (A-Z)</option>
                                        <option value="taskName, DESC">Name (Z-A)</option>
                                        <option value="dueDate, ASC">Due Date (Most Due)</option>
                                        <option value="dueDate, DESC">Due Date (Least Due)</option>
                                        <option value="isComplete, ASC">Completed (No-Yes)</option>
                                        <option value="isComplete, DESC">Completed (Yes-No)</option>
                                        <option value="dateComplete, ASC">Date Completed (Oldest)</option>
                                        <option value="dateComplete, DESC">Date Completed (Newest)</option>
                                        <option value="dateAdded, ASC">Date Added (Oldest)</option>
                                        <option value="dateAdded, DESC">Date Added (Newest)</option>
                                    </select>
                                 </div>`);
    for (let record of tasks) {
        let cleanRow = formatRow(record);
        $("#mediumLayoutDiv").append(`
            <div class='taskMainDiv ${cleanRow.isComplete}Class'>
            <div class="editNameDiv">
            <img class="editBtn inputBtn"
            data-taskid="${record.id}"
            src="../../img/icons8-edit-64.png">Task: ${cleanRow.taskName}</div>
            <div class="nameDiv">
                </div>
                <div class="descriptionDivSmall"><p class="descriptionText">Description: ${cleanRow.taskDescription}</p></div>
                <div class="smallDateDiv">Due Date: ${cleanRow.dueDate}</div>
                <div class="completeDiv">
                <p id="completeLabel">Complete? ${cleanRow.isComplete}</p>
                <div class="smallDateDiv">  Date Completed: ${cleanRow.dateComplete}</div>
                </div>
                <img class="markComplete inputBtn ${cleanRow.isComplete}Btn"
                data-taskid="${record.id}"
                src="../../img/icons8-done-64.png">
                <div class="smallDateDiv">Date Added: ${cleanRow.dateAdded}</div>
                <div id="buttonOuterDiv">
                    <div id="buttonDiv" data-taskid="${record.id}">
                            <button class="deleteBtn inputBtn"
                                data-taskid="${record.id}">Remove Task</button>
                    </div>
                </div>
            </div>
        `);
    }
}

// This function will take in an obj from "tasks" table
// It check if some values are present and inserts default
// values if needed. It also formats dates
function formatRow(obj) {
    //console.log('This is obj entering: ', obj);
    obj.dateAdded = formatDate(obj.dateAdded);
    // Converts true or false to Yes or No
    if (obj.isComplete) {
        obj.isComplete = 'Yes';
    } else {
        obj.isComplete = 'No';
    };
    // displays a message if no date present or formats date
    if (!obj.dateComplete) {
        obj.dateComplete = 'Not completed';
    } else {
        obj.dateComplete = formatDate(obj.dateComplete);
    };
    // displays a message if no date present or formats date
    if (!obj.dueDate) {
        obj.dueDate = 'No due date';
    } else {
        obj.dueDate = formatDate(obj.dueDate);
    };
    console.log('This is obj: ', obj);
    return obj;
}

// This function will take an date in full format with time and 
// return it in a standard MM/DD/YYYY format
function formatDate(dateDirty) {
    let niceDate = new Date(dateDirty);
    return niceDate.toLocaleDateString();
}

// This function grabs the info entered in the edit form
// returns the edit data as an object
function getEditInfo() {
    let editObj = {
        taskName: $('#taskNameEdit').val(),
        taskDescription: $('#taskDescriptionEdit').val(),
        isComplete: $('#isCompleteEdit').val(),
        dateComplete: $('#dateCompleteEdit').val(),
        dueDate: $('#dueDateEdit').val()
    }
    console.log('This is editObj: ', editObj);
    return editObj;
}

// This function will handle keeping track of which task is being edited
// It first checks if the page is currently in edit, if so edit is canceled
// It first strips all tasks of the class editSelect
// Then it adds the editSelect to the selected task so that is the only task with class
// Exposes the edit form
// calls function to get the information from DB to populate the edit form fields
function editWhichTask(event) {
    if (readyToEdit && $(event.target).data('taskid') === taskToEdit) {
        resetEdit();
        return;
    }
    taskToEdit = $(event.target).data('taskid');
    $('.editBtn').removeClass('editSelect');
    $(event.target).addClass('editSelect');
    readyToEdit = true;
    $('#editDiv').show();
    getEditInputs();
}

// This function will cancel an edit and reset page to proper no edit form
// All edit form inputs get cleared, readyToEdit toggle is reset
// All tasks have editSelect class removed if any have it
function resetEdit() {
    $('#editDiv').hide();
    $('#taskNameEdit').val('');
    $('#taskDescriptionEdit').val('');
    $('#isCompleteEdit').val('');
    $('#dateCompleteEdit').val('');
    $('#dueDateEdit').val('');
    readyToEdit = false;
    $('.editBtn').removeClass('editSelect')
}

// This function toggles the sort toggle so each call flips between ASC and DESC
// This is for the dateAdded GET for the sort button in table heading
function setSort() {
    sortToggle = !sortToggle;
    showTasks();
}

// This function toggles the sort toggle so each call flips between ASC and DESC
// This is for the dueDate GET for the sort button in table heading
function setSortDue() {
    sortToggle = !sortToggle;
    showTasksDue();
}

// This function will populate the edit form inputs
// It takes in the results of a GET for a single row
// Calls a function that moves focus back to the top
// of the page where the form is
function setEditInputs(row) {
    //console.log('This is row: ', row);
    let cleanRow = formatRow(row[0]);
    //console.log('This is cleanRow: ', cleanRow);
    //console.log('This is taskName? ', cleanRow.taskName);
    $('#taskNameEdit').val(cleanRow.taskName);
    $('#taskDescriptionEdit').val(cleanRow.taskDescription);
    $('#isCompleteEdit').val(`${cleanRow.isComplete}`);
    
    if (cleanRow.dateComplete === 'Not completed') {
        cleanRow.dateComplete = '';
    }
    $('#dateCompleteEdit').val(cleanRow.dateComplete);
    
    if (cleanRow.dueDate === 'No due date') {
        cleanRow.dueDate = '';
    }
    $('#dueDateEdit').val(cleanRow.dueDate);
    scrollToTop();
}

// This function will empty the inputs in the add task form
// Runs a toggle function to show/hide the add form
function clearAddInputs() {
    $('#taskNameIn').val('');
    $('#taskDescriptionIn').val('');
    $('#dueDateIn').val('');
    displayAddTask();
}

// This function will toggle if add task form is displayed or not depending
// on the current state
// Will move focus back to top of page if needed
function displayAddTask() {
    if ($('#addFormDiv').is(':visible')) {
        $('#addFormDiv').hide();
        $('.showHideBtn').show();
    } else {
    $('#addFormDiv').show();
    $('.showHideBtn').hide();
    scrollToTop();
    };
}

// This function will call a function based on the current size of a the screen
// Used to trigger the different layout functions as the screen size changes
function checkScreenSize(response) {
    if ($(window).width() > 960) {
        // Display standard size
        displayList(response);
        //$('#testElement').hide();
    } else if ($(window).width() < 960) {
        //$('#testElement').show();
        // Display mid sized table
        displayListMedium(response);
    } else if ($(window).width() < 500) {
        // Display smallest table of info
    }
}

// This function is a SWEET ALERTS alert to confirm a delete is wanted
// Sweet Alerts is a library used on this project
function deleteConfirm(event){
    swal({
        title:"Confirm Delete?",
        text: "This operation cannot be undone. Are you sure?",
        buttons: {
            cancel: true,
            confirm: "Yes, Delete"
        }
    }).then( val => {
        if(val) {
            swal({
                title: "Delete Successful!",
                text: "Task has been removed from database.",
                icon: "success"
            });
            deleteTask(event);
        }
    });
}

// This function will help control the number of times the server is called on window
// resizing. Certain browsers will keep triggering window resize events as a user drags
// the window sending many unwanted request.
// The function that actually should be called is put on a setTimeout that will be resest
// each time the window resize event is triggerred and then after a specificied amount of time
// (150ms) if no more events were fired, the function is called
// CREDIT TO GEEKSFORGEEKS.COM for most of the code used in this function
// https://www.geeksforgeeks.org/debouncing-in-javascript/
function debounce(func, delay) {
    let debounceTimer;
    return function() {
        const context = this;
        const args = arguments;
            clearTimeout(debounceTimer);
                debounceTimer = setTimeout(() => func.apply(context, args), delay);
    }
}

// This function will move focus back to the top of the screen
// Used with add task and edit task buttons to the user will be brought
// to the form if they are scrolled down on the page
function scrollToTop() {
    $(window).scrollTop(0);
}