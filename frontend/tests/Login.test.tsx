import { render, screen, fireEvent } from '@testing-library/react';
import Login from '../src/components/Login';

jest.mock('../src/lib/firebase', () => require('../__mocks__/firebase'));

describe('Login', () => {
  it('renders login form', () => {
    render(<Login onLogin={jest.fn()} />);
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    const signInButton = screen.getAllByRole('button', { name: /Sign In/i }).find(
      (btn) => btn.getAttribute('type') === 'submit'
    );
    expect(signInButton).toBeInTheDocument();
    expect(signInButton).toHaveAttribute('type', 'submit');
  });

  it('calls onLogin with email and password', () => {
    const onLogin = jest.fn();
    render(<Login onLogin={onLogin} />);
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'password123' } });
    const signInButton = screen.getAllByRole('button', { name: /Sign In/i }).find(
      (btn) => btn.getAttribute('type') === 'submit'
    );
    fireEvent.click(signInButton!);
    expect(onLogin).toHaveBeenCalledWith('test@example.com', 'password123');
  });

  it('shows error on invalid credentials', () => {
    render(<Login onLogin={jest.fn()} />);
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'bad' } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: '' } });
    const signInButton = screen.getAllByRole('button', { name: /Sign In/i }).find(
      (btn) => btn.getAttribute('type') === 'submit'
    );
    fireEvent.click(signInButton!);
    expect(screen.getByText(/Invalid email or password/i)).toBeInTheDocument();
  });

  it('shows error if email or password is missing', () => {
    render(<Login onLogin={jest.fn()} />);
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: '' } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: '' } });
    const signInButton = screen.getAllByRole('button', { name: /Sign In/i }).find(
      (btn) => btn.getAttribute('type') === 'submit'
    );
    fireEvent.click(signInButton!);
    expect(screen.getByText(/required/i)).toBeInTheDocument();
  });

  it('shows loading state on submit', () => {
    render(<Login onLogin={jest.fn()} />);
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'password123' } });
    const signInButton = screen.getAllByRole('button', { name: /Sign In/i }).find(
      (btn) => btn.getAttribute('type') === 'submit'
    );
    fireEvent.click(signInButton!);
    expect(screen.getByText(/Signing In/i)).toBeInTheDocument();
  });
});