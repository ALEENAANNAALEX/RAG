import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Home, Search, MessageCircle, FileQuestion } from 'lucide-react';

const NotFound = () => {
    const quickLinks = [
        { icon: <Home size={24} />, label: 'Home', path: '/', color: '#3b82f6' },
        { icon: <MessageCircle size={24} />, label: 'AI Chat', path: '/ai-chat', color: '#8b5cf6' },
        { icon: <FileQuestion size={24} />, label: 'Doc Chat', path: '/chat', color: '#10b981' },
        { icon: <Search size={24} />, label: 'Features', path: '/features', color: '#f59e0b' }
    ];

    return (
        <div className="page-container" style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '80vh',
            textAlign: 'center'
        }}>
            {/* 404 Animation */}
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                style={{ marginBottom: '2rem' }}
            >
                <div style={{
                    fontSize: '10rem',
                    fontWeight: 900,
                    lineHeight: 1,
                    background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #ec4899 100%)',
                    WebkitBackgroundClip: 'text',
                    backgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    marginBottom: '1rem'
                }}>
                    404
                </div>
            </motion.div>

            {/* Message */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                style={{ marginBottom: '3rem' }}
            >
                <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', fontWeight: 700 }}>
                    Page Not Found
                </h1>
                <p style={{ fontSize: '1.2rem', color: '#9ca3af', maxWidth: '600px' }}>
                    Oops! The page you're looking for seems to have wandered off into the digital void.
                    Let's get you back on track.
                </p>
            </motion.div>

            {/* Quick Links */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                    gap: '1.5rem',
                    width: '100%',
                    maxWidth: '700px',
                    marginBottom: '2rem'
                }}
            >
                {quickLinks.map((link, i) => (
                    <Link
                        key={i}
                        to={link.path}
                        className="card"
                        style={{
                            textDecoration: 'none',
                            color: 'white',
                            padding: '1.5rem',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '0.75rem',
                            transition: 'all 0.3s'
                        }}
                    >
                        <div style={{ color: link.color }}>
                            {link.icon}
                        </div>
                        <span style={{ fontWeight: 600 }}>{link.label}</span>
                    </Link>
                ))}
            </motion.div>

            {/* Back Home Button */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
            >
                <Link to="/" className="btn-primary" style={{ fontSize: '1.1rem', padding: '1rem 2rem' }}>
                    Take Me Home
                </Link>
            </motion.div>
        </div>
    );
};

export default NotFound;
