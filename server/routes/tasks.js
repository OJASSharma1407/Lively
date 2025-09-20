const express = require('express');
const fetchuser = require('../middleware/fetchuser');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Tasks = require('../models/Tasks'); // <-- Import Task model

// ADD Task
router.post(
  '/add-tasks',
  [
    body("taskName", "Enter a task name").notEmpty(),
    body("description").optional().isString(),
    body("date").optional().isISO8601().toDate(), // new date field
    body("startTime").optional().isISO8601().toDate(),
    body("endTime").optional().isISO8601().toDate(),
    body("type", "Enter task type").isIn(["Recurring", "One-time"]),
    body("status").optional().isIn(["Pending", "Completed", "Missed"]),
    body("category").optional().isIn(["Health", "Academics", "Fun", "Chores", "Other"]),
    body("priority").optional().isIn(["Low", "Medium", "High"]),
    body("recurrenceRule").optional().isArray()
  ],
  fetchuser,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const {
        taskName,description,date,
        startTime,endTime,type,
        recurrenceRule,status,
        category,priority } = req.body;

      const task = new Tasks({
        userId: req.user.id, // fetchuser sets this
        taskName,description,date,
        startTime,endTime,type,
        recurrenceRule,status,
        category, priority
      });

      const savedTask = await task.save();
      res.status(200).send(savedTask);

    } catch (err) {
      
      res.status(400).json({error:err.message});
    }
  }
);

//Get all tasks
router.get('/get-tasks',fetchuser,async(req,res)=>{
    try{
        const tasks = await Tasks.find();
        if(!tasks){
            return res.status(401).json({error:"No tasks Available"});
        }
        res.status(200).send(tasks);
    }catch(err){
        res.status(400).json({error:err.message});
    }
})

//Get perticular task
router.get('/get-task/:id',fetchuser,async(req,res)=>{
    try{
        const taskID = req.params.id;
        if(!taskID){
            return res.status(401).json({error:"Task does not exists"});
        }

        const task = await Tasks.findById(taskID);
        res.status(200).send(task);
    }catch(err){
        res.status(400).json({error:err.message});
    }
})

//Update Task
router.put('/update-task/:id',fetchuser,async(req,res)=>{
      try{
        const taskID = req.params.id;
        if(!taskID){
            return res.status(401).json({error:"Task does not exists"});
        }
        const updates = req.body;

        const updatedTask = await Tasks.findByIdAndUpdate(
            taskID,
            {$set:updates},
            { new: true, runValidators: true },
        )
        res.status(200).send(updatedTask);
    }catch(err){
        res.status(400).json({error:err.message});
    }
})

//Delete Task
router.delete('/delete-task/:id',fetchuser,async(req,res)=>{
    try{
        const taskID = req.params.id;
        if(!taskID){
            return res.status(401).json({error:"Task does not exists"});
        }

        const delTask = await Tasks.findByIdAndDelete(taskID);
        res.status(200).send(delTask);
    }catch(err){
        res.status(400).json({error:err.message});
    }
})
module.exports = router;
