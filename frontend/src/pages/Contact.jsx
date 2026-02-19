import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, MessageSquare, MapPin, Send, Globe, Clock, CheckCircle } from 'lucide-react';

const Contact = () => {
    const API_URL = import.meta.env.MODE === 'development'
        ? (window.location.hostname === 'localhost'
            ? 'http://localhost:5001/api'
            : import.meta.env.VITE_API_URL + '/api')
        : '/api';

    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        subject: 'General Inquiry',
        message: ''
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/contact`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                setSubmitted(true);
                setFormData({
                    firstName: '',
                    lastName: '',
                    email: '',
                    subject: 'General Inquiry',
                    message: ''
                });
                setTimeout(() => setSubmitted(false), 5000);
            } else {
                alert("Failed to send message. Please try again.");
            }
        } catch (error) {
            console.error("Error submitting form:", error);
            alert("Connection error. Is the server running?");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-container">
            <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                <motion.h1
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ fontSize: '3.5rem', fontWeight: 800, marginBottom: '1rem' }}
                >
                    Get in <span className="gradient-text">Touch</span>
                </motion.h1>
                <p style={{ color: '#9ca3af', fontSize: '1.2rem' }}>
                    Have a question? We'd love to hear from you.
                </p>
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
                gap: '3rem',
                alignItems: 'start'
            }}>
                {/* Contact Info */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
                            <div style={{
                                padding: '1rem',
                                background: 'rgba(59, 130, 246, 0.1)',
                                borderRadius: '16px',
                                color: '#3b82f6'
                            }}>
                                <Mail size={24} />
                            </div>
                            <div>
                                <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Email Us</h3>
                                <p style={{ color: '#9ca3af', marginBottom: '0.25rem' }}>Our team is here to help.</p>
                                <a href="mailto:support@ragqa.io" style={{ color: '#3b82f6', textDecoration: 'none', fontWeight: 600 }}>support@ragqa.io</a>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
                            <div style={{
                                padding: '1rem',
                                background: 'rgba(139, 92, 246, 0.1)',
                                borderRadius: '16px',
                                color: '#8b5cf6'
                            }}>
                                <Globe size={24} />
                            </div>
                            <div>
                                <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Call Us</h3>
                                <p style={{ color: '#9ca3af', marginBottom: '0.25rem' }}>Direct Line:</p>
                                <p style={{ color: '#3b82f6', fontWeight: 600 }}>+91 98765 43210</p>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
                            <div style={{
                                padding: '1rem',
                                background: 'rgba(16, 185, 129, 0.1)',
                                borderRadius: '16px',
                                color: '#10b981'
                            }}>
                                <Clock size={24} />
                            </div>
                            <div>
                                <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Global Offices</h3>
                                <p style={{ color: '#9ca3af', marginBottom: '0.25rem' }}>San Francisco, CA</p>
                                <p style={{ color: '#9ca3af' }}>New York, NY</p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Contact Form */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="card"
                    style={{ background: 'rgba(255,255,255,0.03)' }}
                >
                    {submitted ? (
                        <div style={{ textAlign: 'center', padding: '3rem 0' }}>
                            <CheckCircle size={60} color="#10b981" style={{ marginBottom: '1.5rem' }} />
                            <h2 style={{ marginBottom: '1rem' }}>Message Sent!</h2>
                            <p style={{ color: '#9ca3af' }}>We'll get back to you within 24 hours.</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} style={{ opacity: loading ? 0.7 : 1, pointerEvents: loading ? 'none' : 'auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', color: '#9ca3af', fontSize: '0.9rem' }}>First Name</label>
                                    <input required name="firstName" value={formData.firstName} onChange={handleInputChange} type="text" style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: '#0a0a0b', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', color: '#9ca3af', fontSize: '0.9rem' }}>Last Name</label>
                                    <input required name="lastName" value={formData.lastName} onChange={handleInputChange} type="text" style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: '#0a0a0b', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} />
                                </div>
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#9ca3af', fontSize: '0.9rem' }}>Email Address</label>
                                <input required name="email" value={formData.email} onChange={handleInputChange} type="email" style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: '#0a0a0b', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#9ca3af', fontSize: '0.9rem' }}>Subject</label>
                                <select name="subject" value={formData.subject} onChange={handleInputChange} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: '#0a0a0b', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}>
                                    <option value="General Inquiry">General Inquiry</option>
                                    <option value="Technical Support">Technical Support</option>
                                    <option value="Billing Issues">Billing Issues</option>
                                    <option value="Enterprise Quote">Enterprise Quote</option>
                                </select>
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#9ca3af', fontSize: '0.9rem' }}>Message</label>
                                <textarea name="message" value={formData.message} onChange={handleInputChange} required rows="5" style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: '#0a0a0b', border: '1px solid rgba(255,255,255,0.1)', color: 'white', resize: 'none' }}></textarea>
                            </div>
                            <button disabled={loading} type="submit" className="btn-primary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', padding: '1rem' }}>
                                {loading ? "Sending..." : "Send Message"} <Send size={18} />
                            </button>
                        </form>
                    )}
                </motion.div>
            </div>
        </div>
    );
};

export default Contact;
