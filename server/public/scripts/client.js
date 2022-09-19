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
    $(window).resize(debounce(showTasks, 150));
}

function clickHandlers() {
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
    $('#sortSelectOption').change(showTasksAnySort);
    $('#mediumLayoutDiv').change('#sortSelectOption',showTasksAnySort);
    $('#mediumLayoutDiv').on('click', '.showHideBtn',displayAddTask);
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
        // displayList(response);
        checkScreenSize(response);
    }).catch((error) => console.log('Error in showTasks', error));
}

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

function showTasksAnySort() {
    if ($('#sortSelectOption').val() === 'Select option to sort...') {
        return;
    }
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

function getEditInputs() {
    $.ajax({
        type: 'GET',
        url: `/tasks/${taskToEdit}/task`
    }).then((response) => {
        console.log('Response from setEditInputs: ', response);
        setEditInputs(response);
    })
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

function editTask() {
    const taskId = taskToEdit;
    const addObj = getEditInfo();
    if (readyToEdit === false) {
        console.log('Error occurred while trying to edit');
        return;
    };

    console.log('This is addObj in editTask: ', addObj);
    if(!addObj.isComplete && addObj.dateComplete) {
        addObj.isComplete = true;
    }

    if (addObj.isComplete && !addObj.dateComplete) {
        addObj.dateComplete = formatDate(new Date());
        console.log("This is dateComplete: ", addObj.dateComplete);
    }

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
        showTasks();
        resetEdit();
    }).catch((error) => console.log(error));
}

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
    console.log('This is obj entering: ', obj);
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
    getEditInputs();
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

function setSortDue() {
    sortToggle = !sortToggle;
    showTasksDue();
}

function setEditInputs(row) {
    console.log('This is row: ', row);
    let cleanRow = formatRow(row[0]);
    console.log('This is cleanRow: ', cleanRow);
    console.log('This is taskName? ', cleanRow.taskName);
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
        $('.showHideBtn').show();
    } else {
    $('#addFormDiv').show();
    $('.showHideBtn').hide();
    };
}

function checkScreenSize(response) {
    if ($(window).width() > 960) {
        displayList(response);
        $('#testElement').hide();
        // Display standard size
    } else if ($(window).width() < 960) {
        $('#testElement').show();
        displayListMedium(response);
        // Display mid sized table
    } else if ($(window).width() < 500) {
        // Display smallest table of info
    }
}

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

function debounce(func, delay) {
    let debounceTimer;
    return function() {
        const context = this;
        const args = arguments;
            clearTimeout(debounceTimer);
                debounceTimer = setTimeout(() => func.apply(context, args), delay);
    }
}