import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sparkles, Menu, X } from 'lucide-react';

const Navbar = () => {
    const [isOpen, setIsOpen] = React.useState(false);
    const location = useLocation();

    const navLinks = [
        { name: 'Home', path: '/' },
        { name: 'AI Chat', path: '/ai-chat' },
        { name: 'Doc Chat', path: '/chat' },
        { name: 'Services', path: '/services' },
        { name: 'About', path: '/about' },
        { name: 'Pricing', path: '/pricing' },
        { name: 'Contact', path: '/contact' },
    ];

    return (
        <nav className="glass" style={{
            position: 'fixed',
            top: 0,
            width: '100%',
            zIndex: 1000,
            padding: '1rem 2rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
        }}>
            {/* Logo */}
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold', fontSize: '1.5rem', textDecoration: 'none', color: 'white' }}>
                <Sparkles className="gradient-text" style={{ color: '#818cf8' }} />
            </Link>

            {/* Desktop Navigation */}
            <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '2rem' }} className="desktop-nav">
                    {navLinks.map((link) => (
                        <Link
                            key={link.path}
                            to={link.path}
                            style={{
                                textDecoration: 'none',
                                color: location.pathname === link.path ? '#3b82f6' : '#9ca3af',
                                fontWeight: 500,
                                transition: 'color 0.2s',
                                fontSize: '0.95rem'
                            }}
                        >
                            {link.name}
                        </Link>
                    ))}
                </div>

                <Link to="/ai-chat" className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
                    Get Started
                </Link>
            </div>

            {/* Mobile Menu Toggle */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="mobile-menu-btn"
                style={{
                    display: 'none',
                    background: 'transparent',
                    border: 'none',
                    color: 'white',
                    cursor: 'pointer'
                }}
            >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Mobile Navigation */}
            {isOpen && (
                <div className="mobile-nav" style={{
                    position: 'fixed',
                    top: '4rem',
                    left: 0,
                    right: 0,
                    background: 'rgba(22, 22, 24, 0.95)',
                    backdropFilter: 'blur(12px)',
                    padding: '1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem'
                }}>
                    {navLinks.map((link) => (
                        <Link
                            key={link.path}
                            to={link.path}
                            onClick={() => setIsOpen(false)}
                            style={{
                                textDecoration: 'none',
                                color: location.pathname === link.path ? '#3b82f6' : '#9ca3af',
                                fontWeight: 500,
                                padding: '0.75rem',
                                borderRadius: '8px',
                                background: location.pathname === link.path ? 'rgba(59, 130, 246, 0.1)' : 'transparent'
                            }}
                        >
                            {link.name}
                        </Link>
                    ))}
                </div>
            )}

            <style>{`
                @media (max-width: 1024px) {
                    .desktop-nav {
                        display: none !important;
                    }
                    .mobile-menu-btn {
                        display: block !important;
                    }
                }
            `}</style>
        </nav>
    );
};

export default Navbar;

