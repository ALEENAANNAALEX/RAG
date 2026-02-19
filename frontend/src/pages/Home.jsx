import React from 'react';
import { motion } from 'framer-motion';
import { Bot, Zap, Shield, Search } from 'lucide-react';
import { Link } from 'react-router-dom';

const Home = () => {
    return (
        <div className="page-container">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                style={{ textAlign: 'center', marginBottom: '4rem' }}
            >
                <h1 style={{ fontSize: '4rem', marginBottom: '1rem', fontWeight: 800 }}>
                    Supercharge Your <span className="gradient-text">Knowledge Base</span>
                </h1>
                <p style={{ fontSize: '1.25rem', color: '#9ca3af', maxWidth: '800px', margin: '0 auto 2rem' }}>
                    Connect your documents and get instant, accurate answers with our advanced Retrieval-Augmented Generation engine. Built for speed, accuracy, and scale.
                </p>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                    <Link to="/ai-chat" className="btn-primary" style={{ fontSize: '1.1rem' }}>Start Chatting Free</Link>
                    <button style={{
                        background: 'transparent',
                        color: 'white',
                        border: '1px solid rgba(255,255,255,0.2)',
                        padding: '0.75rem 1.5rem',
                        borderRadius: '8px',
                        fontWeight: 600,
                        cursor: 'pointer'
                    }}>
                        Watch Demo
                    </button>
                </div>
            </motion.div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '2rem',
                marginTop: '4rem'
            }}>
                {[
                    { icon: <Bot />, title: "AI-Powered", desc: "State of the art LLMs integrated for human-like reasoning." },
                    { icon: <Zap />, title: "Lightning Fast", desc: "Optimized retrieval for sub-second response times." },
                    { icon: <Shield />, title: "Enterprise Secure", desc: "Your data is encrypted and remains under your control." },
                    { icon: <Search />, title: "Deep Insights", desc: "Discover patterns and answers hidden in your data." }
                ].map((feat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 + i * 0.1 }}
                        className="card"
                    >
                        <div style={{ color: '#3b82f6', marginBottom: '1rem' }}>{feat.icon}</div>
                        <h3 style={{ marginBottom: '0.5rem' }}>{feat.title}</h3>
                        <p style={{ color: '#9ca3af', fontSize: '0.9rem' }}>{feat.desc}</p>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default Home;
