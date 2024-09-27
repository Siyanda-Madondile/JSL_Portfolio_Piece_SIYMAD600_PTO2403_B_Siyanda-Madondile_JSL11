// TASK: import helper functions from utils
import {
  getTasks,
  createNewTask,
  patchTask,
  putTask,
  deleteTask,
} from "./utils/taskFunctions.js";
// TASK: import initialData
import { initialData } from "./initialData.js";

/*************************************************************************************************************************************************
 * FIX BUGS!!!
 * **********************************************************************************************************************************************/

/**
 *
 * Initializing the data
 *
 */
// Function checks if local storage already has data, if not it loads initialData to localStorage
function initializeData() {
  if (!localStorage.getItem("tasks")) {
    localStorage.setItem("tasks", JSON.stringify(initialData));
    localStorage.setItem("showSideBar", "true");
  } else {
    console.log("Data already exists in localStorage");
  }
}
initializeData();

/**
 *
 * Dom Elemeents
 *
 */
const elements = {
  filterDiv: document.getElementById("filterDiv"),
  boardsContainer: document.getElementById("boards-nav-links-div"),
  modalWindow: document.querySelector(".modal-window"),
  editTaskModal: document.querySelector(".edit-task-modal-window"),
  headerBoardName: document.getElementById("header-board-name"),
  // Sidebar elements
  sidebar: document.getElementById("side-bar-div"),
  hideSideBarBtn: document.querySelector(".hide-side-bar-div"),
  showSideBarBtn: document.getElementById("show-side-bar-btn"),
  themeSwitch: document.getElementById("switch"),
  //Header/body elements
  createNewTaskBtn: document.getElementById("add-new-task-btn"),
  boardsNavLinksDiv: document.getElementById("boards-nav-links-div"),
  columnDivs: document.querySelectorAll(".column-div"),
  //New Task form and button elements
  createTaskBtn: document.getElementById("create-task-btn"),
  addTaskForm: document.getElementById("new-task-modal-window"),
  editTaskForm: document.getElementById("edit-task-form"),
  cancelAddTaskBtn: document.getElementById("cancel-add-task-btn"),
  //New task input fields
  titleInput: document.getElementById("title-input"),
  descInput: document.getElementById("desc-input"),
  modalSelectStatus: document.getElementById("select-status"),
  //Edit task elements
  editTaskTitleInput: document.getElementById("edit-task-title-input"),
  editTaskDescInput: document.getElementById("edit-task-desc-input"),
  editTaskSelectStatus: document.getElementById("edit-select-status"),
  editTaskModalWindow: document.querySelector(".edit-task-modal-window"),
  cancelEditBtn: document.getElementById("cancel-edit-btn"),
  saveChangesBtn: document.getElementById("save-task-changes-btn"),
  deleteTaskBtn: document.getElementById("delete-task-btn"),
};

/*
 *
 *Creating/styling/displaying active boards to the DOM
 *
 */

// Styles the active board by adding an active class
function styleActiveBoard(boardName) {
  document.querySelectorAll(".board-btn").forEach((btn) => {
    if (btn.textContent === boardName) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });
}

//Refreshes the UI for active board
function refreshTasksUI() {
  filterAndDisplayTasksByBoard(activeBoard);
}

let activeBoard = "";

// Extracts unique board names from tasks
function fetchAndDisplayBoardsAndTasks() {
  const tasks = getTasks();
  const boards = [...new Set(tasks.map((task) => task.board).filter(Boolean))];
  displayBoards(boards);
  if (boards.length > 0) {
    const localStorageBoard = JSON.parse(localStorage.getItem("activeBoard"));
    activeBoard = localStorageBoard ? localStorageBoard : boards[0];
    elements.headerBoardName.textContent = activeBoard;
    styleActiveBoard(activeBoard);
    refreshTasksUI();
  }
}

// Creates different boards in the DOM
function displayBoards(boards) {
  elements.boardsContainer.innerHTML = ""; // Clears the container
  boards.forEach((board) => {
    const boardElement = document.createElement("button");
    boardElement.textContent = board;
    boardElement.classList.add("board-btn");
    boardElement.addEventListener("click", function () {
      elements.headerBoardName.textContent = board;
      filterAndDisplayTasksByBoard(board);
      activeBoard = board; //assigns active board
      localStorage.setItem("activeBoard", JSON.stringify(activeBoard));
      styleActiveBoard(activeBoard);
    });
    elements.boardsContainer.appendChild(boardElement);
  });
}

//Filters tasks corresponding to the board name and displays them on the DOM
function filterAndDisplayTasksByBoard(boardName) {
  const tasks = getTasks(); // Fetch tasks from a simulated local storage function
  const filteredTasks = tasks.filter((task) => task.board === boardName);

  // filters over the data and creates div elements in the DOM according to the status key:value
  elements.columnDivs.forEach((column) => {
    const status = column.getAttribute("data-status");
    // Reset column content while preserving the column title
    column.innerHTML = `<div class="column-head-div">
    <span class="dot" id="${status}-dot"></span>
    <h4 class="columnHeader">${status.toUpperCase()}</h4>
    </div>`;

    const tasksContainer = document.createElement("div");
    column.appendChild(tasksContainer);

    filteredTasks
      .filter((task) => task.status === status)
      .forEach((task) => {
        const taskElement = document.createElement("div");
        taskElement.classList.add("task-div");
        taskElement.textContent = task.title;
        taskElement.setAttribute("data-task-id", task.id);

        // Listen for a click event on each task and open a modal
        taskElement.addEventListener("click", () => {
          openEditTaskModal(task);
        });
        tasksContainer.appendChild(taskElement);
      });
  });
}

/**
 *
 * View/edit/cancel/delete tasks
 *
 */
