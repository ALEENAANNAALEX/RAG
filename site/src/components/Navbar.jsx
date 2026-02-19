import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Ghost } from 'lucide-react';

const Navbar = () => {
    const [isOpen, setIsOpen] = React.useState(false);
    const location = useLocation();

    const navLinks = [
        { name: 'Home', path: '/' },
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold', fontSize: '1.5rem' }}>
                <Ghost className="gradient-text" style={{ color: '#3b82f6' }} />
                <span className="gradient-text">RAG-QA</span>
            </div>

            <div style={{ display: 'flex', gap: '2rem' }}>
                {navLinks.map((link) => (
                    <Link
                        key={link.path}
                        to={link.path}
                        style={{
                            textDecoration: 'none',
                            color: location.pathname === link.path ? '#3b82f6' : '#9ca3af',
                            fontWeight: 500,
                            transition: 'color 0.2s'
                        }}
                    >
                        {link.name}
                    </Link>
                ))}
            </div>

            <button className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
                Get Started
            </button>
        </nav>
    );
};

export default Navbar;
