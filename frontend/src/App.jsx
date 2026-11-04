import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import MyServices from './pages/MyServices';
import Explore from './pages/Explore';
import DocumentTranslator from './pages/DocumentTranslator';
import Sidebar from './components/Sidebar';
import { checkBackendHealth } from './services/api';

export default function App() {
  const [currentPage, setCurrentPage] = useState('home'); // 'home' | 'myservices' | 'explore' | 'doc-translator'
  const [language, setLanguage] = useState('hi');
  const [fontSize, setFontSize] = useState(16);
  const [highContrast, setHighContrast] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [backendStatus, setBackendStatus] = useState(null);

  useEffect(() => {
    checkBackendHealth().then((res) => setBackendStatus(res?.status || 'mock_mode'));
  }, []);

  const handleReset = () => setCurrentPage('home');

  return (
    <div className={`min-h-screen flex bg-[#F8FAFC] transition-colors ${highContrast ? 'high-contrast bg-neutral-900 text-yellow-300' : ''}`}>
      {/* Sidebar (desktop & mobile) */}
      <Sidebar language={language} currentPage={currentPage} setCurrentPage={setCurrentPage} />

      {/* Main area */}
      <div className="flex-1 flex flex-col">
        {/* Navigation Header */}
        <Navbar
          language={language}
          setLanguage={setLanguage}
          fontSize={fontSize}
          setFontSize={setFontSize}
          highContrast={highContrast}
          setHighContrast={setHighContrast}
          isAudioMuted={isAudioMuted}
          setIsAudioMuted={setIsAudioMuted}
          onReset={handleReset}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
        />

        {/* Main View Area */}
        <main className="flex-1 pb-12 p-4">
          {currentPage === 'home' && (
            <Home
              language={language}
              fontSize={fontSize}
              isAudioMuted={isAudioMuted}
              setLanguage={setLanguage}
              setCurrentPage={setCurrentPage}
            />
          )}
          {currentPage === 'myservices' && <MyServices language={language} />}
          {currentPage === 'explore' && <Explore language={language} setCurrentPage={setCurrentPage} />}
          {currentPage === 'doc-translator' && <DocumentTranslator language={language} />}
        </main>

        {/* Footer & Status Bar */}
        <footer className="border-t border-slate-200/80 bg-white/60 py-4 px-4 text-center text-xs text-slate-500">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span className="font-semibold text-slate-700">Sahayak Voice Assistant</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
