import { useState, useEffect } from 'react';
import { summarizeIncident, updateIncidentStatus, exportIncidents, getIncidents, GetIncidentsParams, IncidentsResponse } from '../lib/api';
import { Incident } from '../types';

export function useIncidentList(onIncidentUpdated: () => void) {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [pagination, setPagination] = useState<IncidentsResponse['pagination'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [summarizing, setSummarizing] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [exporting, setExporting] = useState(false);

  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const incidentTypes = [
    { value: '', label: 'All Types' },
    { value: 'fall', label: 'Fall' },
    { value: 'behaviour', label: 'Behaviour' },
    { value: 'medication', label: 'Medication' },
    { value: 'other', label: 'Other' },
  ];

  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'open', label: 'Open' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'resolved', label: 'Resolved' },
    { value: 'closed', label: 'Closed' },
  ];

  const sortOptions = [
    { value: 'createdAt', label: 'Date Created' },
    { value: 'updatedAt', label: 'Date Updated' },
    { value: 'type', label: 'Type' },
    { value: 'status', label: 'Status' },
  ];

  const getIncidentTypeIcon = (type: string) => {
    const icons: { [key: string]: string } = {
      fall: '⚠️',
      behaviour: '😔',
      medication: '💊',
      other: '📝',
    };
    return icons[type] || icons.other;
  };

  const getIncidentTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      fall: 'Fall',
      behaviour: 'Behaviour',
      medication: 'Medication',
      other: 'Other',
    };
    return labels[type] || 'Other';
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      open: 'bg-yellow-100 text-yellow-800',
      in_progress: 'bg-blue-100 text-blue-800',
      resolved: 'bg-green-100 text-green-800',
      closed: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || colors.open;
  };

  const getStatusLabel = (status: string) => {
    const labels: { [key: string]: string } = {
      open: 'Open',
      in_progress: 'In Progress',
      resolved: 'Resolved',
      closed: 'Closed',
    };
    return labels[status] || 'Open';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const loadIncidents = async (page = 1) => {
    setLoading(true);
    setError('');
    try {
      const params: GetIncidentsParams = {
        page,
        limit: itemsPerPage,
        search: searchTerm,
        type: selectedType,
        status: selectedStatus,
        sortBy,
        sortOrder,
      };
      const response = await getIncidents(params);
      setIncidents(response.incidents);
      setPagination(response.pagination);
    } catch (error: any) {
      setError(error.message || 'Failed to load incidents');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIncidents(currentPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, selectedType, selectedStatus, sortBy, sortOrder, itemsPerPage]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleFilter = (type: string, value: string) => {
    if (type === 'type') setSelectedType(value);
    if (type === 'status') setSelectedStatus(value);
    setCurrentPage(1);
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setSortBy(field);
      setSortOrder('ASC');
    }
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    loadIncidents(page);
  };

  const handleSummarize = async (incidentId: string) => {
    setSummarizing(incidentId);
    setError('');
    try {
      await summarizeIncident(incidentId);
      loadIncidents(currentPage);
      onIncidentUpdated();
    } catch (error: any) {
      setError(error.message || 'Failed to generate summary');
    } finally {
      setSummarizing(null);
    }
  };

  const handleStatusUpdate = async (incidentId: string, newStatus: string) => {
    setUpdatingStatus(incidentId);
    setError('');
    try {
      await updateIncidentStatus(incidentId, newStatus);
      loadIncidents(currentPage);
      onIncidentUpdated();
    } catch (error: any) {
      setError(error.message || 'Failed to update status');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleExport = async (format: 'json' | 'csv') => {
    setExporting(true);
    setError('');
    try {
      const data = await exportIncidents(format);
      if (format === 'csv') {
        const blob = data as Blob;
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `incidents.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        const jsonData = data as Incident[];
        const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `incidents.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error: any) {
      setError(error.message || 'Failed to export incidents');
    } finally {
      setExporting(false);
    }
  };

  return {
    incidents,
    pagination,
    loading,
    summarizing,
    updatingStatus,
    error,
    exporting,
    searchTerm,
    setSearchTerm,
    selectedType,
    setSelectedType,
    selectedStatus,
    setSelectedStatus,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    incidentTypes,
    statusOptions,
    sortOptions,
    getIncidentTypeIcon,
    getIncidentTypeLabel,
    getStatusColor,
    getStatusLabel,
    formatDate,
    loadIncidents,
    handleSearch,
    handleFilter,
    handleSort,
    handlePageChange,
    handleSummarize,
    handleStatusUpdate,
    handleExport,
  };
} 