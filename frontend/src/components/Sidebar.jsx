import React, { useState } from 'react';
import { Home, Mic, Compass, FileText, MapPin, BookOpen, FileCheck, Calendar, CheckCircle, ChevronDown, ChevronRight, Menu } from 'lucide-react';
import { UI_STRINGS } from '../translations/content';

/**
 * Persistent left sidebar navigation with hierarchical sections.
 * Props:
 *   language – locale key (en/hi/te)
 *   currentPage – currently active page identifier
 *   setCurrentPage – function to switch pages (from App state)
 */
export default function Sidebar({ language, currentPage, setCurrentPage }) {
  const t = UI_STRINGS[language] || UI_STRINGS.en;
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expandExplore, setExpandExplore] = useState(true);
  const [expandMy, setExpandMy] = useState(true);

  const sections = [
    {
      key: 'home',
      label: 'HOME',
      icon: <Home size={20} />, // parent icon (optional)
      children: [
        { key: 'home', label: t.appTitle || 'Home', icon: <Home size={16} /> },
        { key: 'voice', label: t.voiceFirst || 'Voice Assistant', icon: <Mic size={16} /> },
      ],
    },
    {
      key: 'explore',
      label: 'EXPLORE SERVICES',
      icon: <Compass size={20} />, // parent icon
      children: [
        { key: 'doc-translator', label: t.docTranslatorTitle || 'Translate Documents', icon: <FileText size={16} /> },
        { key: 'centre-finder', label: t.centreFinderNavBtn || 'Find Service Centres', icon: <MapPin size={16} /> },
        { key: 'verified-sources', label: t.sourcesHeaderTitle || 'Verified Sources', icon: <BookOpen size={16} /> },
      ],
    },
    {
      key: 'myservices',
      label: 'MY SERVICES',
      icon: <FileCheck size={20} />, // parent icon
      children: [
        { key: 'checklist', label: t.checklistHeaderTitle || 'Document Checklist', icon: <CheckCircle size={16} /> },
        { key: 'tracker', label: t.trackerTitle || 'Application Tracker', icon: <Calendar size={16} /> },
      ],
    },
  ];

  const sidebarWidth = collapsed ? 'w-20' : 'w-64';
  const activeStyle = 'bg-orange-600 text-white'; // warm orange for active
  const hoverStyle = 'hover:bg-gray-700';

  const pageMap = {
  voice: "home",
  "centre-finder": "explore",
  "verified-sources": "explore",
  checklist: "myservices",
  tracker: "myservices",
  "doc-translator": "doc-translator",
  home: "home",
  myservices: "myservices",
  explore: "explore",
};

const renderSection = (section) => (
    <div key={section.key} className="mb-2">
      {/* Parent header */}
      <button
        className={`flex items-center w-full px-4 py-2 text-sm font-medium ${hoverStyle} ${collapsed ? 'justify-center' : ''}`}
        onClick={() => {
          if (section.key === 'explore') setExpandExplore(!expandExplore);
          else if (section.key === 'myservices') setExpandMy(!expandMy);
          else setCurrentPage(section.key);
        }}
        title={collapsed ? section.label : undefined}
      >
        <span className="mr-2">{section.icon}</span>
        {!collapsed && <span className="flex-1 text-left">{section.label}</span>}
        {!collapsed && (
          <span className="ml-2">
            {section.key === 'explore' ? (
              expandExplore ? <ChevronDown size={14} /> : <ChevronRight size={14} />
            ) : section.key === 'myservices' ? (
              expandMy ? <ChevronDown size={14} /> : <ChevronRight size={14} />
            ) : null}
          </span>
        )}
      </button>
      {/* Children */}
      {((section.key === 'explore' && expandExplore) || (section.key === 'myservices' && expandMy) || section.key === 'home') && (
        <div className="ml-4">
          {section.children.map((item) => (
            <button
              key={item.key + item.label}
              onClick={() => { const targetPage = pageMap[item.key] || item.key; setCurrentPage(targetPage); if (mobileOpen) setMobileOpen(false); }}
              className={`flex items-center w-full px-3 py-1.5 text-xs rounded transition-colors duration-150 ${currentPage === item.key ? activeStyle : ''} ${hoverStyle}`}
              title={collapsed ? item.label : undefined}
            >
              <span className="mr-2">{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );

  const renderSidebar = () => (
    <aside className={`${sidebarWidth} bg-[#111827] text-white h-full transition-width duration-200 flex flex-col`}>
      {/* Header with brand and collapse button */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
        {!collapsed && <span className="font-semibold text-lg">{t.appTitle || 'SAHAYAK'}</span>}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 hover:bg-gray-800 rounded"
          aria-label="Toggle sidebar"
        >
          <Menu size={20} />
        </button>
      </div>
      <nav className="flex-1 overflow-y-auto py-2">
        {sections.map(renderSection)}
      </nav>
    </aside>
  );

  return (
    <>
      {/* Mobile overlay */}
      <div className="md:hidden">
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 fixed top-4 left-4 z-50 bg-[#111827] text-white rounded"
          aria-label="Open sidebar"
        >
          <Menu size={24} />
        </button>
        {mobileOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setMobileOpen(false)} />
        )}
        <div className={`fixed inset-y-0 left-0 z-50 transform ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-200`}>
          {renderSidebar()}
        </div>
      </div>
      {/* Desktop sidebar */}
      <div className="hidden md:block">
        {renderSidebar()}
      </div>
    </>
  );
}
