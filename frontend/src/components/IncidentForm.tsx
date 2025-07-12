'use client';

import { useState } from 'react';
import { createIncident } from '../lib/api';
import { Incident } from '../types';

interface IncidentFormProps {
  onIncidentCreated: () => void;
}

export default function IncidentForm({ onIncidentCreated }: IncidentFormProps) {
  const [type, setType] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const incidentTypes = [
    { value: 'fall', label: 'Fall', icon: '⚠️' },
    { value: 'behaviour', label: 'Behaviour', icon: '😔' },
    { value: 'medication', label: 'Medication', icon: '💊' },
    { value: 'other', label: 'Other', icon: '📝' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      await createIncident({ type, description });
      setType('');
      setDescription('');
      setSuccess(true);
      onIncidentCreated();
      
      // Reset success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (error: any) {
      setError(error.message || 'Failed to create incident');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Success Message */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <p className="text-sm text-green-800 font-medium">Incident reported successfully!</p>
          <p className="text-sm text-green-700">The incident has been logged and will be reviewed.</p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Incident Type Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Incident Type
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {incidentTypes.map((incidentType) => (
              <button
                key={incidentType.value}
                type="button"
                onClick={() => setType(incidentType.value)}
                className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                  type === incidentType.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className="text-center">
                  <div className="text-2xl mb-2">{incidentType.icon}</div>
                  <div className="text-sm font-medium text-gray-900">{incidentType.label}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Description Field */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Incident Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            placeholder="Please provide a detailed description of the incident, including what happened, when it occurred, and any relevant details..."
            required
          />
          <p className="mt-2 text-xs text-gray-500">
            Be as detailed as possible to help with proper care assessment and follow-up. Minimum 10 characters.
          </p>
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-between pt-4">
          <div className="text-sm text-gray-500">
            {type && description && description.length >= 10 && (
              <span className="flex items-center">
                <span className="text-green-500 mr-1">✓</span>
                Ready to submit
              </span>
            )}
          </div>
          <button
            type="submit"
            disabled={loading || !type || !description.trim() || description.length < 10}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Submitting...
              </>
            ) : (
              'Report Incident'
            )}
          </button>
        </div>
      </form>

      {/* Help Text */}
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
        <p className="text-sm text-blue-800 font-medium">Important Reminder</p>
        <p className="text-sm text-blue-700 mt-1">
          All incidents are automatically logged and will be reviewed by the care team. 
          For emergencies, please contact emergency services immediately.
        </p>
      </div>
    </div>
  );
}