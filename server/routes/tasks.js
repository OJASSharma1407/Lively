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

      // Validate time order
      if (startTime && endTime) {
        const start = new Date(startTime);
        const end = new Date(endTime);
        
        if (end <= start) {
          return res.status(400).json({error: "End time must be after start time"});
        }
      }

      // Check for overlapping tasks
      if (startTime && endTime) {
        const taskStart = new Date(startTime);
        const taskEnd = new Date(endTime);
        
        const overlappingTasks = await Tasks.find({
          userId: req.user.id,
          status: { $ne: 'Completed' }, // Exclude completed tasks
          startTime: { $exists: true },
          endTime: { $exists: true },
          $and: [
            { startTime: { $lt: taskEnd } },
            { endTime: { $gt: taskStart } }
          ]
        });
        
        if (overlappingTasks.length > 0) {
          return res.status(400).json({error: "Task overlaps with existing task"});
        }
      }

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
        const tasks = await Tasks.find({userId: req.user.id});
        if(!tasks || tasks.length === 0){
            return res.status(200).json([]);
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

        // Validate time order if both times are provided
        if (updates.startTime && updates.endTime) {
          const start = new Date(updates.startTime);
          const end = new Date(updates.endTime);
          
          if (end <= start) {
            return res.status(400).json({error: "End time must be after start time"});
          }
        }

        // Check for overlapping tasks (excluding current task)
        if (updates.startTime && updates.endTime) {
          const taskStart = new Date(updates.startTime);
          const taskEnd = new Date(updates.endTime);
          
          const overlappingTasks = await Tasks.find({
            userId: req.user.id,
            _id: { $ne: taskID }, // Exclude current task
            status: { $ne: 'Completed' }, // Exclude completed tasks
            startTime: { $exists: true },
            endTime: { $exists: true },
            $and: [
              { startTime: { $lt: taskEnd } },
              { endTime: { $gt: taskStart } }
            ]
          });
          
          if (overlappingTasks.length > 0) {
            return res.status(400).json({error: "Task overlaps with existing task"});
          }
        }

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

        // Delete the task
        const delTask = await Tasks.findByIdAndDelete(taskID);
        
        // Clean up related notifications
        const Notifications = require('../models/Notifications');
        await Notifications.deleteMany({ taskId: taskID });
        
        res.status(200).send(delTask);
    }catch(err){
        res.status(400).json({error:err.message});
    }
})

//AI-Powered Reschedule Task
router.post('/reschedule-task/:id',fetchuser,async(req,res)=>{
    try{
        const { aiReschedule } = require('../reschedule/aiReschedule');
        const taskID = req.params.id;
        
        const task = await Tasks.findById(taskID);
        if(!task){
            return res.status(404).json({error:"Task not found"});
        }
        
        if(task.userId.toString() !== req.user.id){
            return res.status(403).json({error:"Unauthorized"});
        }
        
        const result = await aiReschedule(task);
        
        if(result.success) {
            // Update the task with AI-suggested time
            await Tasks.findByIdAndUpdate(taskID, {
                startTime: result.newTime,
                endTime: result.endTime,
                status: 'Pending',
                isNotified: false // Reset notification flag
            });
            
            // Create reschedule notification
            const Notifications = require('../models/Notifications');
            const notification = new Notifications({
                notification: `🤖 AI rescheduled "${task.taskName}" to ${result.newTime.toLocaleString()}`,
                taskId: task._id,
                time: new Date()
            });
            await notification.save();
        }
        
        res.status(200).json(result);
    }catch(err){
        res.status(400).json({error:err.message});
    }
})

