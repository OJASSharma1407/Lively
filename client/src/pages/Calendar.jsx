import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, Grid, List } from 'lucide-react';
import { tasksAPI } from '../utils/api';
import toast from 'react-hot-toast';
import AddTaskModal from '../components/AddTaskModal';

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState('month'); // year, month, week, day
  const [tasks, setTasks] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTasks();
  }, [currentDate, view]);

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

  const handleTaskAdded = () => {
    fetchTasks();
    setShowAddModal(false);
  };

  const navigateDate = (direction) => {
    const newDate = new Date(currentDate);
    
    switch (view) {
      case 'year':
        newDate.setFullYear(newDate.getFullYear() + direction);
        break;
      case 'month':
        newDate.setMonth(newDate.getMonth() + direction);
        break;
      case 'week':
        newDate.setDate(newDate.getDate() + (direction * 7));
        break;
      case 'day':
        newDate.setDate(newDate.getDate() + direction);
        break;
    }
    
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const getTasksForDate = (date) => {
    return tasks.filter(task => {
      if (!task.date) return false;
      const taskDate = new Date(task.date);
      return (
        taskDate.getDate() === date.getDate() &&
        taskDate.getMonth() === date.getMonth() &&
        taskDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'bg-red-500';
      case 'Medium': return 'bg-yellow-500';
      case 'Low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'Pending': return 'bg-blue-100 text-blue-800';
      case 'Missed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderYearView = () => {
    const months = [];
    for (let i = 0; i < 12; i++) {
      const monthDate = new Date(currentDate.getFullYear(), i, 1);
      const monthTasks = tasks.filter(task => {
        if (!task.date) return false;
        const taskDate = new Date(task.date);
        return taskDate.getMonth() === i && taskDate.getFullYear() === currentDate.getFullYear();
      });
      
      months.push(
        <div key={i} className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 cursor-pointer"
             onClick={() => {
               setCurrentDate(monthDate);
               setView('month');
             }}>
          <h3 className="font-medium text-gray-900 mb-2">
            {monthDate.toLocaleDateString('en-US', { month: 'long' })}
          </h3>
          <div className="text-sm text-gray-600">
            {monthTasks.length} task{monthTasks.length !== 1 ? 's' : ''}
          </div>
          <div className="flex space-x-1 mt-2">
            {monthTasks.slice(0, 3).map((task, idx) => (
              <div key={idx} className={`w-2 h-2 rounded-full ${getPriorityColor(task.priority)}`}></div>
            ))}
            {monthTasks.length > 3 && <span className="text-xs text-gray-400">+{monthTasks.length - 3}</span>}
          </div>
        </div>
      );
    }
    
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {months}
      </div>
    );
  };

  const renderMonthView = () => {
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const today = new Date();
    
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      
      const isCurrentMonth = date.getMonth() === currentDate.getMonth();
      const isToday = date.toDateString() === today.toDateString();
      const dayTasks = getTasksForDate(date);
      
      days.push(
        <div
          key={i}
          className={`min-h-16 sm:min-h-24 p-1 sm:p-2 border border-gray-200 cursor-pointer hover:bg-gray-50 ${
            !isCurrentMonth ? 'bg-gray-50 text-gray-400' : ''
          } ${isToday ? 'bg-blue-50 border-blue-200' : ''}`}
          onClick={() => {
            setSelectedDate(date);
            setCurrentDate(date);
            setView('day');
          }}
        >
          <div className={`text-sm font-medium mb-1 ${isToday ? 'text-blue-600' : ''}`}>
            {date.getDate()}
          </div>
          <div className="space-y-1">
            {dayTasks.slice(0, 3).map((task) => (
              <div
                key={task._id}
                className={`text-xs p-1 rounded truncate ${getStatusColor(task.status)}`}
                title={task.taskName}
              >
                {task.taskName}
              </div>
            ))}
            {dayTasks.length > 3 && (
              <div className="text-xs text-gray-500">+{dayTasks.length - 3} more</div>
            )}
          </div>
        </div>
      );
    }
    
    return (
      <div>
        <div className="grid grid-cols-7 gap-0 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="p-2 text-center text-sm font-medium text-gray-600 bg-gray-50">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-0 border border-gray-200 text-xs sm:text-sm">
          {days}
        </div>
      </div>
    );
  };

  const renderWeekView = () => {
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
    
    const days = [];
    const today = new Date();
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      
      const isToday = date.toDateString() === today.toDateString();
      const dayTasks = getTasksForDate(date);
      
      days.push(
        <div key={i} className={`flex-1 min-w-32 border-r border-gray-200 last:border-r-0 ${isToday ? 'bg-blue-50' : ''}`}>
          <div className={`p-3 border-b border-gray-200 text-center ${isToday ? 'bg-blue-100' : 'bg-gray-50'}`}>
            <div className="text-sm text-gray-600">
              {date.toLocaleDateString('en-US', { weekday: 'short' })}
            </div>
            <div className={`text-lg font-semibold ${isToday ? 'text-blue-600' : 'text-gray-900'}`}>
              {date.getDate()}
            </div>
          </div>
          <div className="p-2 space-y-1 min-h-96">
            {dayTasks.map((task) => (
              <div
                key={task._id}
                className={`p-2 rounded text-sm ${getStatusColor(task.status)}`}
              >
                <div className="font-medium truncate">{task.taskName}</div>
                {task.startTime && (
                  <div className="text-xs opacity-75">
                    {new Date(task.startTime).toLocaleTimeString('en-US', { 
                      hour: 'numeric', 
                      minute: '2-digit',
                      hour12: true 
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      );
    }
    
    return (
      <div className="border border-gray-200 rounded-lg overflow-hidden overflow-x-auto">
        <div className="flex min-w-full">
          {days}
        </div>
      </div>
    );
  };

  const renderDayView = () => {
    const dayTasks = getTasksForDate(currentDate);
    const hours = Array.from({ length: 24 }, (_, i) => i);
    
    return (
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="bg-gray-50 p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            {currentDate.toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </h3>
          <p className="text-sm text-gray-600">{dayTasks.length} task{dayTasks.length !== 1 ? 's' : ''}</p>
        </div>
        
        <div className="max-h-96 overflow-y-auto">
          {hours.map(hour => {
            const hourTasks = dayTasks.filter(task => {
              if (!task.startTime) return false;
              return new Date(task.startTime).getHours() === hour;
            });
            
            return (
              <div key={hour} className="flex border-b border-gray-100">
                <div className="w-16 p-2 text-sm text-gray-500 bg-gray-50 border-r border-gray-200">
                  {hour.toString().padStart(2, '0')}:00
                </div>
                <div className="flex-1 p-2 min-h-12">
                  {hourTasks.map((task) => (
                    <div
                      key={task._id}
                      className={`mb-1 p-2 rounded text-sm ${getStatusColor(task.status)}`}
                    >
                      <div className="font-medium">{task.taskName}</div>
                      <div className="text-xs opacity-75">
                        {task.startTime && task.endTime && (
                          `${new Date(task.startTime).toLocaleTimeString('en-US', { 
                            hour: 'numeric', 
                            minute: '2-digit',
                            hour12: true 
                          })} - ${new Date(task.endTime).toLocaleTimeString('en-US', { 
                            hour: 'numeric', 
                            minute: '2-digit',
                            hour12: true 
                          })}`
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const getViewTitle = () => {
    switch (view) {
      case 'year':
        return currentDate.getFullYear().toString();
      case 'month':
        return currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      case 'week':
        const startOfWeek = new Date(currentDate);
        startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        return `${startOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
      case 'day':
        return currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
      default:
        return '';
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
        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Calendar</h1>
          
          {/* View Selector */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            {['year', 'month', 'week', 'day'].map((viewType) => (
              <button
                key={viewType}
                onClick={() => setView(viewType)}
                className={`px-2 sm:px-3 py-1 text-xs sm:text-sm font-medium rounded-md transition-colors ${
                  view === viewType
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {viewType.charAt(0).toUpperCase() + viewType.slice(1)}
              </button>
            ))}
          </div>
        </div>
        
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary flex items-center w-full sm:w-auto justify-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Task
        </button>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 sm:space-x-4 flex-1">
          <button
            onClick={() => navigateDate(-1)}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <h2 className="text-sm sm:text-xl font-semibold text-gray-900 text-center flex-1">
            {getViewTitle()}
          </h2>
          
          <button
            onClick={() => navigateDate(1)}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
        
        <button
          onClick={goToToday}
          className="btn-secondary ml-4 text-sm"
        >
          Today
        </button>
      </div>

      {/* Calendar Content */}
      <div className="bg-white rounded-lg">
        {view === 'year' && renderYearView()}
        {view === 'month' && renderMonthView()}
        {view === 'week' && renderWeekView()}
        {view === 'day' && renderDayView()}
      </div>

      {/* Add Task Modal */}
      {showAddModal && (
        <AddTaskModal
          onClose={() => setShowAddModal(false)}
          onTaskAdded={handleTaskAdded}
        />
      )}
    </div>
  );
};

export default Calendar;