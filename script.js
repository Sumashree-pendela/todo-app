var todo = document.getElementById("inputField");
var priority = document.getElementById("todoPriority");
var addButton = document.getElementById("addTodo");
var todoContainer = document.getElementById("todosContainer");
var dialog = document.getElementById("dialog-content");
var dialogInput = document.getElementById("dialogInput");
var dialogPriority = document.getElementById("dialogPriority");
var dialogDate = document.getElementById("dialogDate");
var dialogTime = document.getElementById("dialogTime");
var dialogSave = document.getElementById("dialog-save");
var dialogCancel = document.getElementById("dialog-cancel");
var todoCounter = 0;
var theme = document.getElementById("theme");
var search = document.getElementById("todoSearch");
var todoTime = document.getElementById("todoTime");
var todoDate = document.getElementById("todoDate");
var todoSort = document.getElementById("todoSort");
var subtask = document.getElementById("subTaskDialogInput");
var subTaskDialog = document.getElementById("subTaskDialog");
var subTaskPriority = document.getElementById("subTaskDialogPriority");
var subTaskDate = document.getElementById("subTaskDialogDate");
var subTaskTime = document.getElementById("subTaskDialogTime");
var subTaskSave = document.getElementById("subTask-dialog-save");
var subTaskCancel = document.getElementById("subTask-dialog-cancel");
var subTaskCounter = 0;
var currentParentTodo;

loadTasks();

addButton.addEventListener('click', addToDo);

subTaskSave.addEventListener('click', addSubTodo);

subTaskCancel.addEventListener('click', function () {
    subTaskDialog.style.display = 'none';
});


theme.addEventListener('click', themeChange);

search.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        searchTodos();
    }

});

document.getElementById('export').addEventListener('click', exportTasks);

document.getElementById('importFileInput').addEventListener('change', importTasks);

todoSort.addEventListener('click', function () {
    console.log(todoSort.value);

    if (todoSort.value === 'Priority') {
        sortTodoByPriority();
    } else if (todoSort.value === 'Time') {
        sortTodoByTime();
    }
});

function requestNotificationPermission() {
    if (Notification.permission !== "granted") {
        Notification.requestPermission().then(permission => {
            console.log('Notification permission:', permission);
        });
    }
}


function addToDo() {
    let todoName = todo.value;

    console.log(todoName);
    todoCounter++;
    let todoId = todoCounter;

    if (todoName.trim() == '' || todoName == '') {
        alert("To Do Name cannot be empty");
        return;
    }

    let allTasks = JSON.parse(localStorage.getItem('allTodos')) || [];

    let duplicateTask = allTasks.some(task => task.todoName.toLowerCase() === todoName.toLowerCase());

    if (duplicateTask) {
        alert("Task already exists");
        return;
    }

    let priorityValue = priority.value;
    console.log(priorityValue);

    if (priorityValue == '' || priorityValue.trim() == '') {
        alert("select priority for the to do");
        return;
    }

    let now = new Date();

    let timeValue = todoTime.value;
    console.log(timeValue);
    let currentTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });



    let dateValue = todoDate.value;
    let currentDate = now.toISOString().split('T')[0];

    if (dateValue < currentDate) {
        alert("You cannot add previous dates");
        return;
    }

    if (dateValue === currentDate) {
        if (timeValue < currentTime) {
            alert("Add the time after " + currentTime);
            return;
        }
    }

    createToDo(todoName, priorityValue, todoId, timeValue, dateValue);

    saveTasks();
    todo.value = '';
    priority.value = '';
    todoTime.value = '';
    todoDate.value = '';

}

