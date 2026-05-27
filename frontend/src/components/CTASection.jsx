import '../styles/CTASection.css';

export function CTASection({ onRegister }) {
  return (
    <div className="cta">
      <div className="cta-container">
        <h2>Ready to get organized?</h2>
        <p>Join students who are taking control of their academic workload</p>
        <button className="btn-primary" onClick={onRegister}>
          Create Free Account
        </button>
      </div>
    </div>
  );
}
