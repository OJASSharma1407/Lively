import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Brain, Upload, BarChart3, Bell, Smartphone, ArrowRight, Sparkles } from 'lucide-react';

const Landing = () => {
  const features = [
    {
      icon: <Calendar className="w-8 h-8 text-blue-600" />,
      title: "Smart Task Management",
      description: "Create, organize, and track tasks with intelligent scheduling and conflict prevention."
    },
    {
      icon: <Brain className="w-8 h-8 text-purple-600" />,
      title: "AI Assistant",
      description: "Get personalized productivity insights and smart scheduling suggestions."
    },
    {
      icon: <Upload className="w-8 h-8 text-green-600" />,
      title: "Timetable Upload",
      description: "Upload your timetable image and automatically create recurring tasks with OCR."
    },
    {
      icon: <BarChart3 className="w-8 h-8 text-orange-600" />,
      title: "Analytics Dashboard",
      description: "Track your productivity with detailed analytics and progress visualization."
    },
    {
      icon: <Bell className="w-8 h-8 text-red-600" />,
      title: "Smart Notifications",
      description: "Never miss a task with intelligent reminders and real-time notifications."
    },
    {
      icon: <Smartphone className="w-8 h-8 text-indigo-600" />,
      title: "Mobile Responsive",
      description: "Access your tasks anywhere with our fully responsive design."
    }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                <span className="text-xl font-bold text-white">L</span>
              </div>
              <span className="ml-3 text-2xl font-bold text-gray-900 dark:text-gray-100">Lively</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/login" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 font-medium">
                Sign In
              </Link>
              <Link to="/register" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-800 dark:to-gray-900 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-gray-100 mb-6">
              Your Personal <span className="text-blue-600">AI Buddy</span><br />for Life Management
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-3xl mx-auto">
              Lively adapts to your daily routine, suggests optimal time slots, and keeps your day on track with intelligent task management and AI-powered insights.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register" className="bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 font-semibold text-lg flex items-center justify-center">
                Start Your Journey <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <Link to="/login" className="border-2 border-blue-600 text-blue-600 px-8 py-4 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-800 font-semibold text-lg">
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Everything You Need to Stay Organized
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Powerful features designed to make your life easier and more productive.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 hover:shadow-lg transition-shadow">
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">How Lively Works</h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">Simple steps to transform your productivity</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Create Your Tasks</h3>
              <p className="text-gray-600 dark:text-gray-400">Add tasks manually or upload your timetable image for automatic task creation.</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Let AI Optimize</h3>
              <p className="text-gray-600 dark:text-gray-400">Our AI analyzes your patterns and suggests the best time slots for maximum productivity.</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Stay on Track</h3>
              <p className="text-gray-600 dark:text-gray-400">Get smart reminders, track progress, and receive insights to improve your productivity.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <Sparkles className="w-16 h-16 text-white mx-auto mb-4" />
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Ready to Transform Your Productivity?</h2>
          <p className="text-xl text-blue-100 mb-8">Join thousands of users who have already made their lives more organized with Lively.</p>
          <Link to="/register" className="bg-white text-blue-600 px-8 py-4 rounded-lg hover:bg-gray-100 font-semibold text-lg inline-flex items-center">
            Get Started for Free <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-lg font-bold text-white">L</span>
              </div>
              <span className="ml-2 text-xl font-bold">Lively</span>
            </div>
            <div className="text-gray-400">© 2024 Lively. Made with ❤️ by Ojas Sharma</div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;