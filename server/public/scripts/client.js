let sortToggle = true; // if true sort by descending order else by ascending order
let taskToEdit;
let readyToEdit = false;

$(onReady); // runs onReady function when page loads

function onReady() {
    console.log('jQuery connnected'); // test log to show this function is being called on load
    $('#editDiv').hide();
    $('#testElement').hide();
    $('#addFormDiv').hide();
    showTasks();
    clickHandlers();
    $(window).resize(checkScreenSize);
}

function clickHandlers() {
    $('#taskList').on('click', '.deleteBtn', deleteTask);
    $('#taskList').on('click', '.markComplete', markTaskComplete);
    $('#taskList').on('click', '.editBtn', editWhichTask);
    $('#showHideBtn').on('click', displayAddTask);
    $('#addBtn').on('click', addTask);
    $('#cancelAddBtn').on('click', clearAddInputs);
    $('#editSubmitBtn').on('click', editTask);
    $('#cancelEditBtn').on('click', resetEdit);
    $('#sortDateDiv').on('click', setSort);
}

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
        displayList(response);
    }).catch((error) => console.log('Error in showTasks', error));
}

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

function markTaskComplete(event) {
    const taskId = $(event.target).data('taskid');
    $.ajax({
        type: 'PUT',
        url: `/tasks/${taskId}/complete`
    }).then(function (){
        showTasks();
    }).catch((error) => console.log('Error in mark task complete', error));
}

function editTask() {
    const taskId = taskToEdit;
    const addObj = getEditInfo();
    if (readyToEdit === false) {
        console.log('Error occurred while trying to edit');
        return;
    }
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
        showTasks();
        resetEdit();
    }).catch((error) => console.log(error));
}

function displayList(tasks) {
    $('#taskList').empty();
    for (let record of tasks) {
        let cleanRow = formatRow(record);
        $('#taskList').append(`
            <tr class='taskRows ${cleanRow.isComplete}Class'>
                <td class="botBorderCells">${cleanRow.taskName}</td>
                <td class="descriptionCell botBorderCells">${cleanRow.taskDescription}</td>
                <td class="botBorderCells">${cleanRow.dueDate}</td>
                <td class="completeCell botBorderCells">${cleanRow.isComplete}</td>
                <td class="botBorderCells">${cleanRow.dateComplete}</td>
                <td class="botBorderCells">${cleanRow.dateAdded}</td>
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

// This function will take in an obj from "tasks" table
// It check if some values are present and inserts default
// values if needed. It also formats dates
function formatRow(obj) {
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

    return obj;
}

function formatDate(dateDirty) {
    let niceDate = new Date(dateDirty);
    return niceDate.toLocaleDateString();
}

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
}

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

function setSort() {
    sortToggle = !sortToggle;
    showTasks();
}

function clearAddInputs() {
    $('#taskNameIn').val('');
    $('#taskDescriptionIn').val('');
    $('#dueDateIn').val('');
    displayAddTask();
}

function displayAddTask() {
    if ($('#addFormDiv').is(':visible')) {
        $('#addFormDiv').hide();
        $('#showHideBtn').show();
    } else {
    $('#addFormDiv').show();
    $('#showHideBtn').hide();
    };
}

function checkScreenSize() {
    if ($(window).width() > 960) {
        $('#testElement').hide();
        // Display standard size
    } else if ($(window).width() < 960) {
        $('#testElement').show();
        // Display mid sized table
    } else if ($(window).width() < 500) {
        // Display smallest table of info
    }
}