import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  MapPin,
  Camera,
  Upload,
  AlertTriangle,
  CheckCircle2,
  Navigation,
  ArrowRight,
  RotateCcw,
  ShieldCheck,
  X
} from 'lucide-react';
import { createReport, checkDuplicates, confirmReport } from '../api/reports.js';
import FormField from '../components/FormField.jsx';
import InteractiveMap from '../components/InteractiveMap.jsx';
import DuplicateAlertModal from '../components/DuplicateAlertModal.jsx';
import { CATEGORIES } from '../utils/categoryLabels.js';
import { BAHIR_DAR_NEIGHBORHOODS, BAHIR_DAR_CENTER } from '../utils/neighborhoods.js';
import { useLanguage } from '../context/LanguageContext.jsx';

export default function CreateReport() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [formData, setFormData] = useState({
    title: '',
    category: '',
    description: '',
    neighborhood: '',
    landmark: '',
    latitude: null,
    longitude: null,
    photoUrl: ''
  });

  const [clientErrors, setClientErrors] = useState({});
  const [serverError, setServerError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [duplicateCheckMatches, setDuplicateCheckMatches] = useState([]);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [submittedReport, setSubmittedReport] = useState(null);
  const [isLocating, setIsLocating] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);

  // Client validation
  const validate = () => {
    const errors = {};
    if (!formData.title.trim()) {
      errors.title = 'Please enter a descriptive problem title.';
    } else if (formData.title.trim().length < 5) {
      errors.title = 'Title must be at least 5 characters long.';
    } else if (formData.title.trim().length > 120) {
      errors.title = 'Title must be 120 characters or fewer.';
    }

    if (!formData.category) {
      errors.category = 'Please choose the type of infrastructure issue.';
    }

    if (!formData.description.trim()) {
      errors.description = 'Please describe the problem and its impact.';
    } else if (formData.description.trim().length < 15) {
      errors.description = 'Description should be at least 15 characters to assist repair crews.';
    }

    if (!formData.neighborhood) {
      errors.neighborhood = 'Please select the neighborhood or Kebele.';
    }

    if (!formData.landmark.trim()) {
      errors.landmark = 'Please provide a nearby landmark (e.g. near hotel, school, roundabout).';
    } else if (formData.landmark.trim().length < 3) {
      errors.landmark = 'Landmark description must be at least 3 characters.';
    }

    setClientErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle Input Changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (clientErrors[name]) {
      setClientErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  // Neighborhood change helper: also center map on that neighborhood
  const handleNeighborhoodChange = (e) => {
    const chosenName = e.target.value;
    const found = BAHIR_DAR_NEIGHBORHOODS.find(n => n.name === chosenName);
    setFormData(prev => ({
      ...prev,
      neighborhood: chosenName,
      latitude: found ? found.lat : prev.latitude,
      longitude: found ? found.lng : prev.longitude
    }));

    if (clientErrors.neighborhood) {
      setClientErrors(prev => ({ ...prev, neighborhood: null }));
    }
  };

  // Handle Photo selection
  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size exceeds 5MB limit. Please select a smaller photo.');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
        setFormData(prev => ({ ...prev, photoUrl: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    setPhotoPreview(null);
    setFormData(prev => ({ ...prev, photoUrl: '' }));
  };

  // Use browser geolocation
  const handleUseGeolocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsLocating(false);
        const lat = parseFloat(position.coords.latitude.toFixed(5));
        const lng = parseFloat(position.coords.longitude.toFixed(5));
        setFormData(prev => ({ ...prev, latitude: lat, longitude: lng }));
      },
      (error) => {
        setIsLocating(false);
        console.warn('Geolocation error:', error);
        alert('Could not determine exact location. Please click on the map or enter landmark details.');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Map click coordinate selection
  const handleMapCoordinateSelect = ({ lat, lng }) => {
    setFormData(prev => ({ ...prev, latitude: lat, longitude: lng }));
  };

  // Initial Form Submit: Check for duplicates first!
  const handleSubmitInitial = async (e) => {
    e.preventDefault();
    setServerError(null);

    if (!validate()) {
      window.scrollTo({ top: 120, behavior: 'smooth' });
      return;
    }

    try {
      setSubmitting(true);
      // Duplicate check step
      const duplicateRes = await checkDuplicates({
        title: formData.title,
        category: formData.category,
        neighborhood: formData.neighborhood,
        description: formData.description
      });

      if (duplicateRes.duplicates && duplicateRes.duplicates.length > 0) {
        setDuplicateCheckMatches(duplicateRes.duplicates);
        setShowDuplicateModal(true);
        setSubmitting(false);
        return;
      }

      // No duplicates found, execute creation
      await executeReportCreation();
    } catch (err) {
      console.error('Submission error:', err);
      setServerError(err.message || 'An unexpected error occurred during submission.');
      setSubmitting(false);
    }
  };

  // Final creation execution
  const executeReportCreation = async () => {
    try {
      setSubmitting(true);
      const res = await createReport(formData);
      setShowDuplicateModal(false);
      setSubmittedReport(res.report);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('Creation failed:', err);
      if (err.status === 400 && err.details) {
        setClientErrors(err.details);
      } else {
        setServerError(err.message || 'Server was unable to save the report.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Confirming an existing report from the duplicate modal
  const handleConfirmExistingDuplicate = async (existingId) => {
    try {
      setSubmitting(true);
      await confirmReport(existingId);
      navigate(`/reports/${existingId}`);
    } catch (err) {
      alert(err.message || 'Unable to confirm existing report.');
      setSubmitting(false);
    }
  };

  // If successfully submitted, show clear success state
  if (submittedReport) {
    return (
      <div className="max-w-2xl mx-auto py-10 px-4">
        <div className="bg-white rounded-2xl border border-emerald-200 p-8 shadow-lg text-center space-y-5">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-slate-900">
              Problem Report Successfully Submitted!
            </h2>
            <p className="text-sm text-slate-600 max-w-md mx-auto">
              Your report has been assigned reference ID{' '}
              <strong className="font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                #{submittedReport.id}
              </strong>{' '}
              and queued for municipal inspection in {submittedReport.neighborhood}.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-left text-xs text-slate-600 space-y-1.5">
            <div className="flex justify-between">
              <span className="font-medium text-slate-500">Title:</span>
              <span className="font-semibold text-slate-800">{submittedReport.title}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-slate-500">Status:</span>
              <span className="capitalize font-semibold text-sky-700">{submittedReport.status}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-slate-500">Neighborhood:</span>
              <span className="font-semibold text-slate-800">{submittedReport.neighborhood}</span>
            </div>
          </div>

          <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to={`/reports/${submittedReport.id}`}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold shadow-md transition-colors"
            >
              <span>Track Resolution Status</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <button
              type="button"
              onClick={() => {
                setSubmittedReport(null);
                setFormData({
                  title: '',
                  category: '',
                  description: '',
                  neighborhood: '',
                  landmark: '',
                  latitude: null,
                  longitude: null,
                  photoUrl: ''
                });
                setPhotoPreview(null);
              }}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Report Another Issue</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto pb-16">
      {/* Duplicate Check Warning Dialog */}
      {showDuplicateModal && (
        <DuplicateAlertModal
          duplicates={duplicateCheckMatches}
          onConfirmExisting={handleConfirmExistingDuplicate}
          onProceedAnyway={executeReportCreation}
          onCancel={() => setShowDuplicateModal(false)}
          isConfirming={submitting}
        />
      )}

      {/* Header */}
      <div className="mb-6 space-y-1">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Report a Neighborhood Problem
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Provide clear details to help Bahir Dar municipal services and utility teams dispatch the appropriate repair crews.
        </p>
      </div>

      {serverError && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <strong className="font-semibold block mb-0.5">Submission Error</strong>
            <span>{serverError}</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmitInitial} className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
        
        {/* 1. Problem Category Picker */}
        <div>
          <label className="block text-sm font-semibold text-slate-900 mb-2">
            1. Select Problem Category <span className="text-rose-500">*</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {Object.entries(CATEGORIES).map(([key, cat]) => {
              const isSelected = formData.category === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    setFormData(prev => ({ ...prev, category: key }));
                    if (clientErrors.category) {
                      setClientErrors(prev => ({ ...prev, category: null }));
                    }
                  }}
                  className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/20 shadow-2xs'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-xs font-bold ${isSelected ? 'text-emerald-900' : 'text-slate-800'}`}>
                      {cat.shortLabel || cat.label}
                    </span>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                  </div>
                  <span className="text-[10px] text-slate-500 line-clamp-1">{cat.amharicLabel}</span>
                </button>
              );
            })}
          </div>
          {clientErrors.category && (
            <p className="text-xs text-rose-600 font-medium mt-1.5">{clientErrors.category}</p>
          )}
        </div>

        {/* 2. Problem Title */}
        <FormField
          id="title"
          label="2. Problem Title"
          required
          error={clientErrors.title}
          helpText="Briefly summarize the issue (e.g. 'Burst water pipe flooding sidewalk', 'Deep pothole')"
        >
          <input
            id="title"
            name="title"
            type="text"
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g. Streetlight out for 3 days near student crossing"
            className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
          />
        </FormField>

        {/* 3. Detailed Description */}
        <FormField
          id="description"
          label="3. Detailed Description"
          required
          error={clientErrors.description}
          helpText="Provide specific details regarding the severity, hazard to vehicles/pedestrians, or time since it started."
        >
          <textarea
            id="description"
            name="description"
            rows={3}
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe the exact location, extent of damage, water runoff, safety hazard..."
            className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
          />
        </FormField>

        {/* 4. Neighborhood & Landmark */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            id="neighborhood"
            label="4. Neighborhood / Kebele"
            required
            error={clientErrors.neighborhood}
            helpText="Select the Bahir Dar sub-city or Kebele"
          >
            <select
              id="neighborhood"
              name="neighborhood"
              value={formData.neighborhood}
              onChange={handleNeighborhoodChange}
              className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">Select Kebele / Neighborhood...</option>
              {BAHIR_DAR_NEIGHBORHOODS.map(n => (
                <option key={n.name} value={n.name}>{n.name}</option>
              ))}
            </select>
          </FormField>

          <FormField
            id="landmark"
            label="5. Nearby Landmark or Building"
            required
            error={clientErrors.landmark}
            helpText="Reference point (e.g. 'In front of Poly Main Gate')"
          >
            <input
              id="landmark"
              name="landmark"
              type="text"
              value={formData.landmark}
              onChange={handleChange}
              placeholder="e.g. 50 meters south of Tana Hotel"
              className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
          </FormField>
        </div>

        {/* 5. Geographic Location Picker & Map */}
        <div className="space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <label className="block text-sm font-semibold text-slate-900">
                6. Geographic Coordinates (Optional Map Selection)
              </label>
              <p className="text-xs text-slate-500">
                Click directly on the map to pin precise GPS location for maintenance dispatchers.
              </p>
            </div>

            <button
              type="button"
              onClick={handleUseGeolocation}
              disabled={isLocating}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors self-start sm:self-auto border border-slate-200"
            >
              <Navigation className="w-3.5 h-3.5 text-emerald-600" />
              <span>{isLocating ? 'Detecting GPS...' : 'Use My Device GPS'}</span>
            </button>
          </div>

          <div className="rounded-xl overflow-hidden border border-slate-200">
            <InteractiveMap
              pickerMode={true}
              selectedCoords={
                formData.latitude && formData.longitude
                  ? { lat: formData.latitude, lng: formData.longitude }
                  : null
              }
              onSelectCoords={handleMapCoordinateSelect}
              height="h-64"
            />
          </div>

          {formData.latitude && formData.longitude ? (
            <div className="flex items-center justify-between text-xs px-3 py-2 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                <span>Selected Coordinates: <strong>{formData.latitude}, {formData.longitude}</strong></span>
              </span>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, latitude: null, longitude: null }))}
                className="text-emerald-700 hover:text-emerald-900 underline font-medium"
              >
                Clear GPS
              </button>
            </div>
          ) : (
            <p className="text-[11px] text-slate-400 italic">
              No coordinates selected. Municipal crews will rely on neighborhood and landmark description.
            </p>
          )}
        </div>

        {/* 6. Photo Evidence Upload */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-900">
            7. Photographic Evidence (Optional)
          </label>
          <p className="text-xs text-slate-500">
            Clear photos help inspectors evaluate repair priority and required tools.
          </p>

          {photoPreview ? (
            <div className="relative inline-block border border-slate-200 rounded-xl overflow-hidden shadow-xs">
              <img
                src={photoPreview}
                alt="Selected problem preview"
                className="w-full max-w-sm h-48 object-cover"
              />
              <button
                type="button"
                onClick={removePhoto}
                className="absolute top-2 right-2 p-1.5 bg-slate-900/80 hover:bg-slate-900 text-white rounded-full shadow transition-colors"
                title="Remove photo"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-300 rounded-xl hover:border-emerald-500 hover:bg-emerald-50/20 cursor-pointer transition-colors group">
              <Camera className="w-8 h-8 text-slate-400 group-hover:text-emerald-600 mb-2 transition-colors" />
              <span className="text-xs font-semibold text-slate-700">Click to upload photo or take picture</span>
              <span className="text-[11px] text-slate-400 mt-0.5">PNG, JPG, WEBP up to 5MB</span>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </label>
          )}
        </div>

        {/* Submission Notice & Action */}
        <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-500">
            Reports will be checked for nearby duplicates before being logged to the municipal register.
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Link
              to="/reports"
              className="w-full sm:w-auto text-center px-4 py-2.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={submitting}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold shadow-md shadow-emerald-950/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {submitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Checking & Submitting...</span>
                </>
              ) : (
                <>
                  <span>Submit Problem Report</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
