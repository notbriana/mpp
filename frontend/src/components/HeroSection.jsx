import { GraduationCap } from 'lucide-react';
import '../styles/HeroSection.css';

export function HeroSection({ onRegister, onLogin }) {
  return (
    <div className="hero">
      <div className="hero-container">

        <div className="hero-logo">
          <GraduationCap size={40} />
        </div>

        <h1 className="hero-title">Academic Planner</h1>

        <p className="hero-subtitle">
          The simple, organized way to track and manage all your university assignments
        </p>

        <div className="hero-buttons">
          <button className="btn-primary" onClick={onRegister}>Get Started</button>
          <button className="btn-secondary" onClick={onLogin}>Sign In</button>
        </div>

      </div>
    </div>
  );
}
