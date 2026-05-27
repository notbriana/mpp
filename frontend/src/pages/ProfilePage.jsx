import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/ProfilePage.css';
import { authStore } from '../store/authStore';
import { changePassword } from '../services/authRepository';
import { listAssignments } from '../services/assignmentRepository';
import { ArrowLeft, Save, User, Mail, Lock, CheckCircle } from 'lucide-react';
import { usePageTracking } from '../cookies/useCookieMonitor';
import { CookieMonitor } from '../cookies/cookieMonitor'; 

export function ProfilePage() {
  const navigate = useNavigate();
  usePageTracking('Profile');

  const [user, setUser] = useState(() => authStore.getUser());

  const logout = () => {
    CookieMonitor.trackLogout(); 
    authStore.clear();
    navigate('/login');
  };

  const [assignments,       setAssignments]       = useState([]);
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [currentPassword,   setCurrentPassword]   = useState('');
  const [newPassword,       setNewPassword]       = useState('');
  const [confirmPassword,   setConfirmPassword]   = useState('');
  const [error,             setError]             = useState('');
  const [success,           setSuccess]           = useState('');

  useEffect(() => { if (!user) navigate('/login'); }, [user, navigate]);
  useEffect(() => authStore.subscribe(setUser), []);
  useEffect(() => {
    if (!user?.id) return;
    let active = true;
    (async () => {
      try {
        const data = await listAssignments({ userId: user?.id, all: true });
        if (active) setAssignments(data.items || []);
      } catch {
        if (active) setAssignments([]);
      }
    })();
    return () => { active = false; };
  }, [user?.id]);

  const courses = [...new Set(assignments.map(a => a.course_name).filter(Boolean))];

  function isToday(date) {
    const today = new Date();
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
  }

  const now = new Date(); now.setHours(0, 0, 0, 0);

  const stats = {
    totalAssignments:     assignments.length,
    completedAssignments: assignments.filter(a => a.status === 'Completed').length,
    totalCourses:         courses.length,
    overdueAssignments:   assignments.filter(a =>
      new Date(a.due_date) < now && a.status !== 'Completed' && !isToday(new Date(a.due_date))
    ).length,
  };

  const completionRate = stats.totalAssignments
    ? Math.round((stats.completedAssignments / stats.totalAssignments) * 100) : 0;

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');

    let result;
    try {
      result = await changePassword({
        email: user?.email,
        currentPassword,
        newPassword,
        confirmPassword
      });
    } catch (error) {
      CookieMonitor.trackPasswordChange(false);
      return setError('Unable to reach the server.');
    }

    const { errors, formError } = result;

    if (formError) {
      CookieMonitor.trackPasswordChange(false);
      return setError(formError);
    }

    if (errors.currentPassword) {
      CookieMonitor.trackPasswordChange(false);
      return setError(errors.currentPassword);
    }

    if (errors.newPassword || errors.confirmPassword || errors.email) {
      CookieMonitor.trackPasswordChange(false);
      return setError(errors.newPassword || errors.confirmPassword || errors.email);
    }

    CookieMonitor.trackPasswordChange(true);
    setSuccess('Password changed successfully!');
    setIsEditingPassword(false);
    setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
  };

  return (
    <div className="profile-container">
      <div className="profile-wrapper">
        <div className="profile-header">
          <button className="btn ghost" onClick={() => navigate('/dashboard')}><ArrowLeft size={16} /> Back to Dashboard</button>
          <h1>Profile Settings</h1>
        </div>
        <div className="profile-grid">
          <div className="profile-left">
            <div className="card">
              <h3>Account Information</h3>
              <div className="info-box"><User size={16} /> <span>{user?.name}</span></div>
              <div className="info-box"><Mail size={16} /> <span>{user?.email}</span></div>
            </div>
            <div className="card">
              <div className="card-header">
                <h3>Change Password</h3>
                {!isEditingPassword && (
                  <button className="btn outline" onClick={() => setIsEditingPassword(true)}>
                    <Lock size={16} /> Change Password
                  </button>
                )}
              </div>
              {isEditingPassword ? (
                <form onSubmit={handlePasswordChange} className="form">
                  {error   && <div className="error">{error}</div>}
                  {success && <div className="success"><CheckCircle size={16} /> {success}</div>}
                  <input type="password" placeholder="Current password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} required />
                  <input type="password" placeholder="New password"     value={newPassword}     onChange={e => setNewPassword(e.target.value)}     required />
                  <input type="password" placeholder="Confirm password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
                  <div className="form-actions">
                    <button type="button" className="btn outline" onClick={() => setIsEditingPassword(false)}>Cancel</button>
                    <button className="btn primary"><Save size={16} /> Save</button>
                  </div>
                </form>
              ) : (
                <p className="muted">Keep your account secure by using a strong password</p>
              )}
            </div>
          </div>
          <div className="profile-right">
            <div className="card">
              <h3>Your Statistics</h3>
              <div className="stat primary">{stats.totalCourses}<span>Courses</span></div>
              <div className="stat secondary">{stats.totalAssignments}<span>Assignments</span></div>
              <div className="stat primary-light">{stats.completedAssignments}<span>Completed</span></div>
              {stats.overdueAssignments > 0 && <div className="stat danger">{stats.overdueAssignments}<span>Overdue</span></div>}
              <div className="progress"><div className="progress-bar" style={{ width: `${completionRate}%` }} /></div>
              <span className="muted">{completionRate}% Completion</span>
            </div>
            <div className="card">
              <h3>Account Actions</h3>
              <button className="btn danger full" onClick={logout}>Sign Out</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}