//Generate today's recurring tasks manually
router.post('/generate-recurring',fetchuser,async(req,res)=>{
    try{
        const today = new Date();
        const dayOfWeek = today.getDay();
        
        const recurringTasks = await Tasks.find({
            userId: req.user.id,
            type: 'Recurring',
            recurrenceRule: dayOfWeek
        });
        
        let generated = 0;
        for(let template of recurringTasks){
            const todayStart = new Date(today);
            todayStart.setHours(0, 0, 0, 0);
            const todayEnd = new Date(today);
            todayEnd.setHours(23, 59, 59, 999);
            
            const existingInstance = await Tasks.findOne({
                userId: req.user.id,
                taskName: template.taskName,
                date: { $gte: todayStart, $lte: todayEnd },
                type: 'One-time'
            });
            
            if(!existingInstance){
                const taskStart = new Date(template.startTime);
                const taskEnd = new Date(template.endTime);
                taskStart.setFullYear(today.getFullYear(), today.getMonth(), today.getDate());
                taskEnd.setFullYear(today.getFullYear(), today.getMonth(), today.getDate());
                
                const newInstance = new Tasks({
                    userId: req.user.id,
                    taskName: template.taskName,
                    description: template.description,
                    date: today,
                    startTime: taskStart,
                    endTime: taskEnd,
                    type: 'One-time',
                    status: 'Pending',
                    category: template.category,
                    priority: template.priority
                });
                
                await newInstance.save();
                generated++;
            }
        }
        
        res.status(200).json({message: `Generated ${generated} recurring tasks for today`});
    }catch(err){
        res.status(400).json({error:err.message});
    }
})

//Complete Task
router.put('/complete/:id',fetchuser,async(req,res)=>{
    try{
        const taskID = req.params.id;
        const task = await Tasks.findById(taskID);
        
        if(!task){
            return res.status(404).json({error:"Task not found"});
        }
        
        if(task.userId.toString() !== req.user.id){
            return res.status(403).json({error:"Unauthorized"});
        }
        
        // Save progress data before updating task
        const Progress = require('../models/Progress');
        const progressEntry = new Progress({
            userId: req.user.id,
            taskId: task._id,
            taskName: task.taskName,
            category: task.category,
            priority: task.priority,
            status: 'Completed',
            completedAt: new Date(),
            originalStartTime: task.startTime,
            originalEndTime: task.endTime
        });
        await progressEntry.save();
        
        task.status = 'Completed';
        await task.save();
        
        res.status(200).json({message: "Task completed successfully", task});
    }catch(err){
        res.status(400).json({error:err.message});
    }
})

//Update Task Status
router.put('/status/:id',[
    body('status').isIn(['Pending', 'Completed', 'Missed'])
],fetchuser,async(req,res)=>{
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    
    try{
        const taskID = req.params.id;
        const { status } = req.body;
        
        const task = await Tasks.findById(taskID);
        if(!task){
            return res.status(404).json({error:"Task not found"});
        }
        
        if(task.userId.toString() !== req.user.id){
            return res.status(403).json({error:"Unauthorized"});
        }
        
        // Save progress data if task is completed or missed
        if (status === 'Completed' || status === 'Missed') {
            const Progress = require('../models/Progress');
            const progressEntry = new Progress({
                userId: req.user.id,
                taskId: task._id,
                taskName: task.taskName,
                category: task.category,
                priority: task.priority,
                status: status,
                completedAt: new Date(),
                originalStartTime: task.startTime,
                originalEndTime: task.endTime
            });
            await progressEntry.save();
        }
        
        task.status = status;
        await task.save();
        
        res.status(200).json({message: `Task status updated to ${status}`, task});
    }catch(err){
        res.status(400).json({error:err.message});
    }
})

//Get Tasks by Date Range
router.get('/date-range',fetchuser,async(req,res)=>{
    try{
        const { start, end } = req.query;
        
        if(!start || !end){
            return res.status(400).json({error:"Start and end dates are required"});
        }
        
        const startDate = new Date(start);
        const endDate = new Date(end);
        
        const tasks = await Tasks.find({
            userId: req.user.id,
            date: { $gte: startDate, $lte: endDate }
        }).sort({ startTime: 1 });
        
        res.status(200).json(tasks);
    }catch(err){
        res.status(400).json({error:err.message});
    }
})

//Get Tasks by Status
router.get('/status/:status',fetchuser,async(req,res)=>{
    try{
        const { status } = req.params;
        
        if(!['Pending', 'Completed', 'Missed'].includes(status)){
            return res.status(400).json({error:"Invalid status"});
        }
        
        const tasks = await Tasks.find({
            userId: req.user.id,
            status: status
        }).sort({ startTime: 1 });
        
        res.status(200).json(tasks);
    }catch(err){
        res.status(400).json({error:err.message});
    }
})

