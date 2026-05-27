import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getAssignment, deleteAssignment } from '../services/assignmentRepository';
import { authStore } from '../store/authStore';
import '../styles/AssignmentDetailPage.css';

const ArrowLeftIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M19 12H5M12 5l-7 7 7 7"/>
  </svg>
);
const EditIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);
const Trash2Icon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
    <path d="M10 11v6M14 11v6"/>
    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
  </svg>
);
const CalendarIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);
const ClockIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12 6 12 12 16 14"/>
  </svg>
);
const BookOpenIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
  </svg>
);
const BarChart3Icon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18 20V10M12 20V4M6 20v-6"/>
  </svg>
);

function formatDate(iso) {
  if (!iso) return '-';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '-';
  return d.toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long',
    day: 'numeric',
  });
}

function formatCreated(iso) {
  if (!iso) return '-';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '-';
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

export default function AssignmentDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const currentUser = authStore.getUser();
  const userId = currentUser?.id;

  const [assignment, setAssignment] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting,        setIsDeleting]        = useState(false);
  const [error,             setError]             = useState('');

  useEffect(() => {
    if (!userId) {
      navigate('/login');
      return;
    }
    let active = true;
    (async () => {
      try {
        const record = await getAssignment({ userId, id });
        if (!active) return;
        setAssignment(record);
      } catch (err) {
        if (!active) return;
        setAssignment(null);
      } finally {
        if (active) setIsLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [id, userId]);

  if (isLoading) {
    return (
      <div className="adp-center">
        <p>Loading assignment...</p>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="adp-center">
        <p>Assignment not found.</p>
        <button className="btn-outline" onClick={() => navigate('/dashboard')}>
          Back to Dashboard
        </button>
      </div>
    );
  }

  const handleDelete = () => {
    setIsDeleting(true);
    setError('');
    try {
      deleteAssignment({ userId, id }).then(() => {
        navigate('/dashboard');
      }).catch(() => {
        setError('Failed to delete. Please try again.');
        setIsDeleting(false);
        setShowDeleteConfirm(false);
      });
    } catch {
      setError('Failed to delete. Please try again.');
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const statusKey  = (assignment.status   || '').replace(/\s+/g, '-');
  const priorityKey = assignment.priority || 'Low';

  return (
    <div className="adp-page">
      <div className="adp-container">

        <div className="adp-topbar">
          <button className="btn-ghost" onClick={() => navigate('/dashboard')}>
            <ArrowLeftIcon /> Back to Dashboard
          </button>
          <div className="adp-topbar-actions">
            <button
              className="btn-primary"
              onClick={() => navigate('/assignments/' + id + '/edit')}
            >
              <EditIcon /> Edit
            </button>
            <button
              className="btn-destructive"
              onClick={() => setShowDeleteConfirm(true)}
            >
              <Trash2Icon /> Delete
            </button>
          </div>
        </div>

        <h1 className="adp-title">{assignment.title}</h1>

        <div className="adp-card">

          <div className="adp-badge-row">
            <span className={'badge badge-priority-' + priorityKey}>
              {assignment.priority} Priority
            </span>
            <span className={'badge badge-status-' + statusKey}>
              {assignment.status}
            </span>
            {assignment.course_name && (
              <span className="badge badge-course">
                {assignment.course_color && (
                  <span
                    className="badge-course-dot"
                  />
                )}
                {assignment.course_name}
              </span>
            )}
          </div>

          <div className="adp-info-grid">
            <div>
              <div className="adp-info-label">
                <CalendarIcon /> Due Date
              </div>
              <div className="adp-info-value">{formatDate(assignment.due_date)}</div>
            </div>

            {assignment.course_name && (
              <div>
                <div className="adp-info-label">
                  <BookOpenIcon /> Course
                </div>
                <div className="adp-info-value">{assignment.course_name}</div>
              </div>
            )}

            <div>
              <div className="adp-info-label">
                <BarChart3Icon /> Priority
              </div>
              <div className="adp-info-value">{assignment.priority}</div>
            </div>
          </div>

          {assignment.description && (
            <div className="adp-desc-wrap">
              <div className="adp-info-label">Description</div>
              <div className="adp-desc-box">{assignment.description}</div>
            </div>
          )}

          <div className="adp-footer">
            Created on {formatCreated(assignment.created_at)}
          </div>

        </div>
      </div>

      {showDeleteConfirm && (
        <div className="adp-overlay">
          <div className="adp-modal">
            <h3 className="adp-modal-title">Delete Assignment?</h3>
            <p className="adp-modal-body">
              This cannot be undone. This will permanently delete{' '}
              <strong>{assignment.title}</strong>.
            </p>
            {error && <p className="adp-modal-error">{error}</p>}
            <div className="adp-modal-actions">
              <button
                className="btn-outline"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </button>
              <button
                className="btn-destructive"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                <Trash2Icon /> {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}