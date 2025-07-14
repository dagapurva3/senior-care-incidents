import { render, screen, fireEvent } from '@testing-library/react';
import IncidentForm from '../components/IncidentForm';

describe('IncidentForm', () => {
  it('renders all incident type buttons', () => {
    render(<IncidentForm onIncidentCreated={jest.fn()} />);
    expect(screen.getByText('Fall')).toBeInTheDocument();
    expect(screen.getByText('Behaviour')).toBeInTheDocument();
    expect(screen.getByText('Medication')).toBeInTheDocument();
    expect(screen.getByText('Other')).toBeInTheDocument();
  });

  it('allows selecting an incident type', () => {
    render(<IncidentForm onIncidentCreated={jest.fn()} />);
    const fallButton = screen.getByText('Fall').closest('button');
    fireEvent.click(fallButton!);
    // After click, the button should have a selected style (border-blue-500)
    expect(fallButton).toHaveClass('border-blue-500');
  });

  it('disables submit if description is too short', () => {
    render(<IncidentForm onIncidentCreated={jest.fn()} />);
    const fallButton = screen.getByText('Fall').closest('button');
    fireEvent.click(fallButton!);
    const textarea = screen.getByLabelText(/Incident Description/i);
    fireEvent.change(textarea, { target: { value: 'Short' } });
    const submit = screen.getByRole('button', { name: /Report Incident/i });
    expect(submit).toBeDisabled();
  });
}); 