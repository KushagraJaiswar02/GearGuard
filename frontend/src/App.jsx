import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          {/* Add more routes as needed */}
          <Route path="*" element={<div className="text-center mt-20 text-muted-foreground">Not Implemented</div>} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
