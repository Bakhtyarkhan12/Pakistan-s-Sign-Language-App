import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from "./appcontext"; 

import Navbar from './components/navbar';
import Home from './pages/home';
import Learn from './pages/learn';
import Quiz from './pages/quiz';
import Translation from './pages/translation';
import AuthPage from './pages/authpage';
import ProfilePage from './pages/profile';

function App() {
  return (
    <AppProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/learn" element={<Learn />} />
          <Route path="/quiz" element={<Quiz />} />
          <Route path="/translation" element={<Translation />} />
          <Route path="/authpage" element={<AuthPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Routes>
      </Router>
    </AppProvider>
  );
}

export default App;