//Search Tasks by Name
router.get('/search',fetchuser,async(req,res)=>{
    try{
        const { q } = req.query;
        
        if(!q){
            return res.status(400).json({error:"Search query is required"});
        }
        
        const tasks = await Tasks.find({
            userId: req.user.id,
            taskName: { $regex: q, $options: 'i' }
        }).sort({ startTime: 1 });
        
        res.status(200).json(tasks);
    }catch(err){
        res.status(400).json({error:err.message});
    }
})

//Filter Tasks
router.get('/filter',fetchuser,async(req,res)=>{
    try{
        const { category, priority } = req.query;
        let filter = { userId: req.user.id };
        
        if(category){
            filter.category = category;
        }
        
        if(priority){
            filter.priority = priority;
        }
        
        const tasks = await Tasks.find(filter).sort({ startTime: 1 });
        
        res.status(200).json(tasks);
    }catch(err){
        res.status(400).json({error:err.message});
    }
})

//Get Today's Tasks
router.get('/today',fetchuser,async(req,res)=>{
    try{
        const today = new Date();
        const startOfDay = new Date(today);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(today);
        endOfDay.setHours(23, 59, 59, 999);
        
        const tasks = await Tasks.find({
            userId: req.user.id,
            date: { $gte: startOfDay, $lte: endOfDay }
        }).sort({ startTime: 1 });
        
        res.status(200).json(tasks);
    }catch(err){
        res.status(400).json({error:err.message});
    }
})

//Get Upcoming Tasks (next 7 days)
router.get('/upcoming',fetchuser,async(req,res)=>{
    try{
        const today = new Date();
        const nextWeek = new Date(today);
        nextWeek.setDate(today.getDate() + 7);
        
        const tasks = await Tasks.find({
            userId: req.user.id,
            date: { $gte: today, $lte: nextWeek },
            status: 'Pending'
        }).sort({ startTime: 1 });
        
        res.status(200).json(tasks);
    }catch(err){
        res.status(400).json({error:err.message});
    }
})

//Bulk Delete Tasks
router.delete('/bulk', [
    body('taskIds').isArray().notEmpty()
], fetchuser, async(req,res)=>{
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    
    try{
        const { taskIds } = req.body;
        
        // Delete tasks
        const result = await Tasks.deleteMany({
            _id: { $in: taskIds },
            userId: req.user.id
        });
        
        // Clean up related notifications
        const Notifications = require('../models/Notifications');
        await Notifications.deleteMany({ taskId: { $in: taskIds } });
        
        res.status(200).json({message: `${result.deletedCount} tasks deleted successfully`});
    }catch(err){
        res.status(400).json({error:err.message});
    }
})

//Bulk Update Status
router.put('/bulk-status', [
    body('taskIds').isArray().notEmpty(),
    body('status').isIn(['Pending', 'Completed', 'Missed'])
], fetchuser, async(req,res)=>{
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    
    try{
        const { taskIds, status } = req.body;
        
        const result = await Tasks.updateMany(
            { _id: { $in: taskIds }, userId: req.user.id },
            { $set: { status: status } }
        );
        
        res.status(200).json({message: `${result.modifiedCount} tasks updated to ${status}`});
    }catch(err){
        res.status(400).json({error:err.message});
    }
})

//Bulk Reschedule
router.post('/bulk-reschedule', [
    body('taskIds').isArray().notEmpty()
], fetchuser, async(req,res)=>{
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    
    try{
        const { taskIds } = req.body;
        const { rescheduleTask } = require('../reschedule/reschedule');
        
        const tasks = await Tasks.find({
            _id: { $in: taskIds },
            userId: req.user.id
        });
        
        const results = [];
        for(let task of tasks){
            const result = await rescheduleTask(task);
            results.push({
                taskId: task._id,
                taskName: task.taskName,
                ...result
            });
        }
        
        res.status(200).json({message: "Bulk reschedule completed", results});
    }catch(err){
        res.status(400).json({error:err.message});
    }
})

module.exports = router;
