const express = require("express");
const TaskRoutes = new express.Router();
const Task = require("../models/Task");
const auth = require("../middleware/auth");

// Creating task
// POST /tasks
TaskRoutes.post("/tasks", auth, async (req, res) => {
  const task = new Task({ ...req.body, owner: req.user._id });

  try {
    await task.save();
    res.status(201).send(task);
  } catch (e) {
    res.status(400).send(e);
  }
});

// Reading all tasks
// GET /tasks?completed=true
// GET /tasks?limit=10&skip=0
// GET /tasks?sortBy=createdAt:asc
TaskRoutes.get("/tasks", auth, async (req, res) => {
  const match = {};
  const sort = {};

  if (req.query.completed) match.completed = req.query.completed === "true";
  if (req.query.sortBy) {
    const parts = req.query.sortBy.split(":");
    sort[parts[0]] = parts[1] === "desc" ? -1 : 1;
  }
  try {
    await req.user
      .populate({
        path: "tasks",
        match,
        options: {
          limit: parseInt(req.query.limit),
          skip: parseInt(req.query.skip),
          sort,
        },
      })
      .execPopulate();
    if (req.user.tasks.length == 0) {
      return res.status(200).send(`No Tasks to show`);
    }
    res.status(200).send(req.user.tasks);
    // const tasks = await Task.find({ owner: req.user._id });
    // if (!tasks) {
    //   return res.status(404).send(`Tasks Not found`);
    // }
    // res.status(200).send(tasks);
  } catch (e) {
    res.status(500).send(e);
  }
});

//Reading task by id
TaskRoutes.get("/tasks/:id", auth, async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });
    if (!task) {
      return res.status(404).send(`Task Not found`);
    }
    res.status(200).send(task);
  } catch (e) {
    res.status(500).send(e);
  }
});

//Updating Task
TaskRoutes.patch("/tasks/:id", auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const validFileds = ["description", "completed"];
  const isValidOperation = updates.every((update) =>
    validFileds.includes(update)
  );

  if (!isValidOperation) {
    return res.status(400).send({ error: "Invalid Updates!" });
  }

  try {
    //getting the task

    const task = await Task.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });

    //checking if task exists
    if (!task) {
      return res.status(404).send("Task Not Found!");
    }
    //updating the task
    updates.forEach((update) => (task[update] = req.body[update]));
    //saving the task
    await task.save();
    //if every thing goes correctly
    return res.status(200).send(task);
  } catch (e) {
    return res.status(400).send(e);
  }
});

// Deleting Task
TaskRoutes.delete("/tasks/:id", auth, async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      owner: req.user._id,
    });
    if (!task) {
      return res.status(404).send("Task Not Found!");
    }
    return res.status(200).send(task);
  } catch (e) {
    return res.status(500).send(e);
  }
});

module.exports = TaskRoutes;
