import { render, screen, fireEvent } from '@testing-library/react';
import Login from '../components/Login';

describe('Login', () => {
  it('renders login form', () => {
    render(<Login onLogin={jest.fn()} />);
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sign In/i })).toBeInTheDocument();
  });

  it('calls onLogin with email and password', () => {
    const onLogin = jest.fn();
    render(<Login onLogin={onLogin} />);
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /Sign In/i }));
    expect(onLogin).toHaveBeenCalledWith('test@example.com', 'password123');
  });
}); 