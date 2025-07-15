import { useState } from 'react';
import { createIncident } from '../lib/api';
import { validateIncidentForm } from '../utils/incidentValidation';

export function useIncidentForm(onIncidentCreated: () => void) {
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

    const validationError = validateIncidentForm({ type, description });
    if (validationError) {
      setError(validationError);
      setLoading(false);
      return;
    }

    try {
      await createIncident({ type, description });
      setType('');
      setDescription('');
      setSuccess(true);
      onIncidentCreated();
      setTimeout(() => setSuccess(false), 3000);
    } catch (error: any) {
      setError(error.message || 'Failed to create incident');
    } finally {
      setLoading(false);
    }
  };

  return {
    type,
    setType,
    description,
    setDescription,
    loading,
    error,
    success,
    incidentTypes,
    handleSubmit,
  };
} 