import { Link } from 'react-router-dom';
import { Sparkles, Github, Twitter, Linkedin, Mail } from 'lucide-react';

const Footer = () => {
    return (
        <footer style={{
            background: 'rgba(10, 10, 11, 0.8)',
            borderTop: '1px solid rgba(255, 255, 255, 0.05)',
            padding: '4rem 2rem 2rem',
            marginTop: '4rem'
        }}>
            <div style={{
                maxWidth: '1200px',
                margin: '0 auto',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '3rem',
                marginBottom: '3rem'
            }}>
                {/* Brand Column */}
                <div style={{ flex: 1.5 }}>
                    <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', marginBottom: '1.25rem' }}>
                        <Sparkles size={24} className="gradient-text" />
                        <span className="gradient-text" style={{ fontWeight: 'bold', fontSize: '1.5rem' }}>IntelAI</span>
                    </Link>
                    <p style={{ color: '#9ca3af', lineHeight: '1.6', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
                        Supercharge your knowledge base with advanced AI-powered document retrieval and generation.
                    </p>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <a href="#" style={{ color: '#9ca3af', transition: 'color 0.2s' }}><Github size={20} /></a>
                        <a href="#" style={{ color: '#9ca3af', transition: 'color 0.2s' }}><Twitter size={20} /></a>
                        <a href="#" style={{ color: '#9ca3af', transition: 'color 0.2s' }}><Linkedin size={20} /></a>
                        <a href="mailto:support@ragqa.io" style={{ color: '#9ca3af', transition: 'color 0.2s' }}><Mail size={20} /></a>
                    </div>
                </div>

                {/* Product Links */}
                <div>
                    <h4 style={{ color: 'white', marginBottom: '1.25rem', fontWeight: 600 }}>Product</h4>
                    <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <li><Link to="/features" style={{ color: '#9ca3af', textDecoration: 'none', transition: 'color 0.2s' }}>Features</Link></li>
                        <li><Link to="/ai-chat" style={{ color: '#9ca3af', textDecoration: 'none', transition: 'color 0.2s' }}>AI Chat</Link></li>
                        <li><Link to="/chat" style={{ color: '#9ca3af', textDecoration: 'none', transition: 'color 0.2s' }}>Doc Chat</Link></li>
                        <li><Link to="/pricing" style={{ color: '#9ca3af', textDecoration: 'none', transition: 'color 0.2s' }}>Pricing</Link></li>
                    </ul>
                </div>

                {/* Resources Links */}
                <div>
                    <h4 style={{ color: 'white', marginBottom: '1.25rem', fontWeight: 600 }}>Resources</h4>
                    <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <li><Link to="/docs" style={{ color: '#9ca3af', textDecoration: 'none', transition: 'color 0.2s' }}>Documentation</Link></li>
                        <li><Link to="/about" style={{ color: '#9ca3af', textDecoration: 'none', transition: 'color 0.2s' }}>About Us</Link></li>
                        <li><Link to="/contact" style={{ color: '#9ca3af', textDecoration: 'none', transition: 'color 0.2s' }}>Contact</Link></li>
                        <li><a href="#" style={{ color: '#9ca3af', textDecoration: 'none', transition: 'color 0.2s' }}>API Status</a></li>
                    </ul>
                </div>

                {/* Legal Links */}
                <div>
                    <h4 style={{ color: 'white', marginBottom: '1.25rem', fontWeight: 600 }}>Legal</h4>
                    <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <li><a href="#" style={{ color: '#9ca3af', textDecoration: 'none', transition: 'color 0.2s' }}>Privacy Policy</a></li>
                        <li><a href="#" style={{ color: '#9ca3af', textDecoration: 'none', transition: 'color 0.2s' }}>Terms of Service</a></li>
                        <li><a href="#" style={{ color: '#9ca3af', textDecoration: 'none', transition: 'color 0.2s' }}>Cookie Policy</a></li>
                    </ul>
                </div>
            </div>

            <div style={{
                maxWidth: '1200px',
                margin: '0 auto',
                paddingTop: '2rem',
                borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                textAlign: 'center',
                color: '#64748b',
                fontSize: '0.85rem'
            }}>
                <p>© {new Date().getFullYear()} IntelAI. Built for the modern knowledge workforce.</p>
            </div>
        </footer>
    );
};

export default Footer; 