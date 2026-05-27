import { CheckCircle2, Calendar, BarChart3 } from 'lucide-react';
import '../styles/FeaturesSection.css';

export function FeaturesSection() {
  const features = [
    { icon: <CheckCircle2 size={24} />, title: 'Track Progress', desc: 'Keep tabs on assignment status from not started to completed' },
    { icon: <Calendar size={24} />, title: 'Never Miss Deadlines', desc: 'Clear due date tracking with overdue and today indicators' },
    { icon: <BarChart3 size={24} />, title: 'Stay Focused', desc: 'Prioritize tasks and filter by status to focus on what matters' },
  ];

  return (
    <div className="features">
      <h2>Everything you need to stay organized</h2>
      <div className="features-grid">
        {features.map(({ icon, title, desc }) => (
          <div key={title} className="feature-card">
            <div className="feature-icon">{icon}</div>
            <h3>{title}</h3>
            <p>{desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
