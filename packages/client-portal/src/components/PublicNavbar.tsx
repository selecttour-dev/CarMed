import { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowRight, ChevronRight } from 'lucide-react';

const NAV_ITEMS = [
    { path: '/', label: 'მთავარი' },
    { path: '/about', label: 'ჩვენს შესახებ' },
    { path: '/contact', label: 'კონტაქტი' },
];

export default function PublicNavbar() {
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    const location = useLocation();

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Lock body scroll when mobile menu is open
    useEffect(() => {
        document.body.style.overflow = mobileOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [mobileOpen]);

    const isActive = useCallback((path: string) => location.pathname === path, [location.pathname]);



    return (
        <>
            <nav
                className="public-navbar"
                data-scrolled={scrolled}
            >
                <div className="section-container">
                    <div className="navbar-inner">
                        {/* Logo */}
                        <Link to="/" className="navbar-logo">
                            <img
                                src="/logo-carmed.png"
                                alt="CarMed"
                                className="navbar-logo-img"
                            />
                        </Link>

                        {/* Desktop Navigation — Center Pill */}
                        <div className="navbar-center-pill">
                            <div className="navbar-pill-track">
                                {NAV_ITEMS.map((item) => (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        className={`navbar-pill-link ${isActive(item.path) ? 'active' : ''}`}
                                    >
                                        <span className="navbar-pill-link-text">{item.label}</span>
                                        {isActive(item.path) && (
                                            <span className="navbar-active-dot" />
                                        )}
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* CTA Buttons */}
                        <div className="navbar-actions">
                            <Link to="/login" className="navbar-btn-ghost">
                                შესვლა
                            </Link>
                            <Link to="/login" className="navbar-btn-cta">
                                <span>დაწყება</span>
                                <ArrowRight size={14} strokeWidth={2.5} />
                            </Link>
                        </div>

                        {/* Mobile Toggle */}
                        <button
                            className="navbar-mobile-toggle"
                            onClick={() => setMobileOpen(!mobileOpen)}
                            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
                        >
                            <div className={`navbar-hamburger ${mobileOpen ? 'open' : ''}`}>
                                <span />
                                <span />
                                <span />
                            </div>
                        </button>
                    </div>
                </div>
            </nav>

            {/* Mobile Menu Overlay */}
            <div className={`navbar-mobile-overlay ${mobileOpen ? 'open' : ''}`}>
                <div className="navbar-mobile-backdrop" onClick={() => setMobileOpen(false)} />
                <div className="navbar-mobile-panel">
                    <div className="navbar-mobile-links">
                        {NAV_ITEMS.map((item, index) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => setMobileOpen(false)}
                                className={`navbar-mobile-link ${isActive(item.path) ? 'active' : ''}`}
                                style={{ animationDelay: `${index * 50}ms` }}
                            >
                                <span className="navbar-mobile-link-label">
                                    {isActive(item.path) && (
                                        <span className="navbar-mobile-active-bar" />
                                    )}
                                    {item.label}
                                </span>
                                <ChevronRight size={16} className="navbar-mobile-link-arrow" />
                            </Link>
                        ))}
                    </div>
                    <div className="navbar-mobile-cta">
                        <Link
                            to="/login"
                            onClick={() => setMobileOpen(false)}
                            className="navbar-mobile-cta-btn"
                        >
                            დაწყება
                            <ArrowRight size={16} />
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}
