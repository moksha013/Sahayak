import React from 'react';
import { UI_STRINGS } from '../translations/content';

/**
 * Simple tab component.
 * Props:
 *   tabs – array of {key:string, label:string}
 *   activeKey – currently selected tab key
 *   onChange – (key) => void
 */
export default function ResultTabs({ tabs, activeKey, onChange, language }) {
  const t = UI_STRINGS[language] || UI_STRINGS.en;
  return (
    <div className="border-b border-slate-200 mb-4">
      <nav className="flex space-x-4">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => onChange(tab.key)}
            className={`px-3 py-1 text-sm font-medium border-b-2 ${activeKey === tab.key ? 'border-orange-600 text-orange-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
