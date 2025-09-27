import React, { useState, useEffect } from 'react';
import { User, Clock, Moon, Sun, Save, Palette } from 'lucide-react';
import { userAPI } from '../utils/api';
import { useTheme } from '../context/ThemeContext';
import toast from 'react-hot-toast';

const Settings = () => {
  const [profile, setProfile] = useState(null);
  const [sleepSchedule, setSleepSchedule] = useState({
    sleepStart: '23:00',
    sleepEnd: '07:00'
  });
  const [energyMood, setEnergyMood] = useState({
    energyLevel: 5,
    mood: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { theme, toggleTheme, isDark } = useTheme();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await userAPI.getProfile();
      const data = response.data;
      setProfile(data);
      setSleepSchedule({
        sleepStart: data.sleepStart || '23:00',
        sleepEnd: data.sleepEnd || '07:00'
      });
    } catch (error) {
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSleepScheduleChange = (e) => {
    const { name, value } = e.target;
    setSleepSchedule(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEnergyMoodChange = (e) => {
    const { name, value } = e.target;
    setEnergyMood(prev => ({
      ...prev,
      [name]: name === 'energyLevel' ? parseInt(value) : value
    }));
  };

  const saveSleepSchedule = async () => {
    setSaving(true);
    try {
      await userAPI.updateSleepSchedule(sleepSchedule.sleepStart, sleepSchedule.sleepEnd);
      toast.success('Sleep schedule updated!');
    } catch (error) {
      toast.error('Failed to update sleep schedule');
    } finally {
      setSaving(false);
    }
  };

  const saveEnergyMood = async () => {
    if (!energyMood.mood.trim()) {
      toast.error('Please enter your mood');
      return;
    }
    
    setSaving(true);
    try {
      await userAPI.addEnergyMood(energyMood.energyLevel, energyMood.mood);
      toast.success('Energy and mood logged!');
      setEnergyMood({ energyLevel: 5, mood: '' });
    } catch (error) {
      toast.error('Failed to log energy and mood');
    } finally {
      setSaving(false);
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
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Manage your profile and preferences</p>
      </div>

      {/* Profile Section */}
      <div className="card">
        <div className="flex items-center mb-6">
          <div className="p-2 bg-blue-100 rounded-lg">
            <User className="w-6 h-6 text-blue-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 ml-3">Profile Information</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              User ID
            </label>
            <input
              type="text"
              value={profile?.userId || 'Loading...'}
              className="input-field bg-gray-50"
              disabled
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Member Since
            </label>
            <input
              type="text"
              value={profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'Loading...'}
              className="input-field bg-gray-50"
              disabled
            />
          </div>
        </div>
      </div>

      {/* Theme Settings */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900 rounded-lg">
              <Palette className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 ml-3">Theme</h2>
          </div>
        </div>
        
        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="flex items-center space-x-3">
            {isDark ? (
              <Moon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            ) : (
              <Sun className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            )}
            <div>
              <p className="font-medium text-gray-900 dark:text-gray-100">
                {isDark ? 'Dark Mode' : 'Light Mode'}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {isDark ? 'Easy on the eyes' : 'Classic bright theme'}
              </p>
            </div>
          </div>
          
          <button
            onClick={toggleTheme}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              isDark ? 'bg-primary-500' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                isDark ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
        
        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            🎨 Your theme preference is automatically saved and synced across all your devices.
          </p>
        </div>
      </div>

      {/* Sleep Schedule */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Moon className="w-6 h-6 text-purple-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 ml-3">Sleep Schedule</h2>
          </div>
          <button
            onClick={saveSleepSchedule}
            disabled={saving}
            className="btn-primary flex items-center disabled:opacity-50"
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sleep Start Time
            </label>
            <div className="relative">
              <Moon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="time"
                name="sleepStart"
                value={sleepSchedule.sleepStart}
                onChange={handleSleepScheduleChange}
                className="input-field pl-10"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Wake Up Time
            </label>
            <div className="relative">
              <Sun className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="time"
                name="sleepEnd"
                value={sleepSchedule.sleepEnd}
                onChange={handleSleepScheduleChange}
                className="input-field pl-10"
              />
            </div>
          </div>
        </div>
        
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-700">
            💡 Your sleep schedule helps Lively avoid scheduling tasks during your rest time and optimize your daily planning.
          </p>
        </div>
      </div>

      {/* Energy & Mood Tracking */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Clock className="w-6 h-6 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 ml-3">Daily Energy & Mood</h2>
          </div>
          <button
            onClick={saveEnergyMood}
            disabled={saving || !energyMood.mood.trim()}
            className="btn-primary flex items-center disabled:opacity-50"
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Logging...' : 'Log Today'}
          </button>
        </div>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Energy Level (1-10)
            </label>
            <div className="flex items-center space-x-4">
              <input
                type="range"
                name="energyLevel"
                min="1"
                max="10"
                value={energyMood.energyLevel}
                onChange={handleEnergyMoodChange}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-lg font-semibold text-gray-900 w-8">
                {energyMood.energyLevel}
              </span>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Low Energy</span>
              <span>High Energy</span>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Mood
            </label>
            <input
              type="text"
              name="mood"
              value={energyMood.mood}
              onChange={handleEnergyMoodChange}
              className="input-field"
              placeholder="How are you feeling today? (e.g., motivated, tired, focused)"
            />
          </div>
        </div>
        
        <div className="mt-4 p-4 bg-green-50 rounded-lg">
          <p className="text-sm text-green-700">
            📊 Track your daily energy and mood to help Lively learn your patterns and suggest optimal task scheduling.
          </p>
        </div>
      </div>

      {/* Current Energy Pattern */}
      {profile?.energyPatterns && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Latest Energy Log</h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Energy Level</p>
                <p className="text-lg font-semibold text-gray-900">{profile.energyPatterns.energyLevel}/10</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Mood</p>
                <p className="text-lg font-semibold text-gray-900">{profile.energyPatterns.mood}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Date</p>
                <p className="text-lg font-semibold text-gray-900">
                  {new Date(profile.energyPatterns.date).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;