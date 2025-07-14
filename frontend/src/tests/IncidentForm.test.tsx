import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import IncidentForm from '../components/IncidentForm';

describe('IncidentForm', () => {
  it('renders all incident type buttons', () => {
    render(<IncidentForm onIncidentCreated={jest.fn()} />);
    expect(screen.getByText('Fall')).toBeInTheDocument();
    expect(screen.getByText('Behaviour')).toBeInTheDocument();
    expect(screen.getByText('Medication')).toBeInTheDocument();
    expect(screen.getByText('Other')).toBeInTheDocument();
  });

  it('shows validation error if description is too short', () => {
    render(<IncidentForm onIncidentCreated={jest.fn()} />);
    fireEvent.click(screen.getByText('Fall'));
    fireEvent.change(screen.getByLabelText(/Incident Description/i), { target: { value: 'Short' } });
    fireEvent.blur(screen.getByLabelText(/Incident Description/i));
    expect(screen.getByText(/at least 10 characters/i)).toBeInTheDocument();
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
    // Mock fetch to reject
    global.fetch = jest.fn().mockRejectedValue(new Error('API error'));
    render(<IncidentForm onIncidentCreated={onIncidentCreated} />);
    fireEvent.click(screen.getByText('Fall'));
    fireEvent.change(screen.getByLabelText(/Incident Description/i), { target: { value: 'A valid description for testing' } });
    fireEvent.click(screen.getByRole('button', { name: /Report Incident/i }));
    await waitFor(() => {
      expect(screen.getByText(/Failed to create incident/i)).toBeInTheDocument();
    });
  });

  it('resets form after successful submit', async () => {
    const onIncidentCreated = jest.fn();
    render(<IncidentForm onIncidentCreated={onIncidentCreated} />);
    fireEvent.click(screen.getByText('Fall'));
    fireEvent.change(screen.getByLabelText(/Incident Description/i), { target: { value: 'A valid description for testing' } });
    fireEvent.click(screen.getByRole('button', { name: /Report Incident/i }));
    await waitFor(() => {
      expect(onIncidentCreated).toHaveBeenCalled();
    });
    expect(screen.getByLabelText(/Incident Description/i)).toHaveValue('');
  });
}); 