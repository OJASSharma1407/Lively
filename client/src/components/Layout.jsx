import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import AIChatBot from './AIChatBot';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex transition-colors">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:ml-0">
        {/* Header */}
        <Header onMenuClick={() => setSidebarOpen(true)} />
        
        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-6 text-gray-900 dark:text-gray-100">
          {children}
        </main>
      </div>
      
      {/* AI Chatbot */}
      <AIChatBot />
    </div>
  );
};

export default Layout;