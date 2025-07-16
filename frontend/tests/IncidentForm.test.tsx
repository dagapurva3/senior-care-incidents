import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import IncidentForm from '../src/components/IncidentForm';
jest.mock('../src/lib/firebase', () => require('../__mocks__/firebase'));
jest.mock('../src/lib/api', () => ({
  createIncident: jest.fn().mockResolvedValue({}),
}));

const originalFetch = global.fetch;

describe('IncidentForm', () => {
  beforeEach(() => {
    global.fetch = originalFetch;
  });
  afterAll(() => {
    global.fetch = originalFetch;
  });

  it('renders all incident type buttons', () => {
    render(<IncidentForm onIncidentCreated={jest.fn()} />);
    expect(screen.getByText('Fall')).toBeInTheDocument();
    expect(screen.getByText('Behaviour')).toBeInTheDocument();
    expect(screen.getByText('Medication')).toBeInTheDocument();
    expect(screen.getByText('Other')).toBeInTheDocument();
  });

  it('disables submit if required fields are missing', () => {
    render(<IncidentForm onIncidentCreated={jest.fn()} />);
    const submit = screen.getByRole('button', { name: /Report Incident/i });
    expect(submit).toBeDisabled();
  });

  it('submits a valid incident and calls onIncidentCreated', async () => {
    const onIncidentCreated = jest.fn();
    render(<IncidentForm onIncidentCreated={onIncidentCreated} />);
    fireEvent.click(screen.getByText('Fall'));
    fireEvent.change(screen.getByLabelText(/Incident Description/i), { target: { value: 'A valid description for testing' } });
    fireEvent.click(screen.getByRole('button', { name: /Report Incident/i }));
    await waitFor(() => {
      expect(onIncidentCreated).toHaveBeenCalled();
    });
  });

  it('shows error if API call fails', async () => {
    const onIncidentCreated = jest.fn();
    // Mock createIncident to reject
    const api = require('../src/lib/api');
    api.createIncident.mockRejectedValueOnce(new Error('API error'));
    render(<IncidentForm onIncidentCreated={onIncidentCreated} />);
    fireEvent.click(screen.getByText('Fall'));
    fireEvent.change(screen.getByLabelText(/Incident Description/i), { target: { value: 'A valid description for testing' } });
    fireEvent.click(screen.getByRole('button', { name: /Report Incident/i }));
    await waitFor(() => {
      expect(screen.getByText(/API error/i)).toBeInTheDocument();
    });
  });

  it('resets form after successful submit', async () => {
    const onIncidentCreated = jest.fn();
    const api = require('../src/lib/api');
    api.createIncident.mockResolvedValueOnce({});
    render(<IncidentForm onIncidentCreated={onIncidentCreated} />);
    fireEvent.click(screen.getByText('Fall'));
    fireEvent.change(screen.getByLabelText(/Incident Description/i), { target: { value: 'A valid description for testing' } });
    fireEvent.click(screen.getByRole('button', { name: /Report Incident/i }));
    await waitFor(() => {
      expect(onIncidentCreated).toHaveBeenCalled();
    });
    await waitFor(() => {
      expect(screen.getByLabelText(/Incident Description/i)).toHaveValue('');
    });
  });

  it('shows validation error if description is too short', async () => {
    render(<IncidentForm onIncidentCreated={jest.fn()} />);
    fireEvent.click(screen.getByText('Fall'));
    fireEvent.change(screen.getByLabelText(/Incident Description/i), { target: { value: 'Short' } });
    fireEvent.blur(screen.getByLabelText(/Incident Description/i));
    await waitFor(() => {
      expect(screen.getByText(/Minimum 10 characters/i)).toBeInTheDocument();
    });
  });

  it('shows success message after submit', async () => {
    const onIncidentCreated = jest.fn();
    const api = require('../src/lib/api');
    api.createIncident.mockResolvedValueOnce({});
    render(<IncidentForm onIncidentCreated={onIncidentCreated} />);
    fireEvent.click(screen.getByText('Fall'));
    fireEvent.change(screen.getByLabelText(/Incident Description/i), { target: { value: 'A valid description for testing' } });
    fireEvent.click(screen.getByRole('button', { name: /Report Incident/i }));
    await waitFor(() => {
      expect(screen.getByText(/Incident reported successfully/i)).toBeInTheDocument();
    });
  });

  it('shows loading state on submit', async () => {
    const onIncidentCreated = jest.fn();
    render(<IncidentForm onIncidentCreated={onIncidentCreated} />);
    fireEvent.click(screen.getByText('Fall'));
    fireEvent.change(screen.getByLabelText(/Incident Description/i), { target: { value: 'A valid description for testing' } });
    fireEvent.click(screen.getByRole('button', { name: /Report Incident/i }));
    await waitFor(() => {
      expect(screen.getByText(/Submitting/i)).toBeInTheDocument();
    });
  });

  it('shows error for invalid type', async () => {
    render(<IncidentForm onIncidentCreated={jest.fn()} />);
    fireEvent.change(screen.getByLabelText(/Incident Description/i), { target: { value: 'A valid description for testing' } });
    fireEvent.click(screen.getByRole('button', { name: /Report Incident/i }));
    await waitFor(() => {
      expect(screen.getByText(/Type must be one of/i)).toBeInTheDocument();
    });
  });

  it('shows error for short description', async () => {
    render(<IncidentForm onIncidentCreated={jest.fn()} />);
    fireEvent.click(screen.getByText('Fall'));
    fireEvent.change(screen.getByLabelText(/Incident Description/i), { target: { value: 'short' } });
    fireEvent.click(screen.getByRole('button', { name: /Report Incident/i }));
    await waitFor(() => {
      expect(screen.getByText(/at least 10 characters/i)).toBeInTheDocument();
    });
  });
});