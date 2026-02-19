import React from 'react';
import { motion } from 'framer-motion';
import { Mail, MessageSquare, MapPin, Send } from 'lucide-react';

const Contact = () => {
    return (
        <div className="page-container">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '4rem' }}>
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                >
                    <h2 style={{ fontSize: '3rem', fontWeight: 700, marginBottom: '1.5rem' }}>Let's <span className="gradient-text">Talk</span></h2>
                    <p style={{ color: '#9ca3af', marginBottom: '2rem' }}>
                        Have questions? Our team is here to help you integrate AI into your workflow seamlessly.
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div className="glass" style={{ padding: '0.75rem', borderRadius: '12px' }}><Mail color="#3b82f6" /></div>
                            <div>
                                <div style={{ fontWeight: 600 }}>Email</div>
                                <div style={{ color: '#9ca3af' }}>support@ragqa.io</div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div className="glass" style={{ padding: '0.75rem', borderRadius: '12px' }}><MessageSquare color="#3b82f6" /></div>
                            <div>
                                <div style={{ fontWeight: 600 }}>Live Chat</div>
                                <div style={{ color: '#9ca3af' }}>Available 24/7</div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div className="glass" style={{ padding: '0.75rem', borderRadius: '12px' }}><MapPin color="#3b82f6" /></div>
                            <div>
                                <div style={{ fontWeight: 600 }}>Office</div>
                                <div style={{ color: '#9ca3af' }}>San Francisco, CA</div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="card"
                >
                    <form style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#9ca3af' }}>Name</label>
                            <input type="text" placeholder="John Doe" style={{
                                width: '100%',
                                padding: '0.75rem',
                                borderRadius: '8px',
                                background: '#0a0a0b',
                                border: '1px solid rgba(255,255,255,0.1)',
                                color: 'white'
                            }} />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#9ca3af' }}>Email</label>
                            <input type="email" placeholder="john@example.com" style={{
                                width: '100%',
                                padding: '0.75rem',
                                borderRadius: '8px',
                                background: '#0a0a0b',
                                border: '1px solid rgba(255,255,255,0.1)',
                                color: 'white'
                            }} />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#9ca3af' }}>Message</label>
                            <textarea rows="4" placeholder="How can we help?" style={{
                                width: '100%',
                                padding: '0.75rem',
                                borderRadius: '8px',
                                background: '#0a0a0b',
                                border: '1px solid rgba(255,255,255,0.1)',
                                color: 'white',
                                resize: 'none'
                            }}></textarea>
                        </div>
                        <button type="button" className="btn-primary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                            Send Message <Send size={18} />
                        </button>
                    </form>
                </motion.div>
            </div>
        </div>
    );
};

export default Contact;
