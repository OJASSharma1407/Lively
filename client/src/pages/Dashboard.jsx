import React, { useState, useEffect } from 'react';
import { Plus, CheckCircle, Clock, AlertCircle, Calendar, Sparkles } from 'lucide-react';
import { tasksAPI, progressAPI, aiAPI } from '../utils/api';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const [todayTasks, setTodayTasks] = useState([]);
  const [weeklyStats, setWeeklyStats] = useState(null);
  const [aiInsights, setAiInsights] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [tasksResponse, statsResponse, insightsResponse] = await Promise.all([
        tasksAPI.getTodayTasks(),
        progressAPI.getWeekly(),
        aiAPI.getInsights().catch(() => ({ data: { insights: 'AI insights unavailable' } }))
      ]);
      
      setTodayTasks(tasksResponse.data || []);
      setWeeklyStats(statsResponse.data || { completed: 0, pending: 0, missed: 0, completionRate: 0 });
      setAiInsights(insightsResponse.data?.insights || 'AI insights unavailable');
    } catch (error) {
      console.error('Dashboard API Error:', error.response?.data || error.message);
      console.error('Status:', error.response?.status);
      console.error('Headers:', error.response?.headers);
      
      if (error.response?.status === 401) {
        toast.error('Please login again');
      } else if (error.response?.status === 400) {
        toast.error('Bad request - check console for details');
      } else {
        toast.error('Failed to load dashboard data');
      }
      // Set default values on error
      setTodayTasks([]);
      setWeeklyStats({ completed: 0, pending: 0, missed: 0, completionRate: 0 });
      setAiInsights('AI insights unavailable');
    } finally {
      setLoading(false);
    }
  };

  const completeTask = async (taskId) => {
    try {
      await tasksAPI.completeTask(taskId);
      toast.success('Task completed!');
      fetchDashboardData(); // Refresh data
    } catch (error) {
      toast.error('Failed to complete task');
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completed</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{weeklyStats?.completed || 0}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{weeklyStats?.pending || 0}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Missed</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{weeklyStats?.missed || 0}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Calendar className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completion Rate</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{weeklyStats?.completionRate || 0}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* AI Insights */}
      <div className="card bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-purple-200 dark:border-purple-700">
        <div className="flex items-center mb-4">
          <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
            <Sparkles className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 ml-3">AI Insights</h2>
        </div>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{aiInsights}</p>
      </div>

      {/* Today's Tasks */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Today's Tasks</h2>
          <button className="btn-primary flex items-center">
            <Plus className="w-4 h-4 mr-2" />
            Add Task
          </button>
        </div>

        {todayTasks.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No tasks for today</h3>
            <p className="text-gray-600 dark:text-gray-400">You're all caught up! Add a new task to get started.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {todayTasks.map((task) => (
              <div
                key={task._id}
                className={`p-4 border-l-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow ${getPriorityColor(task.priority)}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h3 className="font-medium text-gray-900 dark:text-gray-100">{task.taskName}</h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(task.status)}`}>
                        {task.status}
                      </span>
                    </div>
                    
                    {task.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{task.description}</p>
                    )}
                    
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                      <span>📅 {new Date(task.startTime).toLocaleTimeString('en-US', { 
                        hour: 'numeric', 
                        minute: '2-digit',
                        hour12: true 
                      })} - {new Date(task.endTime).toLocaleTimeString('en-US', { 
                        hour: 'numeric', 
                        minute: '2-digit',
                        hour12: true 
                      })}</span>
                      <span>🏷️ {task.category}</span>
                      <span>⭐ {task.priority} Priority</span>
                    </div>
                  </div>

                  {task.status === 'Pending' && (
                    <button
                      onClick={() => completeTask(task._id)}
                      className="ml-4 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors text-sm font-medium"
                    >
                      Complete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;