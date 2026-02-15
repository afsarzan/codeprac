import React from 'react';

const App = () => {
  return (
    <div className="flex flex-col h-screen">
      <header className="bg-white shadow-md p-4">
        <h1 className="text-xl font-bold">Patent Evaluator</h1>
        <nav>
          <ul className="mt-4">
            <li><a href="#" className="text-blue-600">Home</a></li>
            <li><a href="#" className="text-blue-600">Dashboard</a></li>
            <li><a href="#" className="text-blue-600">Settings</a></li>
          </ul>
        </nav>
      </header>
      <div className="flex flex-1">
        <aside className="w-64 bg-gray-800 text-white p-4">
          <h2 className="text-lg font-semibold mb-4">Navigation</h2>
          <ul className="space-y-2">
            <li><a href="#" className="block hover:bg-gray-700 p-2 rounded">Dashboard</a></li>
            <li><a href="#" className="block hover:bg-gray-700 p-2 rounded">Patents</a></li>
            <li><a href="#" className="block hover:bg-gray-700 p-2 rounded">Reports</a></li>
            <li><a href="#" className="block hover:bg-gray-700 p-2 rounded">Profile</a></li>
          </ul>
        </aside>
        <main className="flex-1 p-4">
          <h2 className="text-2xl font-bold mb-4">Main Content</h2>
          <p>This is the main content area where patent evaluation will take place.</p>
        </main>
      </div>
    </div>
  );
};

export default App;