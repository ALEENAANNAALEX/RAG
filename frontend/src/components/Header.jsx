import React from 'react';
import { Sparkles } from 'lucide-react';

const Header = () => {
    return (
        <div style={{
            textAlign: 'center',
            marginBottom: '3rem',
            padding: '1rem'
        }}>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                marginBottom: '0.5rem'
            }}>
                <Sparkles size={32} style={{ color: '#818cf8' }} />
                <h1 style={{
                    fontSize: '2.5rem',
                    fontWeight: '900',
                    background: 'linear-gradient(90deg, #fff, #94a3b8)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    margin: 0,
                    letterSpacing: '-0.05em'
                }}>
                    IntelliQuest<span style={{ color: '#818cf8', WebkitTextFillColor: '#818cf8' }}>.RAG</span>
                </h1>
            </div>
            <p style={{
                color: '#64748b',
                fontSize: '1.1rem',
                fontWeight: '400',
                maxWidth: '600px',
                margin: '0 auto',
                lineHeight: '1.6'
            }}>
                Next-generation document intelligence. Upload your files and let AI find the answers for you instantly.
            </p>
        </div>
    );
};

export default Header;