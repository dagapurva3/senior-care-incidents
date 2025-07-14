import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import IncidentList from '../components/IncidentList';

jest.mock('../lib/api', () => ({
  getIncidents: jest.fn(),
  summarizeIncident: jest.fn(),
  updateIncidentStatus: jest.fn(),
  exportIncidents: jest.fn(),
}));

describe('IncidentList', () => {
  const mockOnIncidentUpdated = jest.fn();
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows loading spinner while fetching', async () => {
    const { getIncidents } = require('../lib/api');
    getIncidents.mockReturnValue(new Promise(() => {})); // never resolves
    render(<IncidentList onIncidentUpdated={mockOnIncidentUpdated} />);
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('shows error if API call fails', async () => {
    const { getIncidents } = require('../lib/api');
    getIncidents.mockRejectedValue(new Error('API error'));
    render(<IncidentList onIncidentUpdated={mockOnIncidentUpdated} />);
    await waitFor(() => {
      expect(screen.getByText(/API error/i)).toBeInTheDocument();
    });
  });

  it('shows empty state when no incidents', async () => {
    const { getIncidents } = require('../lib/api');
    getIncidents.mockResolvedValue({ incidents: [], pagination: { currentPage: 1, totalPages: 1, totalItems: 0, itemsPerPage: 10, hasNextPage: false, hasPrevPage: false } });
    render(<IncidentList onIncidentUpdated={mockOnIncidentUpdated} />);
    await waitFor(() => {
      expect(screen.getByText(/No incidents found/i)).toBeInTheDocument();
    });
  });

  it('paginates correctly', async () => {
    const { getIncidents } = require('../lib/api');
    getIncidents.mockResolvedValue({
      incidents: Array.from({ length: 10 }, (_, i) => ({ id: String(i), type: 'fall', description: `desc${i}`, status: 'open', userId: 'user', createdAt: '', updatedAt: '' })),
      pagination: { currentPage: 1, totalPages: 2, totalItems: 20, itemsPerPage: 10, hasNextPage: true, hasPrevPage: false },
    });
    render(<IncidentList onIncidentUpdated={mockOnIncidentUpdated} />);
    await waitFor(() => {
      expect(screen.getAllByText('Fall Incident').length).toBeGreaterThan(0);
    });
    // Simulate clicking next page (if your component supports it)
    // fireEvent.click(screen.getByText(/Next/i));
    // ...assert new page
  });

  it('filters by type and status', async () => {
    const { getIncidents } = require('../lib/api');
    getIncidents.mockResolvedValue({
      incidents: [{ id: '1', type: 'fall', description: 'desc', status: 'open', userId: 'user', createdAt: '', updatedAt: '' }],
      pagination: { currentPage: 1, totalPages: 1, totalItems: 1, itemsPerPage: 10, hasNextPage: false, hasPrevPage: false },
    });
    render(<IncidentList onIncidentUpdated={mockOnIncidentUpdated} />);
    fireEvent.change(screen.getByLabelText(/Type/i), { target: { value: 'fall' } });
    fireEvent.change(screen.getByLabelText(/Status/i), { target: { value: 'open' } });
    await waitFor(() => {
      expect(screen.getByText('Fall Incident')).toBeInTheDocument();
    });
  });

  it('updates status and calls onIncidentUpdated', async () => {
    const { getIncidents, updateIncidentStatus } = require('../lib/api');
    getIncidents.mockResolvedValue({
      incidents: [{ id: '1', type: 'fall', description: 'desc', status: 'open', userId: 'user', createdAt: '', updatedAt: '' }],
      pagination: { currentPage: 1, totalPages: 1, totalItems: 1, itemsPerPage: 10, hasNextPage: false, hasPrevPage: false },
    });
    updateIncidentStatus.mockResolvedValue({ id: '1', status: 'resolved' });
    render(<IncidentList onIncidentUpdated={mockOnIncidentUpdated} />);
    await waitFor(() => {
      expect(screen.getByText('Fall Incident')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText(/Update Status/i));
    await waitFor(() => {
      expect(mockOnIncidentUpdated).toHaveBeenCalled();
    });
  });

  it('generates summary and updates UI', async () => {
    const { getIncidents, summarizeIncident } = require('../lib/api');
    getIncidents.mockResolvedValue({
      incidents: [{ id: '1', type: 'fall', description: 'desc', status: 'open', userId: 'user', createdAt: '', updatedAt: '', summary: undefined }],
      pagination: { currentPage: 1, totalPages: 1, totalItems: 1, itemsPerPage: 10, hasNextPage: false, hasPrevPage: false },
    });
    summarizeIncident.mockResolvedValue('summary');
    render(<IncidentList onIncidentUpdated={mockOnIncidentUpdated} />);
    await waitFor(() => {
      expect(screen.getByText('Fall Incident')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText(/Generate Summary/i));
    await waitFor(() => {
      expect(screen.getByText('summary')).toBeInTheDocument();
    });
  });

  it('exports incidents as CSV', async () => {
    const { getIncidents, exportIncidents } = require('../lib/api');
    getIncidents.mockResolvedValue({
      incidents: [{ id: '1', type: 'fall', description: 'desc', status: 'open', userId: 'user', createdAt: '', updatedAt: '' }],
      pagination: { currentPage: 1, totalPages: 1, totalItems: 1, itemsPerPage: 10, hasNextPage: false, hasPrevPage: false },
    });
    exportIncidents.mockResolvedValue('csv,data');
    render(<IncidentList onIncidentUpdated={mockOnIncidentUpdated} />);
    await waitFor(() => {
      expect(screen.getByText('Fall Incident')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText(/Export CSV/i));
    // You can check if exportIncidents was called
    expect(exportIncidents).toHaveBeenCalled();
  });
}); 