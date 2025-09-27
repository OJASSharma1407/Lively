import React, { useState } from 'react';
import { Upload, FileImage, X, Calendar, Clock, BookOpen, CheckCircle, AlertCircle } from 'lucide-react';
import { timetableAPI } from '../utils/api';
import toast from 'react-hot-toast';

const TimetableUpload = ({ isOpen, onClose, onTasksCreated }) => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [parsing, setParsing] = useState(false);
  const [parsedSchedule, setParsedSchedule] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [saving, setSaving] = useState(false);

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target.result);
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type.startsWith('image/')) {
      setFile(droppedFile);
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target.result);
      reader.readAsDataURL(droppedFile);
    }
  };

  const parseImage = async () => {
    if (!file) return;

    setParsing(true);
    try {
      const formData = new FormData();
      formData.append('timetable', file);

      const response = await timetableAPI.uploadTimetable(formData);
      setParsedSchedule(response.data.schedule);
      setTasks(response.data.tasks);
      toast.success(`Found ${response.data.tasksCount} classes in your timetable!`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to parse timetable');
    } finally {
      setParsing(false);
    }
  };

  const saveTasks = async () => {
    setSaving(true);
    try {
      const response = await timetableAPI.saveTasks({ tasks });
      toast.success(`Successfully created ${response.data.savedTasks} recurring tasks!`);
      
      if (response.data.errors?.length > 0) {
        toast.error(`${response.data.errors.length} conflicts found - check console for details`);
        console.log('Task conflicts:', response.data.errors);
      }
      
      onTasksCreated?.(response.data.tasks);
      handleClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save tasks');
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setPreview(null);
    setParsedSchedule(null);
    setTasks([]);
    onClose();
  };

  const formatTime = (timeObj) => {
    const hour = timeObj.hour > 12 ? timeObj.hour - 12 : timeObj.hour === 0 ? 12 : timeObj.hour;
    const period = timeObj.hour >= 12 ? 'PM' : 'AM';
    return `${hour}:${timeObj.minute.toString().padStart(2, '0')} ${period}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Upload Timetable</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">Upload an image of your timetable to create recurring tasks</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {!parsedSchedule ? (
            <div className="space-y-6">
              {/* File Upload */}
              <div
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center hover:border-blue-400 dark:hover:border-blue-500 transition-colors"
              >
                {preview ? (
                  <div className="space-y-4">
                    <img src={preview} alt="Timetable preview" className="max-h-64 mx-auto rounded-lg shadow-md" />
                    <div className="flex items-center justify-center space-x-4">
                      <button
                        onClick={() => { setFile(null); setPreview(null); }}
                        className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                      >
                        Remove
                      </button>
                      <button
                        onClick={parseImage}
                        disabled={parsing}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
                      >
                        {parsing ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            <span>Parsing...</span>
                          </>
                        ) : (
                          <>
                            <FileImage className="w-4 h-4" />
                            <span>Parse Timetable</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                    <div>
                      <p className="text-lg font-medium text-gray-900 dark:text-gray-100">Drop your timetable image here</p>
                      <p className="text-gray-600 dark:text-gray-400">or click to browse files</p>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                      id="timetable-upload"
                    />
                    <label
                      htmlFor="timetable-upload"
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Choose File
                    </label>
                  </div>
                )}
              </div>

              {/* Instructions */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Tips for best results:</h3>
                <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                  <li>• Ensure the image is clear and well-lit</li>
                  <li>• Include day names (Monday, Tuesday, etc.)</li>
                  <li>• Make sure time slots and subject names are visible</li>
                  <li>• Avoid shadows or reflections on the timetable</li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Parsed Schedule Preview */}
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                  <h3 className="font-medium text-green-900 dark:text-green-100">Timetable Parsed Successfully!</h3>
                </div>
                <p className="text-sm text-green-800 dark:text-green-200">
                  Found {tasks.length} classes across {parsedSchedule.length} days. Review and save to create recurring tasks.
                </p>
              </div>

              {/* Schedule Display */}
              <div className="grid gap-4">
                {parsedSchedule.map((daySchedule, dayIndex) => (
                  <div key={dayIndex} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 capitalize">
                      {daySchedule.day}
                    </h4>
                    <div className="space-y-2">
                      {daySchedule.slots.map((slot, slotIndex) => (
                        <div key={slotIndex} className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
                          <div className="flex items-center space-x-3">
                            <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            <span className="font-medium text-gray-900 dark:text-gray-100">{slot.subject}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                            <Clock className="w-4 h-4" />
                            <span>{formatTime(slot.startTime)} - {formatTime(slot.endTime)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setParsedSchedule(null)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                >
                  Parse Different Image
                </button>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={handleClose}
                    className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveTasks}
                    disabled={saving}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center space-x-2"
                  >
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        <span>Create {tasks.length} Recurring Tasks</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TimetableUpload;