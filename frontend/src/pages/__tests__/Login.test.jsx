import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import Login from '../Login';
import { AuthProvider } from '../../context/AuthContext';

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

// Mock useAuth
const mockLogin = vi.fn();
vi.mock('../../context/AuthContext', async () => {
    const actual = await vi.importActual('../../context/AuthContext');
    return {
        ...actual,
        useAuth: () => ({
            login: mockLogin,
        }),
    };
});

describe('Login Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders login form correctly', () => {
        render(
            <BrowserRouter>
                <Login />
            </BrowserRouter>
        );

        expect(screen.getByText('JKUAT Security Portal')).toBeInTheDocument();
        expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
    });

    it('shows error message on failed login', async () => {
        mockLogin.mockRejectedValueOnce({
            response: { data: { detail: 'Invalid credentials' } }
        });

        render(
            <BrowserRouter>
                <Login />
            </BrowserRouter>
        );

        fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'wronguser' } });
        fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'wrongpass' } });
        fireEvent.click(screen.getByRole('button', { name: /login/i }));

        await waitFor(() => {
            expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
        });
    });

    it('navigates to dashboard on successful login', async () => {
        mockLogin.mockResolvedValueOnce({});

        render(
            <BrowserRouter>
                <Login />
            </BrowserRouter>
        );

        fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'admin' } });
        fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'Password123!' } });
        fireEvent.click(screen.getByRole('button', { name: /login/i }));

        await waitFor(() => {
            expect(mockLogin).toHaveBeenCalled();
            expect(mockNavigate).toHaveBeenCalledWith('/');
        });
    });

    it('disables button and shows loading state when submitting', async () => {
        mockLogin.mockReturnValue(new Promise(() => { })); // Never resolves

        render(
            <BrowserRouter>
                <Login />
            </BrowserRouter>
        );

        fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'admin' } });
        fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'Password123!' } });
        fireEvent.click(screen.getByRole('button', { name: /login/i }));

        await waitFor(() => {
            expect(screen.getByText(/logging in.../i)).toBeInTheDocument();
            expect(screen.getByRole('button')).toBeDisabled();
        });
    });
});