function openEditTaskModal(task) {
  // Set task details in modal inputs
  elements.editTaskTitleInput.value = task.title;
  elements.editTaskDescInput.value = task.description;
  elements.editTaskSelectStatus.value = task.status;
  // Call saveTaskChanges upon click of Save Changes button
  elements.saveChangesBtn.onclick = function () {
    saveTaskChanges(task.id);
  };
  // Delete task using a helper function and close the task modal
  elements.deleteTaskBtn.onclick = function () {
    //Confirmation popup
    const confirmation = window.confirm(
      "Are you sure you want to delete this taks?"
    );
    if (confirmation) {
      deleteTask(task.id); // Deletes a task by ID from local storage and returns the updated task list.
      toggleModal(false, elements.editTaskModal);
      refreshTasksUI();
    }
  };
  // Show the edit task modal
  toggleModal(true, elements.editTaskModal);
}

function saveTaskChanges(taskId) {
  // Get new user inputs
  const updatedTask = {
    title: elements.editTaskTitleInput.value,
    description: elements.editTaskDescInput.value,
    status: elements.editTaskSelectStatus.value,
  };
  // Updates a task in local storage with specified changes and saves the updated tasks
  patchTask(taskId, updatedTask);
  // Close the modal and refresh the UI to reflect the changes
  toggleModal(false, elements.editTaskModal);
  refreshTasksUI();
}

function setupEventListeners() {
  // Cancel editing task event listener without saving
  elements.cancelEditBtn.addEventListener("click", () =>
    toggleModal(false, elements.editTaskModal)
  );

  // Cancel adding new task event listener
  elements.cancelAddTaskBtn.addEventListener("click", () => {
    toggleModal(false);
    elements.filterDiv.style.display = "none"; // Also hide the filter overlay
  });

  // Clicking outside the NewTask modal to close it
  elements.filterDiv.addEventListener("click", () => {
    toggleModal(false);
    elements.filterDiv.style.display = "none"; // Also hide the filter overlay
  });

  // Show sidebar event listener
  elements.hideSideBarBtn.addEventListener("click", () => toggleSidebar(false));
  elements.showSideBarBtn.addEventListener("click", () => toggleSidebar(true));

  // Theme switch event listener
  elements.themeSwitch.addEventListener("change", toggleTheme);

  // Show Add New Task Modal event listener
  elements.createNewTaskBtn.addEventListener("click", () => {
    toggleModal(true);
    elements.filterDiv.style.display = "block"; // Also show the filter overlay
  });

  // Add new task form submission event listener
  elements.modalWindow.addEventListener("submit", (event) => {
    addTask(event);
  });
}

// Toggles tasks modal
// Task: Fix bugs
function toggleModal(show, modal = elements.modalWindow) {
  modal.style.display = show ? "block" : "none";
}

/*************************************************************************************************************************************************
 * COMPLETE FUNCTION CODE
 * **********************************************************************************************************************************************/

/*
 *
 * Adding new tasks to the DOM
 *
 */
function addTask(event) {
  event.preventDefault();
  //Assign user input to the task object
  const task = {
    title: elements.titleInput.value,
    description: elements.descInput.value,
    status: elements.modalSelectStatus.value,
    board: activeBoard,
  };
  const newTask = createNewTask(task);
  if (newTask) {
    addTaskToUI(newTask);
    toggleModal(false);
    elements.filterDiv.style.display = "none"; // Also hide the filter overlay
    event.target.reset(); // Resets the form fields
    refreshTasksUI();
  }
}

function addTaskToUI(task) {
  // Identifying the correct column to place the new task accoding to the status
  const column = document.querySelector(
    `.column-div[data-status="${task.status}"]`
  );
  if (!column) {
    console.error(`Column not found for status: ${task.status}`);
    return;
  }

  let tasksContainer = column.querySelector(".tasks-container");
  if (!tasksContainer) {
    console.warn(
      `Tasks container not found for status: ${task.status}, creating one.`
    );
    tasksContainer = document.createElement("div");
    tasksContainer.className = "tasks-container";
    column.appendChild(tasksContainer);
  }

  const taskElement = document.createElement("div");
  taskElement.className = "task-div";
  taskElement.textContent = task.title; // Modify as needed
  taskElement.setAttribute("data-task-id", task.id);

  tasksContainer.appendChild(taskElement);
}

/**
 *
 * Sidebar and Theme
 *
 */
//Toggle sidebar
function toggleSidebar(show) {
  if (show) {
    elements.sidebar.style.display = "flex";
    elements.showSideBarBtn.style.display = "none";
    elements.hideSideBarBtn.style.display = "flex";
  } else {
    elements.sidebar.style.display = "none";
    elements.showSideBarBtn.style.display = "block";
    elements.hideSideBarBtn.style.display = "none";
  }
}

// Theme switch
function toggleTheme() {
  const themeLogo = document.getElementById("logo");
  if (elements.themeSwitch.checked) {
    document.body.classList.add("light-theme");
    document.body.classList.remove("dark-theme");
    themeLogo.src = "./assets/logo-light.svg";
  } else {
    document.body.classList.remove("light-theme");
    document.body.classList.add("dark-theme");
    themeLogo.src = "./assets/logo-dark.svg";
  }
}

/*************************************************************************************************************************************************/

document.addEventListener("DOMContentLoaded", function () {
  init(); // init is called after the DOM is fully loaded
});

function init() {
  setupEventListeners();
  const showSidebar = localStorage.getItem("showSideBar") === "true";
  toggleSidebar(showSidebar);
  const isLightTheme = localStorage.getItem("light-theme") === "enabled";
  document.body.classList.toggle("light-theme", isLightTheme);
  fetchAndDisplayBoardsAndTasks(); // Initial display of boards and tasks
}