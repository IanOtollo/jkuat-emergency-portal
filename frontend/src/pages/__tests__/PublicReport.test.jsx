import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import PublicReport from '../PublicReport';
import { publicAPI } from '../../api/client';
import { BrowserRouter } from 'react-router-dom';

// Mock the API client
vi.mock('../../api/client', () => ({
    publicAPI: {
        submitReport: vi.fn(),
    },
}));

const queryClient = new QueryClient({
    defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
    },
});

const wrapper = ({ children }) => (
    <QueryClientProvider client={queryClient}>
        <BrowserRouter>
            {children}
        </BrowserRouter>
    </QueryClientProvider>
);

describe('PublicReport Page', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        queryClient.clear();
    });

    it('renders public report form correctly', () => {
        render(<PublicReport />, { wrapper });

        expect(screen.getByText(/JKUAT Security Incident Report/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/incident type/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/location building/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /submit report/i })).toBeInTheDocument();
    });

    it('allows reporting anonymously and hides personal info fields', () => {
        render(<PublicReport />, { wrapper });

        const anonymousCheckbox = screen.getByLabelText(/report anonymously/i);
        expect(screen.getByLabelText(/your name/i)).toBeInTheDocument();

        fireEvent.click(anonymousCheckbox);
        expect(screen.queryByLabelText(/your name/i)).not.toBeInTheDocument();
        expect(screen.queryByLabelText(/email/i)).not.toBeInTheDocument();
    });

    it('successfully submits a report and shows the reference number', async () => {
        const mockResponse = {
            data: { reference_number: 'REF-123456' }
        };
        publicAPI.submitReport.mockResolvedValue(mockResponse);

        render(<PublicReport />, { wrapper });

        fireEvent.change(screen.getByLabelText(/description/i), { target: { value: 'Something happened' } });
        fireEvent.change(screen.getByLabelText(/location building/i), { target: { value: 'Building A' } });

        fireEvent.click(screen.getByRole('button', { name: /submit report/i }));

        await waitFor(() => {
            expect(screen.getByText(/submission received/i)).toBeInTheDocument();
            expect(screen.getByText('REF-123456')).toBeInTheDocument();
        });
    });

    it('handles submission errors', async () => {
        publicAPI.submitReport.mockRejectedValue({
            response: { data: { message: 'Server error occurred' } }
        });

        render(<PublicReport />, { wrapper });

        fireEvent.change(screen.getByLabelText(/description/i), { target: { value: 'Something happened' } });
        fireEvent.change(screen.getByLabelText(/location building/i), { target: { value: 'Building A' } });

        fireEvent.click(screen.getByRole('button', { name: /submit report/i }));

        await waitFor(() => {
            expect(screen.getByText(/server error occurred/i)).toBeInTheDocument();
        });
    });
});
