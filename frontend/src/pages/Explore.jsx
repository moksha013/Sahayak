import React, { useEffect, useState } from 'react';
import SourcesPanel from '../components/SourcesPanel';
import FeatureCards from '../components/FeatureCards';
import CentreFinder from '../components/CentreFinder';

export default function Explore({ language }) {
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // TODO: replace the endpoint with the actual backend route that returns official sources
    fetch('/api/sources')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        // Prefer specific source lists; fall back to generic 'sources' array if present
        // Combine all official source lists: PAN, Ayushman, and boundary sources
        const srcList = [];
        if (Array.isArray(data.panCardSources)) srcList.push(...data.panCardSources);
        if (Array.isArray(data.ayushmanSources)) srcList.push(...data.ayushmanSources);
        if (Array.isArray(data.boundarySources)) srcList.push(...data.boundarySources);
        // Fallback to generic 'sources' array if no specific lists are present
        if (srcList.length === 0 && Array.isArray(data.sources)) srcList.push(...data.sources);
        setSources(srcList);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      {loading && <p>Loading official sources…</p>}
      {error && <p className="text-red-600">Error: {error}</p>}
      <SourcesPanel language={language} sources={sources} />
      <CentreFinder language={language} />
    </div>
  );
}
