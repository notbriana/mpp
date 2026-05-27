import { render, screen, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import AssignmentDetailPage from '../pages/AssignmentDetailPage';
import { getAssignment, deleteAssignment } from '../services/assignmentRepository';
import { vi, describe, it, beforeEach } from 'vitest';

vi.mock('../store/authStore', () => ({
  authStore: {
    getUser: vi.fn(() => ({ id: 1, name: 'Test User', email: 'test@example.com' })),
    setUser: vi.fn(),
    clear: vi.fn(),
    subscribe: vi.fn()
  }
}));

const SAMPLE_ASSIGNMENT = {
  id: 'abc-123',
  title: 'Existing Essay',
  course_name: 'ENGL 101',
  due_date: '2025-10-01',
  priority: 'High',
  status: 'In Progress',
  description: 'A sample description.',
  created_at: '2025-01-01',
};

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
  deleteAssignment: vi.fn(),
}));

function renderDetail(id = 'abc-123') {
  return render(
    <MemoryRouter initialEntries={[`/assignments/${id}`]}>
      <Routes>
        <Route path="/assignments/:id" element={<AssignmentDetailPage />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('AssignmentDetailPage', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    getAssignment.mockResolvedValue(SAMPLE_ASSIGNMENT);
    deleteAssignment.mockClear();
  });

  it('renders assignment details (Read)', async () => {
    renderDetail();

    expect(await screen.findByText('Existing Essay')).toBeInTheDocument();

    const badgeRow = document.querySelector('.adp-badge-row');
    expect(within(badgeRow).getByText('High Priority')).toBeInTheDocument();
    expect(within(badgeRow).getByText('In Progress')).toBeInTheDocument();
    expect(within(badgeRow).getByText('ENGL 101')).toBeInTheDocument();

    const infoGrid = document.querySelector('.adp-info-grid');
    expect(within(infoGrid).getByText('ENGL 101')).toBeInTheDocument();
    expect(within(infoGrid).getByText('High')).toBeInTheDocument();
    expect(within(infoGrid).getByText('Wednesday, October 1, 2025')).toBeInTheDocument();

    expect(screen.getByText('A sample description.')).toBeInTheDocument();

    expect(screen.getByText(/Created on/)).toHaveTextContent('Created on January 1, 2025');
  });
});