import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock } from 'lucide-react';
import { tasksAPI } from '../utils/api';
import toast from 'react-hot-toast';

const EditTaskModal = ({ task, onClose, onTaskUpdated }) => {
  const [formData, setFormData] = useState({
    taskName: '',
    description: '',
    date: '',
    startTime: '',
    endTime: '',
    type: 'One-time',
    category: 'Other',
    priority: 'Medium',
    status: 'Pending',
    recurrenceRule: []
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (task) {
      const taskDate = task.date ? new Date(task.date).toISOString().split('T')[0] : '';
      const startTime = task.startTime ? new Date(task.startTime).toTimeString().slice(0, 5) : '';
      const endTime = task.endTime ? new Date(task.endTime).toTimeString().slice(0, 5) : '';

      setFormData({
        taskName: task.taskName || '',
        description: task.description || '',
        date: taskDate,
        startTime: startTime,
        endTime: endTime,
        type: task.type || 'One-time',
        category: task.category || 'Other',
        priority: task.priority || 'Medium',
        status: task.status || 'Pending',
        recurrenceRule: task.recurrenceRule || []
      });
    }
  }, [task]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRecurrenceChange = (day) => {
    setFormData(prev => ({
      ...prev,
      recurrenceRule: prev.recurrenceRule.includes(day)
        ? prev.recurrenceRule.filter(d => d !== day)
        : [...prev.recurrenceRule, day]
    }));
  };

  const checkTimeValidation = () => {
    if (formData.startTime && formData.endTime) {
      const start = new Date(`${formData.date}T${formData.startTime}`);
      const end = new Date(`${formData.date}T${formData.endTime}`);
      
      if (end <= start) {
        toast.error('End time must be after start time');
        return false;
      }
    }
    return true;
  };

  const checkTaskOverlap = async () => {
    if (!formData.startTime || !formData.endTime) return true;
    
    try {
      const response = await tasksAPI.getTasks();
      const existingTasks = response.data || [];
      
      const newStart = new Date(`${formData.date}T${formData.startTime}`);
      const newEnd = new Date(`${formData.date}T${formData.endTime}`);
      
      const hasOverlap = existingTasks.some(existingTask => {
        // Skip checking against the current task being edited
        if (existingTask._id === task._id) return false;
        
        if (!existingTask.startTime || !existingTask.endTime) return false;
        
        const taskStart = new Date(existingTask.startTime);
        const taskEnd = new Date(existingTask.endTime);
        
        // Check if tasks are on the same date
        if (taskStart.toDateString() !== newStart.toDateString()) return false;
        
        // Check for overlap: (start1 < end2) && (start2 < end1)
        return (newStart < taskEnd) && (taskStart < newEnd);
      });
      
      if (hasOverlap) {
        toast.error('This task overlaps with an existing task');
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error checking overlap:', error);
      return true; // Allow update if check fails
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate time order
    if (!checkTimeValidation()) {
      return;
    }
    
    setLoading(true);
    
    // Check for overlaps
    const noOverlap = await checkTaskOverlap();
    if (!noOverlap) {
      setLoading(false);
      return;
    }

    try {
      const taskData = {
        ...formData,
        startTime: formData.startTime ? new Date(`${formData.date}T${formData.startTime}`).toISOString() : null,
        endTime: formData.endTime ? new Date(`${formData.date}T${formData.endTime}`).toISOString() : null,
        date: formData.date ? new Date(formData.date).toISOString() : null
      };

      await tasksAPI.updateTask(task._id, taskData);
      toast.success('Task updated successfully!');
      onTaskUpdated();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update task');
    } finally {
      setLoading(false);
    }
  };

  const weekDays = [
    { label: 'Sun', value: 0 },
    { label: 'Mon', value: 1 },
    { label: 'Tue', value: 2 },
    { label: 'Wed', value: 3 },
    { label: 'Thu', value: 4 },
    { label: 'Fri', value: 5 },
    { label: 'Sat', value: 6 }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Edit Task</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Task Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Task Name *
            </label>
            <input
              type="text"
              name="taskName"
              value={formData.taskName}
              onChange={handleChange}
              className="input-field"
              placeholder="Enter task name"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="input-field resize-none"
              rows="3"
              placeholder="Task description (optional)"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="input-field"
            >
              <option value="Pending">Pending</option>
              <option value="Completed">Completed</option>
              <option value="Missed">Missed</option>
            </select>
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Task Type *
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="input-field"
              required
            >
              <option value="One-time">One-time</option>
              <option value="Recurring">Recurring</option>
            </select>
          </div>

          {/* Recurrence Days (only for recurring tasks) */}
          {formData.type === 'Recurring' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Repeat on Days
              </label>
              <div className="flex space-x-2">
                {weekDays.map(day => (
                  <button
                    key={day.value}
                    type="button"
                    onClick={() => handleRecurrenceChange(day.value)}
                    className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                      formData.recurrenceRule.includes(day.value)
                        ? 'bg-primary-500 text-white border-primary-500'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {day.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="input-field pl-10"
              />
            </div>
          </div>

          {/* Time Range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Time
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="time"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleChange}
                  className="input-field pl-10"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Time
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="time"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleChange}
                  min={formData.startTime}
                  className="input-field pl-10"
                />
              </div>
            </div>
          </div>
          
          {/* Time Validation Warning */}
          {formData.startTime && formData.endTime && (
            (() => {
              const start = new Date(`${formData.date}T${formData.startTime}`);
              const end = new Date(`${formData.date}T${formData.endTime}`);
              return end <= start ? (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-700">
                    ⚠️ End time must be after start time
                  </p>
                </div>
              ) : null;
            })()
          )}

          {/* Category & Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="input-field"
              >
                <option value="Health">Health</option>
                <option value="Academics">Academics</option>
                <option value="Fun">Fun</option>
                <option value="Chores">Chores</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority
              </label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="input-field"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 btn-primary disabled:opacity-50"
            >
              {loading ? 'Updating...' : 'Update Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditTaskModal;