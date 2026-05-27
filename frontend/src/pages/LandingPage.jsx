import { useNavigate } from 'react-router-dom';
import { HeroSection } from '../components/HeroSection';
import { FeaturesSection } from '../components/FeaturesSection';
import { CTASection } from '../components/CTASection';
import '../styles/LandingPage.css';

export function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="landing">
      <HeroSection
        onRegister={() => navigate('/register')}
        onLogin={() => navigate('/login')}
      />
      <FeaturesSection />
      <CTASection onRegister={() => navigate('/register')} />
    </div>
  );
}
