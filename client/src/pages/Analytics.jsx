import React, { useState, useEffect } from 'react';
import { TrendingUp, Target, Calendar, Clock, BarChart3 } from 'lucide-react';
import { progressAPI } from '../utils/api';
import toast from 'react-hot-toast';

const Analytics = () => {
  const [weeklyStats, setWeeklyStats] = useState(null);
  const [monthlyStats, setMonthlyStats] = useState(null);
  const [categoryAnalytics, setCategoryAnalytics] = useState(null);
  const [productivityInsights, setProductivityInsights] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const [weekly, monthly, category, productivity] = await Promise.all([
        progressAPI.getWeekly(),
        progressAPI.getMonthly(),
        progressAPI.getCategoryAnalytics(),
        progressAPI.getProductivityInsights()
      ]);
      
      setWeeklyStats(weekly.data);
      setMonthlyStats(monthly.data);
      setCategoryAnalytics(category.data);
      setProductivityInsights(productivity.data);
    } catch (error) {
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const getCompletionColor = (rate) => {
    if (rate >= 80) return 'text-green-600 bg-green-100';
    if (rate >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const renderProgressBar = (completed, total) => {
    const percentage = total > 0 ? (completed / total) * 100 : 0;
    return (
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="bg-primary-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    );
  };

  const renderHourlyChart = (hourlyData) => {
    if (!hourlyData) return null;
    
    const maxTasks = Math.max(...Object.values(hourlyData));
    const hours = Array.from({ length: 24 }, (_, i) => i);
    
    return (
      <div className="flex items-end space-x-1 h-32">
        {hours.map(hour => {
          const tasks = hourlyData[hour] || 0;
          const height = maxTasks > 0 ? (tasks / maxTasks) * 100 : 0;
          
          return (
            <div key={hour} className="flex-1 flex flex-col items-center">
              <div 
                className="w-full bg-primary-500 rounded-t transition-all duration-300 hover:bg-primary-600"
                style={{ height: `${height}%`, minHeight: tasks > 0 ? '4px' : '0' }}
                title={`${hour}:00 - ${tasks} tasks`}
              ></div>
              {hour % 4 === 0 && (
                <span className="text-xs text-gray-500 mt-1">{hour}</span>
              )}
            </div>
          );
        })}
      </div>
    );
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
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-600">Track your productivity and progress</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Weekly Completion</p>
              <p className="text-2xl font-bold text-gray-900">{weeklyStats?.completionRate || 0}%</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Target className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Monthly Completion</p>
              <p className="text-2xl font-bold text-gray-900">{monthlyStats?.completionRate || 0}%</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Tasks</p>
              <p className="text-2xl font-bold text-gray-900">{weeklyStats?.totalTasks || 0}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Best Hour</p>
              <p className="text-2xl font-bold text-gray-900">
                {productivityInsights?.bestProductiveHour || 0}:00
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Weekly vs Monthly Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Progress</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Completed</span>
                <span>{weeklyStats?.completed || 0}/{weeklyStats?.totalTasks || 0}</span>
              </div>
              {renderProgressBar(weeklyStats?.completed || 0, weeklyStats?.totalTasks || 0)}
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Pending</span>
                <span>{weeklyStats?.pending || 0}/{weeklyStats?.totalTasks || 0}</span>
              </div>
              {renderProgressBar(weeklyStats?.pending || 0, weeklyStats?.totalTasks || 0)}
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Missed</span>
                <span>{weeklyStats?.missed || 0}/{weeklyStats?.totalTasks || 0}</span>
              </div>
              {renderProgressBar(weeklyStats?.missed || 0, weeklyStats?.totalTasks || 0)}
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Progress</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Completed</span>
                <span>{monthlyStats?.completed || 0}/{monthlyStats?.totalTasks || 0}</span>
              </div>
              {renderProgressBar(monthlyStats?.completed || 0, monthlyStats?.totalTasks || 0)}
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Pending</span>
                <span>{monthlyStats?.pending || 0}/{monthlyStats?.totalTasks || 0}</span>
              </div>
              {renderProgressBar(monthlyStats?.pending || 0, monthlyStats?.totalTasks || 0)}
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Missed</span>
                <span>{monthlyStats?.missed || 0}/{monthlyStats?.totalTasks || 0}</span>
              </div>
              {renderProgressBar(monthlyStats?.missed || 0, monthlyStats?.totalTasks || 0)}
            </div>
          </div>
        </div>
      </div>

      {/* Category Analytics */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Category Performance</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {categoryAnalytics && Object.entries(categoryAnalytics).map(([category, stats]) => (
            <div key={category} className="text-center">
              <div className="mb-2">
                <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getCompletionColor(stats.completionRate)}`}>
                  {stats.completionRate}%
                </div>
              </div>
              <h4 className="font-medium text-gray-900">{category}</h4>
              <p className="text-sm text-gray-600">
                {stats.completed}/{stats.total} completed
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Productivity Heatmap */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Hourly Productivity</h3>
          <BarChart3 className="w-5 h-5 text-gray-400" />
        </div>
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            Tasks completed by hour of day (last 7 days)
          </p>
        </div>
        {renderHourlyChart(productivityInsights?.hourlyProductivity)}
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            Most productive hour: <span className="font-medium">{productivityInsights?.bestProductiveHour || 0}:00</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Analytics;