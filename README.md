# Lively - AI-Powered Task Scheduler

Lively is a dynamic task planner that adapts to your daily routine, suggests the best time slots, and keeps your day on track — like a personal AI buddy for your life.

## 🚀 Features

### 📅 Smart Task Management
- **CRUD Operations**: Create, read, update, and delete tasks with validation
- **Time Conflict Prevention**: Automatic detection and prevention of overlapping tasks
- **Priority & Category System**: Organize tasks by priority (High/Medium/Low) and categories
- **Recurring Tasks**: Support for daily, weekly, and monthly recurring tasks

### 🤖 AI Integration
- **Intelligent Chatbot**: Context-aware AI assistant for productivity insights
- **Smart Scheduling**: AI-powered task scheduling suggestions
- **Productivity Analytics**: AI-generated insights based on your task completion patterns
- **Auto-Rescheduling**: AI reschedules missed tasks to optimal time slots

### 📸 Timetable Upload & OCR
- **Image Upload**: Upload timetable images (JPG, PNG, etc.)
- **OCR Processing**: Extract schedule data using Tesseract.js
- **Auto Task Creation**: Automatically create recurring tasks from timetables
- **Smart Parsing**: Handles various timetable formats and layouts

### 📊 Analytics Dashboard
- **Progress Tracking**: Visual progress tracking with persistent data
- **Weekly/Monthly Stats**: Completion rates, missed tasks, and productivity metrics
- **Category Analytics**: Performance breakdown by task categories
- **Productivity Insights**: Data-driven recommendations for improvement

### 📱 Modern UI/UX
- **Responsive Design**: Mobile-first approach with touch-friendly interfaces
- **Dark Mode**: Complete dark theme with backend persistence
- **Calendar Views**: Year/Month/Week/Day views with Google Calendar-style interface
- **Real-time Updates**: Live notifications and instant UI updates

### 🔔 Notification System
- **Smart Reminders**: Automated task reminders with cron jobs
- **Missed Task Alerts**: Immediate and final notifications for missed tasks
- **Real-time Notifications**: Live notification system with duplicate prevention
- **Notification History**: Persistent notification storage and management

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern UI library
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Beautiful icon library
- **React Router** - Client-side routing
- **React Hot Toast** - Elegant notifications
- **Axios** - HTTP client

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - Authentication tokens
- **Multer** - File upload handling

### AI & OCR
- **Tesseract.js** - OCR text extraction
- **Sharp** - Image processing
- **Custom AI Service** - Local AI for task scheduling

### DevOps & Tools
- **Cron Jobs** - Automated background tasks
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment variable management

## 📦 Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Backend Setup
```bash
cd server
npm install
