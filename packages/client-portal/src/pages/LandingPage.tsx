import PublicNavbar from '../components/PublicNavbar';
import Footer from '../components/Footer';
import HeroSection from './landing/HeroSection';
import HowItWorksSection from './landing/HowItWorksSection';
import WhyCarMedSection from './landing/WhyCarMedSection';
import CTASection from './landing/CTASection';

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-surface">
            <PublicNavbar />
            <HeroSection />
            <HowItWorksSection />
            <WhyCarMedSection />
            <CTASection />
            <Footer />
        </div>
    );
}
