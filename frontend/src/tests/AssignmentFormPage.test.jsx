import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import AssignmentFormPage from '../pages/AssignmentFormPage';
import {
  getAssignment,
  createAssignment,
  updateAssignment,
  deleteAssignment
} from '../services/assignmentRepository';
import { vi, describe, it, beforeEach, expect } from 'vitest';

vi.mock('../store/authStore', () => ({
  authStore: {
    getUser: vi.fn(() => ({ id: 1, name: 'Test User', email: 'test@example.com' })),
    setUser: vi.fn(),
    clear: vi.fn(),
    subscribe: vi.fn()
  }
}));

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('../services/assignmentRepository', () => ({
  getAssignment: vi.fn(),
  createAssignment: vi.fn(),
  updateAssignment: vi.fn(),
  deleteAssignment: vi.fn(),
}));

function renderForm(id) {
  const path = id ? `/assignments/${id}/edit` : '/assignments/new';
  const route = id ? '/assignments/:id/edit' : '/assignments/new';
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path={route} element={<AssignmentFormPage />} />
      </Routes>
    </MemoryRouter>
  );
}

const SAMPLE_ASSIGNMENT = {
  id: 'abc-123',
  title: 'Existing Essay',
  course_name: 'ENGL 101',
  due_date: '2025-10-01',
  priority: 'High',
  status: 'In Progress',
  description: 'A sample description.',
};

describe('AssignmentFormPage — new assignment', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    createAssignment.mockResolvedValue({ id: 'new-1' });
    createAssignment.mockClear();
  });

  it('renders the "New Assignment" heading', () => {
    renderForm();
    expect(screen.getByText('New Assignment')).toBeInTheDocument();
  });

  it('renders all form fields', () => {
    renderForm();
    expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/course/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/due date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/priority/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/status/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
  });

  it('does NOT render the Delete button in new mode', () => {
    renderForm();
    expect(screen.queryByText(/delete/i)).not.toBeInTheDocument();
  });

  it('calls createAssignment and navigates to /dashboard on valid submit', async () => {
    createAssignment.mockResolvedValue({ id: 'new-1' });
    renderForm();

    await userEvent.type(screen.getByLabelText(/title/i), 'My New Assignment');
    await userEvent.type(screen.getByLabelText(/due date/i), '2025-12-01');

    await userEvent.click(screen.getByRole('button', { name: /save changes/i }));

    await waitFor(() => {
      expect(createAssignment).toHaveBeenCalledWith(expect.objectContaining({
        userId: 1,
        payload: expect.objectContaining({
          title: 'My New Assignment',
          due_date: '2025-12-01',
        })
      }));
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('shows field-level errors when validation returns errors', async () => {
    createAssignment.mockRejectedValue({
      payload: {
        errors: {
          title: 'Title is required',
          due_date: 'Due date is required',
        }
      }
    });

    renderForm();

    // provide minimal valid inputs so the form attempts to submit and server errors are returned
    await userEvent.type(screen.getByLabelText(/title/i), 'x');
    await userEvent.type(screen.getByLabelText(/due date/i), '2025-12-01');

    await userEvent.click(screen.getByRole('button', { name: /save changes/i }));

    await waitFor(() => {
      expect(screen.getByText(/Title is required/i)).toBeInTheDocument();
      expect(screen.getByText(/Due date is required/i)).toBeInTheDocument();
    });

    expect(createAssignment).toHaveBeenCalled();
  });
});

describe('AssignmentFormPage — edit assignment', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    getAssignment.mockResolvedValue(SAMPLE_ASSIGNMENT);
    updateAssignment.mockClear();
    deleteAssignment.mockClear();
  });

  it('renders the "Edit Assignment" heading', async () => {
    renderForm('abc-123');
    expect(await screen.findByText('Edit Assignment')).toBeInTheDocument();
  });

  it('pre-populates fields with existing assignment data', async () => {
    renderForm('abc-123');
    expect(await screen.findByLabelText(/title/i)).toHaveValue('Existing Essay');
    expect(screen.getByLabelText(/course/i)).toHaveValue('ENGL 101');
    expect(screen.getByLabelText(/due date/i)).toHaveValue('2025-10-01');
    expect(screen.getByLabelText(/priority/i)).toHaveValue('High');
    expect(screen.getByLabelText(/status/i)).toHaveValue('In Progress');
    expect(screen.getByLabelText(/description/i)).toHaveValue('A sample description.');
  });

  it('calls updateAssignment and navigates to /dashboard on valid submit', async () => {
    updateAssignment.mockResolvedValue({ ...SAMPLE_ASSIGNMENT, title: 'Updated Title' });
    renderForm('abc-123');

    const titleInput = await screen.findByLabelText(/title/i);
    await userEvent.clear(titleInput);
    await userEvent.type(titleInput, 'Updated Title');

    await userEvent.click(screen.getByRole('button', { name: /save changes/i }));

    await waitFor(() => {
      expect(updateAssignment).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 1,
          id: 'abc-123',
          payload: expect.objectContaining({ title: 'Updated Title' })
        })
      );
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('opens delete modal and calls deleteAssignment when confirmed', async () => {
    renderForm('abc-123');

    await screen.findByText('Edit Assignment');
    await userEvent.click(screen.getByRole('button', { name: /delete/i }));

    const modal = screen.getByText(/delete assignment\?/i).closest('.afp-modal');
    const modalWithin = within(modal);

    await userEvent.click(modalWithin.getByRole('button', { name: /^delete$/i }));

    expect(deleteAssignment).toHaveBeenCalledWith({ userId: 1, id: 'abc-123' });
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
  });

  it('closes delete modal when cancel is clicked', async () => {
    renderForm('abc-123');

    await screen.findByText('Edit Assignment');
    await userEvent.click(screen.getByRole('button', { name: /delete/i }));

    const modal = screen.getByText(/delete assignment\?/i).closest('.afp-modal');
    const modalWithin = within(modal);

    await userEvent.click(modalWithin.getByRole('button', { name: /cancel/i }));

    expect(screen.queryByText(/delete assignment\?/i)).not.toBeInTheDocument();
    expect(deleteAssignment).not.toHaveBeenCalled();
  });
});

describe('AssignmentFormPage — assignment not found', () => {
  beforeEach(() => {
    getAssignment.mockRejectedValue(new Error('Not found'));
    mockNavigate.mockClear();
  });

  it('renders the not-found message', async () => {
    renderForm('no-such-id');
    expect(await screen.findByText(/assignment not found/i)).toBeInTheDocument();
  });

  it('navigates to /dashboard when the back button is clicked', async () => {
    renderForm('no-such-id');
    await userEvent.click(await screen.findByRole('button', { name: /back to dashboard/i }));
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
  });
});