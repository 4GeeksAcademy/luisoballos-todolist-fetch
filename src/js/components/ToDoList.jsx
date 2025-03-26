import { useState, useEffect } from "react";

const USERNAME = "luisoballos";
const BASE_URL = `https://playground.4geeks.com/todo`;
const USER_URL = `/users/${USERNAME}`;
const API_URL = `/todos/${USERNAME}`;

const ToDoList = () => {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");

  useEffect(() => {
    fetch(BASE_URL + "/users")
      .then((res) => res.json())
      .then((data) => {
        const userExists = data.users.some(user => user.name === USERNAME);
        if (userExists) {
          fetch(BASE_URL + USER_URL)
            .then(res => res.json())
            .then(userData => setTasks(userData.todos || []))
            .catch(e => console.error("Error fetching user todos: ", e));
        } else {
          createUser();
        }
      })
      .catch(() => createUser());
  }, []);

  const createUser = () => {
    fetch(BASE_URL + USER_URL, {
      method: "POST"
    })
      .then(() => setTasks([]))
      .catch(e => console.error("Error creating user:", e));
  };

  const addTask = () => {
    if (newTask.trim() === "")
      return;
    const todo = { label: newTask, is_done: false};
    fetch(BASE_URL + API_URL, {
      method: "POST",
      body: JSON.stringify(todo),
      headers: { "Content-Type": "application/json" },
    })
      .then((resp) => resp.json())
      .then((newTodo) => {
        setTasks([...tasks, newTodo]);
        setNewTask("");
      })
      .catch(e => console.error("Error adding task: ", e));
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter")
      addTask();
  };

  const removeTask = (index) => {
    fetch(BASE_URL + "/todos/" + index, {
      method: "DELETE",
    })
      .then((res) => {
        if (res.ok) {
          setTasks(prevTasks => prevTasks.filter(task => task.id !== index));
        } else {
          console.error("Error deleting task");
        }
      })
      .catch(e => console.error("Error removing task: ", e));
  };

  const clearAllTasks = () => {
    Promise.all(
      tasks.map(task =>
        fetch(BASE_URL + "/todos/" + task.id, {
          method: "DELETE"
        })
      )
    )
      .then(() => setTasks([]))
      .catch(e => console.error("Error deleting tasks: ", e));
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      <div className="container w-25 p-4 shadow">
        <h2 className="text-center mb-4">To-Do List</h2>
        <div className="d-flex mb-3">
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Add a task..."
            className="form-control"
          />
          <button onClick={addTask} className="btn btn-primary">Add</button>
        </div>
        <ul style={{ listStyleType: "none" }} className="gap-3">
          {tasks.length === 0 ? (
            <li className="text-center text-muted">No tasks, add a task</li>
          ) : (
            tasks.map((task) => (
              <li key={task.id} className="list-group-item d-flex justify-content-between align-items-center mb-2">
                {task.label}
                <button onClick={() => removeTask(task.id)} className="btn btn-danger btn-sm">
                  <i className="fas fa-trash"></i>
                </button>
              </li>
            ))
          )}
        </ul>
        <button onClick={clearAllTasks} className="btn btn-warning mt-3 w-100">Clear All</button>
      </div>
    </div>
  );
};

export default ToDoList;