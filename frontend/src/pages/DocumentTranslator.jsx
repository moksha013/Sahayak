import React, { useState } from 'react';
import UploadArea from '../components/UploadArea';
import ResultTabs from '../components/ResultTabs';
import KeyInfoPanel from '../components/KeyInfoPanel';
import { UI_STRINGS } from '../translations/content';

/**
 * Page for the Government Document Translator feature.
 * Props:
 *   language: 'en' | 'hi' | 'te'
 */
export default function DocumentTranslator({ language }) {
  const TRANSLATOR_ENABLED = false; // TODO: backend endpoint /api/document/process not yet implemented
  const [file, setFile] = useState(null);
  const [targetLang, setTargetLang] = useState('en');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('original');

  const handleFileSelect = (selected) => {
    setFile(selected);
    setResult(null);
    setError('');
  };

  // Translate handler – guarded because backend is not yet implemented
  const handleTranslate = async () => {
    if (!TRANSLATOR_ENABLED) {
      setError(t.backendPending || 'Backend integration pending.');
      return;
    }
    if (!file) {
      setError(t.fileTypeError);
      return;
    }
    setLoading(true);
    setError('');
    const form = new FormData();
    form.append('file', file);
    form.append('language', targetLang);
    try {
      const resp = await fetch('/api/document/process', {
        method: 'POST',
        body: form,
      });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const data = await resp.json();
      setResult(data);
      setActiveTab('original');
    } catch (e) {
      console.error(e);
      setError(t.uploadFailed);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { key: 'original', label: t.originalTab },
    { key: 'translation', label: t.translationTab },
    { key: 'explanation', label: t.explanationTab },
    { key: 'keyInfo', label: t.keyInfoTab },
  ];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">{t.docTranslatorTitle}</h1>
      <p className="mb-4 text-gray-600">{t.docTranslatorDesc}</p>

      <UploadArea onFileSelect={handleFileSelect} language={language} />

      {/* Language selector */}
      <div className="mt-4 flex items-center gap-2">
        <label htmlFor="targetLang" className="text-sm font-medium">{t.chooseLanguage}:</label>
        <select
          id="targetLang"
          value={targetLang}
          onChange={(e) => setTargetLang(e.target.value)}
          className="border rounded px-2 py-1"
        >
          <option value="en">English</option>
          <option value="hi">हिन्दी</option>
          <option value="te">తెలుగు</option>
        </select>
      </div>

      <button
        onClick={handleTranslate}
        disabled={loading}
        className="mt-4 px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 disabled:opacity-50"
      >
        {loading ? t.processing : t.translateBtn}
      </button>

      {error && <p className="mt-2 text-red-600">{error}</p>}

      {result && (
        <div className="mt-6">
          <ResultTabs tabs={tabs} activeKey={activeTab} onChange={setActiveTab} language={language} />
          <div className="p-4 border rounded bg-gray-50 mt-2 min-h-[200px]">
            {activeTab === 'original' && <pre className="whitespace-pre-wrap">{result.original}</pre>}
            {activeTab === 'translation' && <pre className="whitespace-pre-wrap">{result.translation}</pre>}
            {activeTab === 'explanation' && <pre className="whitespace-pre-wrap">{result.explanation}</pre>}
            {activeTab === 'keyInfo' && <KeyInfoPanel keyInfo={result.keyInfo} />}
          </div>
        </div>
      )}
    </div>
  );
}
