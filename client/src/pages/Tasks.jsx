import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Edit, Trash2, CheckCircle, Clock, AlertCircle, Upload } from 'lucide-react';
import { tasksAPI } from '../utils/api';
import toast from 'react-hot-toast';
import AddTaskModal from '../components/AddTaskModal';
import EditTaskModal from '../components/EditTaskModal';
import TimetableUpload from '../components/TimetableUpload';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [selectedTasks, setSelectedTasks] = useState([]);
  const [showTimetableModal, setShowTimetableModal] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    filterTasks();
  }, [tasks, searchQuery, statusFilter, categoryFilter, priorityFilter]);

  const fetchTasks = async () => {
    try {
      const response = await tasksAPI.getTasks();
      setTasks(response.data || []);
    } catch (error) {
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const filterTasks = () => {
    let filtered = tasks;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(task => 
        task.taskName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'All') {
      filtered = filtered.filter(task => task.status === statusFilter);
    }

    // Category filter
    if (categoryFilter !== 'All') {
      filtered = filtered.filter(task => task.category === categoryFilter);
    }

    // Priority filter
    if (priorityFilter !== 'All') {
      filtered = filtered.filter(task => task.priority === priorityFilter);
    }

    setFilteredTasks(filtered);
  };

  const completeTask = async (taskId) => {
    try {
      await tasksAPI.completeTask(taskId);
      toast.success('Task completed!');
      fetchTasks();
    } catch (error) {
      toast.error('Failed to complete task');
    }
  };

  const deleteTask = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await tasksAPI.deleteTask(taskId);
        toast.success('Task deleted!');
        fetchTasks();
      } catch (error) {
        toast.error('Failed to delete task');
      }
    }
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setShowEditModal(true);
  };

  const handleTaskUpdated = () => {
    fetchTasks();
    setShowEditModal(false);
    setEditingTask(null);
  };

  const handleTaskAdded = () => {
    fetchTasks();
    setShowAddModal(false);
  };

  const toggleTaskSelection = (taskId) => {
    setSelectedTasks(prev => 
      prev.includes(taskId) 
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    );
  };

  const bulkDeleteTasks = async () => {
    if (selectedTasks.length === 0) return;
    
    if (window.confirm(`Delete ${selectedTasks.length} selected tasks?`)) {
      try {
        await tasksAPI.bulkDelete(selectedTasks);
        toast.success(`${selectedTasks.length} tasks deleted!`);
        setSelectedTasks([]);
        fetchTasks();
      } catch (error) {
        toast.error('Failed to delete tasks');
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'text-green-600 bg-green-50';
      case 'Pending': return 'text-blue-600 bg-blue-50';
      case 'Missed': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'border-l-red-500';
      case 'Medium': return 'border-l-yellow-500';
      case 'Low': return 'border-l-green-500';
      default: return 'border-l-gray-500';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Completed': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'Pending': return <Clock className="w-5 h-5 text-blue-600" />;
      case 'Missed': return <AlertCircle className="w-5 h-5 text-red-600" />;
      default: return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Tasks</h1>
          <p className="text-sm sm:text-base text-gray-600">Manage your tasks and stay organized</p>
        </div>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
          <button
            onClick={() => setShowTimetableModal(true)}
            className="btn-secondary flex items-center justify-center"
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload Timetable
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary flex items-center justify-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Task
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-wrap gap-4 items-center">
          {/* Search */}
          <div className="relative flex-1 min-w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pl-10"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-field w-32"
          >
            <option value="All">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Completed">Completed</option>
            <option value="Missed">Missed</option>
          </select>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="input-field w-32"
          >
            <option value="All">All Categories</option>
            <option value="Health">Health</option>
            <option value="Academics">Academics</option>
            <option value="Fun">Fun</option>
            <option value="Chores">Chores</option>
            <option value="Other">Other</option>
          </select>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="input-field w-32"
          >
            <option value="All">All Priorities</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>

        {/* Bulk Actions */}
        {selectedTasks.length > 0 && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg flex items-center justify-between">
            <span className="text-blue-700 font-medium">
              {selectedTasks.length} task(s) selected
            </span>
            <button
              onClick={bulkDeleteTasks}
              className="px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
            >
              Delete Selected
            </button>
          </div>
        )}
      </div>

      {/* Tasks List */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="card text-center py-12">
            <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
            <p className="text-gray-600">Create your first task to get started!</p>
          </div>
        ) : (
          filteredTasks.map((task) => (
            <div
              key={task._id}
              className={`p-4 border-l-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow ${getPriorityColor(task.priority)}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 flex-1">
                  <input
                    type="checkbox"
                    checked={selectedTasks.includes(task._id)}
                    onChange={() => toggleTaskSelection(task._id)}
                    className="rounded border-gray-300 text-primary-500 focus:ring-primary-500"
                  />
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(task.status)}
                      <h3 className="font-medium text-gray-900">{task.taskName}</h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(task.status)}`}>
                        {task.status}
                      </span>
                    </div>
                    
                    {task.description && (
                      <p className="text-sm text-gray-600 mt-1 ml-8">{task.description}</p>
                    )}
                    
                    <div className="flex items-center space-x-4 mt-2 ml-8 text-sm text-gray-500">
                      {task.startTime && (
                        <span>📅 {new Date(task.startTime).toLocaleString()}</span>
                      )}
                      <span>🏷️ {task.category}</span>
                      <span>⭐ {task.priority} Priority</span>
                      <span>🔄 {task.type}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {task.status === 'Pending' && (
                    <button
                      onClick={() => completeTask(task._id)}
                      className="px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm font-medium"
                    >
                      Complete
                    </button>
                  )}
                  
                  <button
                    onClick={() => handleEditTask(task)}
                    className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  
                  <button
                    onClick={() => deleteTask(task._id)}
                    className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modals */}
      {showAddModal && (
        <AddTaskModal
          onClose={() => setShowAddModal(false)}
          onTaskAdded={handleTaskAdded}
        />
      )}
      
      {showEditModal && editingTask && (
        <EditTaskModal
          task={editingTask}
          onClose={() => setShowEditModal(false)}
          onTaskUpdated={handleTaskUpdated}
        />
      )}
      
      {showTimetableModal && (
        <TimetableUpload
          isOpen={showTimetableModal}
          onClose={() => setShowTimetableModal(false)}
          onTasksCreated={() => {
            fetchTasks();
            setShowTimetableModal(false);
          }}
        />
      )}
    </div>
  );
};

export default Tasks;