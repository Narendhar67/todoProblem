const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const isValid = require("date-fns/isValid");
const { format } = require("date-fns");

const app = express();
app.use(express.json());

let db = null;
const dbPath = path.join(__dirname, "todoApplication.db");

const InitializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Started at http://localhost:3000");
    });
  } catch (error) {
    console.log(`DB Error : ${error.message}`);
    process.exit(1);
  }
};

InitializeDBAndServer();

const getTodo = (obj) => {
  return {
    id: obj.id,
    todo: obj.todo,
    priority: obj.priority,
    status: obj.status,
    category: obj.category,
    dueDate: obj.due_date,
  };
};

const Validate = (request, response, next) => {
  let { priority, status, category } = request.query;
  let isAllValidated = true;

  if (status !== undefined) {
    if (status === "TO DO" || status === "IN PROGRESS" || status === "DONE") {
      isAllValidated = true;
    } else {
      isAllValidated = false;
      console.log(status);
      response.status(400);
      response.send("Invalid Todo Status");
    }
  }
  if (priority !== undefined) {
    if (priority === "LOW" || priority === "HIGH" || priority === "MEDIUM") {
      isAllValidated = true;
    } else {
      isAllValidated = false;
      response.status(400);
      response.send("Invalid Todo Priority");
    }
  }
  if (category !== undefined) {
    if (category === "WORK" || category === "HOME" || category === "LEARNING") {
      isAllValidated = true;
    } else {
      isAllValidated = false;
      response.status(400);
      response.send("Invalid Todo Category");
    }
  }

  if (isAllValidated) {
    next();
  }
};

const validateDate = (request, response, next) => {
  let { date } = request.query;

  if (date !== undefined) {
    if (isValid(new Date(date))) {
      const DDate = format(new Date(date), "yyyy-MM-dd");
      request.due_date = DDate;
      next();
    } else {
      response.status(400);
      response.send("Invalid Due Date");
    }
  }
};

const ValidateP = (request, response, next) => {
  let { priority, status, category } = request.body;
  let isAllValidated = true;

  if (status !== undefined) {
    if (status === "TO DO" || status === "IN PROGRESS" || status === "DONE") {
      isAllValidated = true;
    } else {
      isAllValidated = false;
      console.log(status);
      response.status(400);
      response.send("Invalid Todo Status");
    }
  }
  if (priority !== undefined) {
    if (priority === "LOW" || priority === "HIGH" || priority === "MEDIUM") {
      isAllValidated = true;
    } else {
      isAllValidated = false;
      response.status(400);
      response.send("Invalid Todo Priority");
    }
  }
  if (category !== undefined) {
    if (category === "WORK" || category === "HOME" || category === "LEARNING") {
      isAllValidated = true;
    } else {
      isAllValidated = false;
      response.status(400);
      response.send("Invalid Todo Category");
    }
  }

  if (isAllValidated) {
    next();
  }
};

const validateDateP = async (request, response, next) => {
  const { dueDate } = request.body;

  if (dueDate !== undefined) {
    if (isValid(new Date(dueDate))) {
      const DDate = await format(new Date(dueDate), "yyyy-MM-dd");
      request.due_date = DDate;
      next();
    } else {
      response.status(400);
      response.send("Invalid Due Date");
    }
  } else {
    next();
  }
};

// List of all TODO's

app.get("/todos/", Validate, async (request, response) => {
  const {
    priority = "",
    status = "",
    category = "",
    search_q = "",
  } = request.query;
  const Query = `SELECT * FROM todo WHERE 
    priority LIKE '%${priority}%'
    AND 
    status LIKE '%${status}%'
    AND 
    category LIKE '%${category}%'
    AND 
    todo LIKE '%${search_q}%';`;
  const dbRes = await db.all(Query);
  const result = dbRes.map(getTodo);
  response.send(result);
});

// todo on todoId
app.get("/todos/:todoId/", Validate, async (request, response) => {
  const { todoId } = request.params;
  const QUERY = `SELECT * FROM todo WHERE id = ${todoId};`;
  const dbRes = await db.get(QUERY);
  const result = getTodo(dbRes);
  response.send(result);
});

// todo on date
app.get("/agenda/", validateDate, async (request, response) => {
  const { due_date } = request;

  const QUERY = `SELECT * FROM todo WHERE due_date = '${due_date}';`;
  const dbRes = await db.all(QUERY);
  const result = dbRes.map(getTodo);
  response.send(result);
});

// create todo
app.post("/todos/", ValidateP, validateDateP, async (request, response) => {
  const { id, todo, priority, status, category } = request.body;
  const { due_date } = request;

  const QUERY = `INSERT INTO todo(id,todo,priority,status,category,due_date)
  VALUES (${id},'${todo}','${priority}','${status}','${category}','${due_date}');`;
  await db.run(QUERY);
  response.send("Todo Successfully Added");
});

// Update todo
app.put(
  "/todos/:todoId/",
  ValidateP,
  validateDateP,
  async (request, response) => {
    console.log("API started");
    const { todoId } = request.params;
    const { priority, status, category, todo } = request.body;
    const { due_date } = request;
    if (priority !== undefined) {
      pQUERY = `UPDATE todo SET priority = '${priority}' WHERE id = ${todoId};`;
      await db.run(pQUERY);
      response.send("Priority Updated");
    }
    if (category !== undefined) {
      cQUERY = `UPDATE todo SET category = '${category}' WHERE id = ${todoId};`;
      await db.run(cQUERY);
      response.send("Category Updated");
    }
    if (status !== undefined) {
      sQUERY = `UPDATE todo SET status = '${status}'  WHERE id = ${todoId};`;
      await db.run(sQUERY);
      response.send("Status Updated");
    }
    if (due_date !== undefined) {
      dQUERY = `UPDATE todo SET due_date = '${due_date}'  WHERE id = ${todoId};`;
      await db.run(dQUERY);
      response.send("Due Date Updated");
    }
    if (todo !== undefined) {
      tQUERY = `UPDATE todo SET todo = '${todo}'  WHERE id = ${todoId};`;
      await db.run(tQUERY);
      response.send("Todo Updated");
    }
  }
);

//delete todo

app.delete("/todos/:todoId/", Validate, async (request, response) => {
  const { todoId } = request.params;
  const Query = `DELETE FROM todo WHERE id = ${todoId};`;
  await db.run(Query);
  response.send("Todo Deleted");
});

module.exports = app;
