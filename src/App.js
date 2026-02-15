import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

// Lazy load pages for better initial load performance
const CreatePoll = lazy(() => import('./pages/CreatePoll'));
const PollPage = lazy(() => import('./pages/PollPage'));

// Loading component
const LoadingScreen = () => (
  <div className="container" style={{ textAlign: 'center', padding: '100px 50px' }}>
    <h2 style={{ color: '#fff', marginBottom: '20px' }}>Loading...</h2>
    <div className="loading-spinner"></div>
  </div>
);

function App() {
  return (
    <Router>
      <div className="App">
        <Suspense fallback={<LoadingScreen />}>
          <Routes>
            <Route path="/" element={<CreatePoll />} />
            <Route path="/poll/:pollId" element={<PollPage />} />
          </Routes>
        </Suspense>
      </div>
    </Router>
  );
}

export default App;