function createToDo(todoName, priorityValue, todoId, timeValue, dateValue) {

    const todo = document.createElement('div');
    todo.classList.add('todo');
    todo.setAttribute('draggable', 'true');
    todo.setAttribute('id', todoId);


    let todoValue = document.createElement('input');
    todoValue.classList.add("todo-input");
    todoValue.type = "text";
    todoValue.value = todoName;
    todoValue.setAttribute('readOnly', 'readOnly');
    todo.appendChild(todoValue);

    const todoPriority = document.createElement('select');
    todoPriority.classList.add("todo-priority");
    todoPriority.innerHTML = `
        <option value="High">High</option>
        <option value="Medium">Medium</option>
        <option value="Low">Low</option>
    `;
    todoPriority.value = priorityValue;
    todoPriority.setAttribute('readOnly', 'readOnly');
    todoPriority.disabled = true;
    todo.appendChild(todoPriority);

    let todoDate = document.createElement('input');
    todoDate.classList.add("todo-date");
    todoDate.type = "date";
    todoDate.value = dateValue;
    todo.appendChild(todoDate);

    let todoTime = document.createElement('input');
    todoTime.classList.add("todo-time");
    todoTime.type = "time";
    todoTime.value = timeValue;
    todoTime.setAttribute('readonly', 'readonly');
    todo.appendChild(todoTime);

    let todoEdit = document.createElement('button');
    todoEdit.classList.add('btn', 'btn-success', 'todo-edit');
    todoEdit.type = "button";
    todoEdit.innerHTML = "Edit";
    todo.appendChild(todoEdit);

    let todoDelete = document.createElement('button');
    todoDelete.classList.add('btn', 'btn-danger', 'todo-del');
    todoDelete.type = "button";
    todoDelete.innerHTML = "Del";
    todo.appendChild(todoDelete);

    let todoSubtask = document.createElement('button');
    todoSubtask.classList.add('btn', 'btn-primary', 'todo-subtask');
    todoSubtask.type = "button";
    todoSubtask.innerHTML = "+";
    todo.appendChild(todoSubtask);

    todoEventListener(todo, todoEdit, todoDelete, todoSubtask);

    todoContainer.appendChild(todo);
    sortTodoByPriority();

    return todo;

}


function todoEventListener(todo, todoEdit, todoDelete, todoSubtask) {
    const todoItem = todo.querySelector('.todo-input');
    const todoPriority = todo.querySelector('.todo-priority');
    const todoDate = todo.querySelector('.todo-date');
    const todoTime = todo.querySelector('.todo-time');
    console.log(todoDate.value);
    console.log(todoTime.value);

    todoEdit.addEventListener('click', () => {
        if (todoEdit.innerText === "Edit") {
            currentTodoItem = todoItem;
            currentToDoPriority = todoPriority;
            currentToDoDate = todoDate;
            currentTodoTime = todoTime;

            todoEdit.innerText = "Save";
            dialogInput.value = todoItem.value;
            dialogPriority.value = todoPriority.value;
            dialogDate.value = todoDate.value;
            dialogTime.value = todoTime.value;

            dialog.style.display = 'block';
        } else {
            todo.innerText = "Edit";
        }

    });

    dialogSave.addEventListener('click', () => {
        if (dialogInput.value == '' || dialogInput.value.trim() == '') {
            alert("To do name cannot be empty");
            return;
        }

        if (dialogPriority.value == '') {
            alert("select priority for to do");
            return;
        }

        let now = new Date();

        if (dialogDate.value == '') {
            alert("select date for todo");
            return;
        }

        let dateValue = dialogDate.value;
        let currentDate = now.toISOString().split('T')[0];

        if (dateValue < currentDate) {
            alert("You cannot add previous dates");
            return;
        }

        if (dialogTime.value == '') {
            alert("Time cannot be empty");
        }

        let timeValue = dialogTime.value;
        let currentTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });

  

        if(dateValue === currentDate) {
            if (timeValue < currentTime) {
                alert("Add the time after " + currentTime);
                return;
            }
        }

        currentTodoItem.value = dialogInput.value;
        currentToDoPriority.value = dialogPriority.value;
        currentToDoDate.value = dialogDate.value;
        currentTodoTime.value = dialogTime.value;

        dialog.style.display = 'none';
        todoEdit.innerText = 'Edit';
        saveTasks();
    });

    dialogCancel.addEventListener('click', () => {
        dialog.style.display = 'none';
        todoEdit.innerText = 'Edit';
        saveTasks();
    });

    todoDelete.addEventListener('click', () => {
        todoContainer.removeChild(todo);
        saveTasks();
    });

    todo.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', todo.getAttribute('id'));
        e.dataTransfer.effectAllowed = 'move';
    });

    todo.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    });

    todo.addEventListener('drop', (e) => {
        e.preventDefault();
        const draggedElementId = e.dataTransfer.getData('text/plain');
        const draggedElement = document.getElementById(draggedElementId);

        if (draggedElement !== todo) {
            todoContainer.insertBefore(draggedElement, todo);
            saveTasks();
        }
    });

    todoSubtask.addEventListener('click', () => {
        currentParentTodo = todo;
        subTaskDialog.style.display = 'block';
    });
}

