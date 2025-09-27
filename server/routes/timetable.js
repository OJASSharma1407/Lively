const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const timetableParser = require('../services/timetableParser');
const Tasks = require('../models/Tasks');
const auth = require('../middleware/fetchuser');

const router = express.Router();

// Configure multer for file upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'uploads/timetables';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'timetable-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|bmp|tiff/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'));
        }
    }
});

// Upload and parse timetable
router.post('/upload', auth, upload.single('timetable'), async (req, res) => {
    let imagePath = null;
    try {
        console.log('Upload request received');
        console.log('User:', req.user);
        
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        imagePath = req.file.path;
        console.log('File uploaded:', imagePath);
        
        // Parse the timetable image
        console.log('Starting timetable parsing...');
        const schedule = await timetableParser.parseImage(imagePath);
        console.log('Parsing completed, schedule:', schedule);
        
        if (!schedule || schedule.length === 0) {
            return res.status(400).json({ 
                message: 'Could not extract schedule from image. Please ensure the image contains a clear timetable.' 
            });
        }

        // Get userId safely
        const userId = req.user?.user?.id || req.user?.id || req.user?.userId;
        if (!userId) {
            return res.status(400).json({ message: 'User ID not found' });
        }
        
        console.log('Converting to tasks with userId:', userId);
        
        // Convert schedule to tasks
        const tasks = timetableParser.convertToTasks(schedule, userId);
        console.log('Tasks created:', tasks.length);
        
        res.json({
            message: 'Timetable parsed successfully',
            schedule,
            tasks,
            tasksCount: tasks.length
        });
        
    } catch (error) {
        console.error('Timetable upload error:', error);
        console.error('Error stack:', error.stack);
        
        res.status(500).json({ 
            message: 'Failed to parse timetable', 
            error: error.message 
        });
    } finally {
        // Clean up uploaded file
        if (imagePath && fs.existsSync(imagePath)) {
            try {
                fs.unlinkSync(imagePath);
            } catch (cleanupError) {
                console.error('File cleanup error:', cleanupError);
            }
        }
    }
});

// Save parsed tasks to database
router.post('/save-tasks', auth, async (req, res) => {
    try {
        const { tasks } = req.body;
        
        if (!tasks || !Array.isArray(tasks)) {
            return res.status(400).json({ message: 'Invalid tasks data' });
        }

        // Validate and save tasks
        const savedTasks = [];
        const errors = [];

        for (const taskData of tasks) {
            try {
                // Check for overlapping conflicts (not adjacent)
                const userId = req.user?.user?.id || req.user?.id || req.user?.userId;
                if (!userId) {
                    errors.push(`No user ID found for task ${taskData.taskName}`);
                    continue;
                }
                
                const conflictingTask = await Tasks.findOne({
                    userId: userId,
                    $and: [
                        { startTime: { $lt: new Date(taskData.endTime) } },
                        { endTime: { $gt: new Date(taskData.startTime) } },
                        { 
                            $or: [
                                { startTime: { $ne: new Date(taskData.endTime) } },
                                { endTime: { $ne: new Date(taskData.startTime) } }
                            ]
                        }
                    ]
                });

                if (conflictingTask) {
                    errors.push(`Overlapping task: ${conflictingTask.taskName}`);
                    continue;
                }

                const task = new Tasks({
                    ...taskData,
                    userId: userId,
                    startTime: new Date(taskData.startTime),
                    endTime: new Date(taskData.endTime)
                });

                const savedTask = await task.save();
                savedTasks.push(savedTask);
                
            } catch (taskError) {
                errors.push(`Failed to save task ${taskData.taskName}: ${taskError.message}`);
            }
        }

        res.json({
            message: `Successfully saved ${savedTasks.length} tasks`,
            savedTasks: savedTasks.length,
            errors: errors.length > 0 ? errors : undefined,
            tasks: savedTasks
        });

    } catch (error) {
        console.error('Save tasks error:', error);
        res.status(500).json({ 
            message: 'Failed to save tasks', 
            error: error.message 
        });
    }
});

module.exports = router;