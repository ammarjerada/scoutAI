import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { Navigation } from './components/layout/Navigation';
import { HomePage } from './pages/HomePage';
import { PlayersPage } from './pages/PlayersPage';
import { PlayerDetailPage } from './pages/PlayerDetailPage';
import { DashboardPage } from './pages/DashboardPage';
import { ComparisonPage } from './pages/ComparisonPage';
import { ProfilePage } from './pages/ProfilePage';
import { DraftPage } from './pages/DraftPage';
import { ChatPage } from './pages/ChatPage';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-white transition-colors duration-200">
            <Navigation />
            <main>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/players" element={<PlayersPage />} />
                <Route path="/player/:playerName" element={<PlayerDetailPage />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/comparison" element={<ComparisonPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/draft" element={<DraftPage />} />
                <Route path="/chat" element={<ChatPage />} />
              </Routes>
            </main>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}