function saveTasks() {
    const todos = document.querySelectorAll(".todo");
    const allTasks = Array.from(todos).map(todo => {
        let id = todo.getAttribute('id');
        let todoName = todo.querySelector('.todo-input').value;
        let todoPriority = todo.querySelector('.todo-priority').value;
        let todoTime = todo.querySelector('.todo-time').value;
        let todoDate = todo.querySelector('.todo-date').value;

        const subtasks = Array.from(todo.querySelectorAll('.sub-task')).map(subTask => {
            let subTaskId = subTask.getAttribute('id');
            let subTaskName = subTask.querySelector('.sub-task-input').value;
            let subTaskPriority = subTask.querySelector('.sub-task-priority').value;
            let subTaskTime = subTask.querySelector('.sub-task-time').value;
            let subTaskDate = subTask.querySelector('.sub-task-date').value;

            return { subTaskId, subTaskName, subTaskPriority, subTaskTime, subTaskDate };
        });

        return { id, todoName, todoPriority, todoTime, todoDate, subtasks };
    });

    localStorage.setItem('allTodos', JSON.stringify(allTasks));
}


function loadTasks() {
    let allTasks = JSON.parse(localStorage.getItem('allTodos')) || [];
    console.log(allTasks);

    if (allTasks !== '') {
        allTasks.forEach(task => {
            const todo = createToDo(task.todoName, task.todoPriority, task.id, task.todoTime, task.todoDate);
            scheduleNotification(task.id, task.todoDate, task.todoTime);

            task.subtasks.forEach(subTask => {
                createSubTask(subTask.subTaskName, subTask.subTaskPriority, subTask.subTaskId, subTask.subTaskTime, subTask.subTaskDate, todo);
                scheduleNotification(subTask.subTaskId, subTask.subTaskDate, subTask.subTaskTime);
            });
        });
    }
}


function themeChange() {
    console.log("Inside ")
    if (theme.innerText === 'Light') {
        document.body.classList.remove('dark-mode');
        document.body.classList.add('light-mode');
        theme.innerText = 'Dark';
    } else {
        document.body.classList.remove('light-mode');
        document.body.classList.add('dark-mode');
        theme.innerText = 'Light';
    }
}

function searchTodos() {
    console.log("Inside search method");

    var searchValue = search.value.toLowerCase();
    console.log(searchValue);
    const todos = document.querySelectorAll(".todo");

    todos.forEach(todo => {
        const todoName = todo.querySelector('.todo-input').value.toLowerCase();
        if (todoName.includes(searchValue)) {
            todo.style.display = 'block';
        } else {
            todo.style.display = 'none';
        }

        const subTasks = todo.querySelectorAll('.todo-subtask');

        if (subTasks !== '') {
            subTasks.forEach(subtask => {
                const subtaskName = subtask.querySelector('.sub-task-input').value.toLowerCase();
                if (subtaskName.includes(searchValue)) {
                    subtask.style.display = 'block';
                } else {
                    subtask.style.display = 'none';
                }
            });
        }
    });
}


function sortTodoByPriority() {
    const todos = Array.from(document.querySelectorAll(".todo"));
    todos.sort((todo1, todo2) => {
        const priority1 = todo1.querySelector('.todo-priority').value;
        const priority2 = todo2.querySelector('.todo-priority').value;

        const priorityOrder = { 'High': 1, 'Medium': 2, 'Low': 3 };

        return priorityOrder[priority1] - priorityOrder[priority2];
    });

    todoContainer.innerHTML = '';
    todos.forEach(todo => todoContainer.appendChild(todo));
}

