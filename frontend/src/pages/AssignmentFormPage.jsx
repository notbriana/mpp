import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  getAssignment,
  createAssignment,
  updateAssignment,
  deleteAssignment
} from '../services/assignmentRepository';
import { validateAssignment } from '../validators/assignmentValidator';
import { authStore } from '../store/authStore';
import { CookieMonitor } from '../cookies/cookieMonitor';       
import { usePageTracking } from '../cookies/useCookieMonitor';  
import '../styles/AssignmentFormPage.css';

const ArrowLeftIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M19 12H5M12 5l-7 7 7 7"/>
  </svg>
);

const SaveIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
    <polyline points="17 21 17 13 7 13 7 21"/>
    <polyline points="7 3 7 8 15 8"/>
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

const EMPTY_FORM = {
  title: '',
  course_name: '',
  due_date: '',
  priority: 'Medium',
  status: 'Not Started',
  description: '',
};

export default function AssignmentFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const currentUser = authStore.getUser();
  const userId = currentUser?.id;

  const [form, setForm] = useState(EMPTY_FORM);
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [isLoading, setIsLoading] = useState(isEdit);

  usePageTracking(isEdit ? 'Edit Assignment' : 'New Assignment'); 

  useEffect(() => {
    if (!userId) navigate('/login');
  }, [userId, navigate]);

  useEffect(() => {
    if (!isEdit || !userId) return;
    let active = true;

    (async () => {
      try {
        const assignment = await getAssignment({ userId, id });
        if (!active) return;
        setForm({
          title: assignment.title || '',
          course_name: assignment.course_name || '',
          due_date: assignment.due_date || '',
          priority: assignment.priority || 'Medium',
          status: assignment.status || 'Not Started',
          description: assignment.description || '',
        });
        setIsLoading(false);
      } catch (error) {
        if (!active) return;
        setIsLoading(false);
        setNotFound(true);
      }
    })();

    return () => {
      active = false;
    };
  }, [id, isEdit, userId]);

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    setFieldErrors({});
    setIsSaving(true);

    const payload = {
      title: form.title.trim(),
      course_name: form.course_name.trim(),
      due_date: form.due_date,
      priority: form.priority,
      status: form.status,
      description: form.description.trim(),
    };

    const clientErrors = validateAssignment(payload || {});
    if (Object.keys(clientErrors).length > 0) {
      setFieldErrors(clientErrors);
      setIsSaving(false);
      return;
    }

    try {
      if (isEdit) {
        const updated = await updateAssignment({ userId, id, payload });
        CookieMonitor.trackAssignmentAction('edited', id, updated?.title || payload.title);
      } else {
        const created = await createAssignment({ userId, payload });
        CookieMonitor.trackAssignmentAction('created', created?.id ?? 'new', payload.title);
      }
      navigate('/dashboard');
    } catch (err) {
      const payloadErrors = err?.payload?.errors || {};
      if (Object.keys(payloadErrors).length > 0) {
        setFieldErrors(payloadErrors);
      } else {
        setSubmitError('Something went wrong. Please try again.');
      }
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    CookieMonitor.trackAssignmentAction('deleted', id, form.title);
    try {
      await deleteAssignment({ userId, id });
      navigate('/dashboard');
    } catch (error) {
      setSubmitError('Failed to delete. Please try again.');
    }
  };

  if (notFound) {
    return (
      <div className="afp-loading">
        <p>Assignment not found.</p>
        <button className="btn-outline" style={{ marginTop: 16 }} onClick={() => navigate('/dashboard')}>
          Back to Dashboard
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="afp-loading">
        <p>Loading assignment...</p>
      </div>
    );
  }

  const backPath = isEdit ? '/assignments/' + id : '/dashboard';

  return (
    <div className="afp-page">
      <div className="afp-container">
        <div className="afp-topbar">
          <button className="btn-ghost" onClick={() => navigate(backPath)}>
            <ArrowLeftIcon /> Back
          </button>
          <h1>{isEdit ? 'Edit Assignment' : 'New Assignment'}</h1>
        </div>

        <div className="afp-card">
          {submitError && <div className="afp-error-banner">{submitError}</div>}

          <form onSubmit={handleSubmit} noValidate>
            <div className="afp-field">
              <label htmlFor="title">Title *</label>
              <input
                id="title"
                className={`afp-input${fieldErrors.title ? ' error' : ''}`}
                placeholder="e.g., Research Paper"
                value={form.title}
                onChange={e => handleChange('title', e.target.value)}
              />
              {fieldErrors.title && <p className="afp-field-error">{fieldErrors.title}</p>}
            </div>

            <div className="afp-field">
              <label htmlFor="course_name">Course</label>
              <input
                id="course_name"
                className="afp-input"
                placeholder="e.g., MATH 201"
                value={form.course_name}
                onChange={e => handleChange('course_name', e.target.value)}
              />
            </div>

            <div className="afp-field">
              <label htmlFor="due_date">Due Date *</label>
              <input
                id="due_date"
                type="date"
                className={`afp-input${fieldErrors.due_date ? ' error' : ''}`}
                value={form.due_date}
                onChange={e => handleChange('due_date', e.target.value)}
              />
              {fieldErrors.due_date && <p className="afp-field-error">{fieldErrors.due_date}</p>}
            </div>

            <div className="afp-grid-2">
              <div>
                <label htmlFor="priority">Priority</label>
                <select
                  id="priority"
                  className={`afp-select${fieldErrors.priority ? ' error' : ''}`}
                  value={form.priority}
                  onChange={e => handleChange('priority', e.target.value)}
                >
                  <option>High</option>
                  <option>Medium</option>
                  <option>Low</option>
                </select>
              </div>
              <div>
                <label htmlFor="status">Status</label>
                <select
                  id="status"
                  className={`afp-select${fieldErrors.status ? ' error' : ''}`}
                  value={form.status}
                  onChange={e => handleChange('status', e.target.value)}
                >
                  <option>Not Started</option>
                  <option>In Progress</option>
                  <option>Completed</option>
                </select>
              </div>
            </div>

            <div className="afp-field">
              <label htmlFor="description">
                Description (optional)
                <span style={{ fontWeight: 400, marginLeft: 6 }}>
                  {form.description.length}/500
                </span>
              </label>
              <textarea
                id="description"
                className={`afp-textarea${fieldErrors.description ? ' error' : ''}`}
                placeholder="Add any notes..."
                value={form.description}
                onChange={e => handleChange('description', e.target.value)}
              />
            </div>

            <div className="afp-actions">
              <button type="button" className="btn-outline" onClick={() => navigate(backPath)}>
                Cancel
              </button>
              <button type="submit" className="btn-primary" disabled={isSaving}>
                <SaveIcon /> {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
              {isEdit && (
                <button
                  type="button"
                  className="btn-destructive afp-actions-delete"
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  <Trash2Icon /> Delete
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="afp-overlay">
          <div className="afp-modal">
            <h3>Delete Assignment?</h3>
            <p>This cannot be undone. The assignment will be permanently deleted.</p>
            <div className="afp-modal-actions">
              <button className="btn-outline" onClick={() => setShowDeleteConfirm(false)}>
                Cancel
              </button>
              <button className="btn-destructive" onClick={handleDelete}>
                <Trash2Icon /> Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}