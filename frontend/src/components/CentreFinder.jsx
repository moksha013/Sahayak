import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Navigation,
  Search,
  ExternalLink,
  ShieldCheck,
  Phone,
  Clock,
  AlertCircle,
  Loader2,
  RefreshCw,
  Building,
  Info
} from 'lucide-react';
import { UI_STRINGS } from '../translations/content';
import { fetchAuthorisedCentres } from '../services/api';

export default function CentreFinder({ language = 'en', initialService = 'pan_card' }) {
  const t = UI_STRINGS[language] || UI_STRINGS.en;

  const [selectedService, setSelectedService] = useState(initialService || 'pan_card');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [locationDenied, setLocationDenied] = useState(false);
  const [locationPermissionPrompt, setLocationPermissionPrompt] = useState(false);
  const [userCoords, setUserCoords] = useState(null);
  const [centres, setCentres] = useState([]);
  const [fallbackLocators, setFallbackLocators] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);

  // Sync initial service
  useEffect(() => {
    if (initialService && (initialService === 'pan_card' || initialService === 'ayushman_bharat')) {
      setSelectedService(initialService);
    }
  }, [initialService]);

  // Initial load with default centres
  useEffect(() => {
    loadCentres({ service: selectedService, query: '', userLat: null, userLng: null });
  }, [selectedService]);

  const loadCentres = async ({ service, query, pincode, userLat, userLng }) => {
    setLoading(true);
    setError(null);
    try {
      const isPin = /^\d{1,6}$/.test((query || '').trim());
      const cleanPin = isPin ? query.trim() : pincode || '';
      const cleanQuery = isPin ? '' : query || '';

      const data = await fetchAuthorisedCentres({
        service,
        query: cleanQuery,
        pincode: cleanPin,
        lat: userLat,
        lng: userLng,
        radiusKm: 50
      });

      if (data && data.results) {
        setCentres(data.results);
        setFallbackLocators(data.fallbackLocators || []);
      } else {
        setCentres([]);
        setFallbackLocators(data?.fallbackLocators || []);
      }
    } catch (err) {
      console.error('Failed to load service centres:', err);
      setError('Unable to load centres right now. Please try searching with a PIN code or use the official locators below.');
    } finally {
      setLoading(false);
      setHasSearched(true);
    }
  };

  const handleManualSearch = (e) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) {
      loadCentres({ service: selectedService, query: '', userLat: userCoords?.lat, userLng: userCoords?.lng });
      return;
    }
    loadCentres({
      service: selectedService,
      query: searchQuery.trim(),
      userLat: userCoords?.lat,
      userLng: userCoords?.lng
    });
  };

  const handleUseLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser. Please enter your city or 6-digit PIN code manually.');
      return;
    }

    setLocationPermissionPrompt(true);
    setLocationDenied(false);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        setUserCoords(coords);
        setLocationPermissionPrompt(false);
        setLocationDenied(false);
        loadCentres({
          service: selectedService,
          query: searchQuery.trim(),
          userLat: coords.lat,
          userLng: coords.lng
        });
      },
      (err) => {
        console.warn('Geolocation denied/error:', err.code, err.message);
        setLocationPermissionPrompt(false);
        setLocationDenied(true);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const getServiceBadgeStyle = (type) => {
    switch (type) {
      case 'protean_tinfc':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'utiitssl_centre':
      case 'utiitsl_centre':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'csc_centre':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getServiceBadgeName = (type) => {
    switch (type) {
      case 'protean_tinfc':
        return 'Authorised Protean TIN-FC';
      case 'utiitssl_centre':
      case 'utiitsl_centre':
        return 'Authorised UTIITSL Branch';
      case 'csc_centre':
        return 'Authorised Digital Seva (CSC)';
      default:
        return 'Certified Government Assistance Centre';
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-4 sm:p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-orange-100 text-orange-700 flex items-center justify-center border border-orange-200">
            <MapPin className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-900 text-base sm:text-lg">
              {t.centreFinderTitle}
            </h3>
            <p className="text-xs text-slate-500">
              {t.centreFinderSubtitle}
            </p>
          </div>
        </div>

        {/* Service Type Selector Pills */}
        <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setSelectedService('pan_card')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              selectedService === 'pan_card'
                ? 'bg-white text-orange-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            PAN Centres
          </button>
          <button
            type="button"
            onClick={() => setSelectedService('ayushman_bharat')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              selectedService === 'ayushman_bharat'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Ayushman / CSCs
          </button>
        </div>
      </div>

      {/* Location Input Section */}
      <div className="space-y-3">
        {/* Permission Purpose Banner */}
        <div className="p-3 rounded-2xl bg-blue-50/80 border border-blue-100 text-blue-900 text-xs flex items-start gap-2.5">
          <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            {t.locationPurposeNotice}
          </p>
        </div>

        {/* Location Denial Warning */}
        {locationDenied && (
          <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <p className="flex-1">{t.locationDeniedAlert}</p>
          </div>
        )}

        {/* Location Buttons & Search Input */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <button
            type="button"
            onClick={handleUseLocation}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-slate-400 cursor-pointer flex-shrink-0"
          >
            <Navigation className="w-4 h-4 text-orange-400" />
            <span>{userCoords ? 'Update Location' : t.useMyLocation}</span>
          </button>

          <form onSubmit={handleManualSearch} className="flex-1 flex items-center gap-1.5">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.searchLocationPlaceholder}
                className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs sm:text-sm shadow-sm transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              <span className="hidden sm:inline">{t.searchBtn}</span>
            </button>
          </form>
        </div>

        {/* Active Location Indicator */}
        {userCoords && (
          <div className="flex items-center justify-between text-xs text-slate-500 px-1 font-mono">
            <span>📍 Distances computed relative to your device coordinates</span>
            <button
              type="button"
              onClick={() => {
                setUserCoords(null);
                loadCentres({ service: selectedService, query: searchQuery, userLat: null, userLng: null });
              }}
              className="text-orange-600 hover:underline text-[11px]"
            >
              Clear GPS Coordinates
            </button>
          </div>
        )}
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between pt-2 text-xs text-slate-500">
        <span className="font-semibold text-slate-700">
          {centres.length} {t.centresFoundCount}
        </span>
        {searchQuery && (
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              loadCentres({ service: selectedService, query: '', userLat: userCoords?.lat, userLng: userCoords?.lng });
            }}
            className="text-slate-400 hover:text-slate-600"
          >
            {t.clearSearch}
          </button>
        )}
      </div>

      {/* Error state */}
      {error && (
        <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-900 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* Results Cards List */}
      {centres.length > 0 ? (
        <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
          {centres.map((centre) => (
            <div
              key={centre.id}
              className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-orange-300 hover:shadow-sm transition-all space-y-2.5"
            >
              {/* Card Header: Type Badge & Proximity */}
              <div className="flex flex-wrap items-center justify-between gap-1.5">
                <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md border ${getServiceBadgeStyle(centre.centreType)}`}>
                  {getServiceBadgeName(centre.centreType)}
                </span>
                {centre.distanceFormatted && (
                  <span className="text-xs font-bold text-orange-600 font-mono bg-orange-50 px-2 py-0.5 rounded-md border border-orange-200">
                    📍 {centre.distanceFormatted}
                  </span>
                )}
              </div>

              {/* Centre Name & Address */}
              <div>
                <h4 className="font-bold text-slate-900 text-xs sm:text-sm leading-snug">
                  {centre.name}
                </h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  {centre.address}
                </p>
                <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-500 font-medium">
                  <span>{centre.city}, {centre.state}</span>
                  <span className="font-mono bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200 text-[10px]">
                    PIN: {centre.pincode}
                  </span>
                </div>
              </div>

              {/* Verified Contact Details (Only when verified) */}
              {centre.verifiedContact && (
                <div className="pt-2 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px] text-slate-600">
                  {centre.verifiedContact.phone && (
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span className="font-mono">{centre.verifiedContact.phone}</span>
                    </div>
                  )}
                  {centre.verifiedContact.workingHours && (
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span>{centre.verifiedContact.workingHours}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons: Get Directions on Google Maps */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Curated Sample Dataset (not a comprehensive certified directory)
                </span>

                <a
                  href={centre.directionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-xs transition-all group cursor-pointer focus:outline-none focus:ring-2 focus:ring-orange-400"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{t.getDirections}</span>
                  <ExternalLink className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </a>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Empty State / Safe Fallback to Official Locators */
        hasSearched && !loading && (
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="text-center space-y-1">
              <Building className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="text-xs sm:text-sm font-bold text-slate-800">
                {t.noCentresInArea}
              </p>
              <p className="text-[11px] text-slate-500">
                {t.officialLocatorsNote}
              </p>
            </div>

            {/* Official Locator Cards */}
            <div className="space-y-2 mt-2">
              {fallbackLocators.map((loc, idx) => (
                <div key={idx} className="p-3 bg-white rounded-xl border border-slate-200 space-y-1 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded border border-orange-200">
                      {loc.provider}
                    </span>
                    <a
                      href={loc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-bold text-orange-600 hover:text-orange-700"
                    >
                      <span>Open Locator</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <h5 className="font-bold text-xs text-slate-900">{loc.portalName}</h5>
                  <p className="text-[11px] text-slate-500">{loc.description}</p>
                </div>
              ))}
            </div>
          </div>
        )
      )}

      
      
    </div>
  );
}