function sortTodoByTime() {
    const todos = Array.from(document.querySelectorAll(".todo"));

    console.log(todos);
    todos.sort((todo1, todo2) => {
        let date1 = todo1.querySelector('.todo-date').value;
        let date2 = todo2.querySelector('.todo-date').value;
        let time1 = todo1.querySelector('.todo-time').value;
        let time2 = todo2.querySelector('.todo-time').value;

        if (date1 === date2) {
            return time1.localeCompare(time2);
        }

        return date1.localeCompare(date2);
    });
}

function addSubTodo() {
    let subTaskName = subtask.value;

    if (subTaskName.trim() == '' || subTaskName == '') {
        alert("Sub Task Name cannot be empty");
        return;
    }

    let allTasks = JSON.parse(localStorage.getItem('allTodos')) || [];

    let duplicateSubTask = false;

    allTasks.forEach(task => {
        task.subtasks.forEach(subTask => {
            if (subTask.subTaskName.toLowerCase() === subTaskName.toLowerCase()) {
                duplicateSubTask = true;
            }
        });
    });

    if (duplicateSubTask) {
        alert("Sub Task already exists");
        return;
    }

    let subTaskPriorityValue = subTaskPriority.value;

    if (subTaskPriorityValue == '' || subTaskPriorityValue.trim() == '') {
        alert("Select priority for the sub task");
        return;
    }

    let now = new Date();

    let subTaskTimeValue = subTaskTime.value;
    let currentTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });

    let subTaskDateValue = subTaskDate.value;
    let currentDate = now.toISOString().split('T')[0];

    if (subTaskDateValue < currentDate) {
        alert("You cannot add previous dates");
        return;
    }

    if (subTaskDateValue === currentDate) {
        if (subTaskTimeValue < currentTime) {
            alert("Add the time after " + currentTime);
            return;
        }
    }

    createSubTask(subTaskName, subTaskPriorityValue, `subtask-${++subTaskCounter}`, subTaskTimeValue, subTaskDateValue, currentParentTodo);

    saveTasks();
    subTaskDialog.style.display = 'none';
    subtask.value = '';
    subTaskPriority.value = '';
    subTaskTime.value = '';
    subTaskDate.value = '';
}


function createSubTask(subTaskName, subTaskPriorityValue, subTaskId, subTaskTimeValue, subTaskDateValue, parentTodo) {
    const subTask = document.createElement('div');
    subTask.classList.add('sub-task');
    subTask.setAttribute('draggable', 'true');
    subTask.setAttribute('id', subTaskId);

    let subTaskValue = document.createElement('input');
    subTaskValue.classList.add("sub-task-input");
    subTaskValue.type = "text";
    subTaskValue.value = subTaskName;
    subTaskValue.setAttribute('readOnly', 'readOnly');
    subTask.appendChild(subTaskValue);

    const subTaskPriority = document.createElement('select');
    subTaskPriority.classList.add("sub-task-priority");
    subTaskPriority.innerHTML = `
        <option value="High">High</option>
        <option value="Medium">Medium</option>
        <option value="Low">Low</option>
    `;
    subTaskPriority.value = subTaskPriorityValue;
    subTaskPriority.setAttribute('readOnly', 'readOnly');
    subTaskPriority.disabled = true;
    subTask.appendChild(subTaskPriority);

    let subTaskDate = document.createElement('input');
    subTaskDate.classList.add("sub-task-date");
    subTaskDate.type = "date";
    subTaskDate.value = subTaskDateValue;
    subTask.appendChild(subTaskDate);

    let subTaskTime = document.createElement('input');
    subTaskTime.classList.add("sub-task-time");
    subTaskTime.type = "time";
    subTaskTime.value = subTaskTimeValue;
    subTaskTime.setAttribute('readonly', 'readonly');
    subTask.appendChild(subTaskTime);

    let subTaskEdit = document.createElement('button');
    subTaskEdit.classList.add('btn', 'btn-success', 'sub-task-edit');
    subTaskEdit.type = "button";
    subTaskEdit.innerHTML = "Edit";
    subTask.appendChild(subTaskEdit);

    let subTaskDelete = document.createElement('button');
    subTaskDelete.classList.add('btn', 'btn-danger', 'sub-task-del');
    subTaskDelete.type = "button";
    subTaskDelete.innerHTML = "Del";
    subTask.appendChild(subTaskDelete);

    subTaskEventListener(subTask, subTaskEdit, subTaskDelete);

    if (parentTodo) {
        parentTodo.appendChild(subTask);
    } else {
        todoContainer.appendChild(subTask);
    }

    return subTask;
}


