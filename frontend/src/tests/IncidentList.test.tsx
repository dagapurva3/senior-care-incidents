import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import IncidentList from '../components/IncidentList';

// Mock the API functions
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

  it('should show user-friendly error message when summarization fails', async () => {
    const { getIncidents, summarizeIncident } = require('../lib/api');
    
    // Mock successful incidents load
    getIncidents.mockResolvedValue({
      incidents: [{
        id: '1',
        userId: 'user1',
        type: 'fall',
        description: 'Test incident',
        status: 'open',
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z',
      }],
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalItems: 1,
        itemsPerPage: 10,
        hasNextPage: false,
        hasPrevPage: false,
      },
    });

    // Mock summarization to fail with our specific error
    summarizeIncident.mockRejectedValue(new Error('There was an error in generating the summary'));

    render(<IncidentList onIncidentUpdated={mockOnIncidentUpdated} />);

    // Wait for incidents to load
    await waitFor(() => {
      expect(screen.getByText('Fall Incident')).toBeInTheDocument();
    });

    // Click the generate summary button
    const summarizeButton = screen.getByText('Generate Summary');
    fireEvent.click(summarizeButton);

    // Wait for the error message to appear
    await waitFor(() => {
      expect(screen.getByText('There was an error in generating the summary')).toBeInTheDocument();
    });
  });
}); 