function subTaskEventListener(subTask, subTaskEdit, subTaskDelete) {
    const subTaskItem = subTask.querySelector('.sub-task-input');
    const subTaskPriority = subTask.querySelector('.sub-task-priority');
    const subTaskDate = subTask.querySelector('.sub-task-date');
    const subTaskTime = subTask.querySelector('.sub-task-time');

    subTaskEdit.addEventListener('click', () => {
        if (subTaskEdit.innerText === "Edit") {
            subTaskEdit.innerText = "Save";

            subTaskItem.removeAttribute('readOnly');
            subTaskPriority.disabled = false;
            subTaskDate.removeAttribute('readOnly');
            subTaskTime.removeAttribute('readOnly');

        } else {
            subTaskItem.setAttribute('readOnly', 'readOnly');
            subTaskPriority.disabled = true;
            subTaskDate.setAttribute('readOnly', 'readOnly');
            subTaskTime.setAttribute('readOnly', 'readOnly');

            subTaskEdit.innerText = "Edit";
            saveTasks();
        }
    });

    subTaskDelete.addEventListener('click', () => {
        subTask.parentElement.removeChild(subTask);
        saveTasks();
    });

    subTask.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', subTask.getAttribute('id'));
        e.dataTransfer.effectAllowed = 'move';
    });

    subTask.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    });

    subTask.addEventListener('drop', (e) => {
        e.preventDefault();
        const draggedElementId = e.dataTransfer.getData('text/plain');
        const draggedElement = document.getElementById(draggedElementId);

        if (draggedElement !== subTask) {
            todoContainer.insertBefore(draggedElement, subTask);
            saveTasks();
        }
    });
}

function exportTasks() {
    const allTasks = JSON.parse(localStorage.getItem('allTodos')) || [];
    const dataStr = JSON.stringify(allTasks, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

    const exportFileDefaultName = 'tasks.json';

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
}

function importTasks(event) {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = function (e) {
        try {
            const importedTasks = JSON.parse(e.target.result);
            const existingTasks = JSON.parse(localStorage.getItem('allTodos')) || [];

            const mergedTasks = existingTasks.concat(importedTasks);
            localStorage.removeItem('allTodos');
            localStorage.setItem('allTodos', JSON.stringify(mergedTasks));

            loadTasks();
        } catch (err) {
            alert('Error reading the file. Make sure it is a valid JSON file.');
        }
    };

    reader.readAsText(file);
}

function scheduleNotification(itemId, dateValue, timeValue) {

    if (!("Notification" in window)) {
        alert("Doesnt support notification");
        return;
    }

    const taskDateTime = new Date(`${dateValue}T${timeValue}`);
    const notificationTime = taskDateTime.getTime() - (10 * 60 * 1000); // 10 minutes before notification
    console.log("Scheduled notification time: ", new Date(notificationTime));

    if (notificationTime > Date.now()) {
        const timeUntilNotification = notificationTime - Date.now();
        console.log("Time until notification: ", timeUntilNotification);

        setTimeout(() => {
            showNotification(itemId);
        }, timeUntilNotification);
    } else {
        console.log("Notification time is in the past, not scheduling.");
    }
}

function showNotification(itemId) {
    const item = document.getElementById(itemId);
    const text = item.querySelector('.text').value;

    if (Notification.permission === "granted") {
        new Notification('Task Reminder', {
            body: `Remainder: ${text} is due soon!`,
            icon: 'path/to/icon.png' 
        });
    } else {
        console.log("Notification permission not granted.");
    }
}
