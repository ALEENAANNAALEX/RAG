import React from 'react';
import { motion } from 'framer-motion';
import { Brain, Zap, Shield, Target, Users, Rocket } from 'lucide-react';

const About = () => {
    const stats = [
        { label: 'Active Users', value: '10K+', icon: <Users size={24} /> },
        { label: 'Documents Processed', value: '1M+', icon: <Brain size={24} /> },
        { label: 'Queries Answered', value: '5M+', icon: <Zap size={24} /> },
        { label: 'Uptime', value: '99.9%', icon: <Shield size={24} /> }
    ];

    const values = [
        {
            icon: <Target size={32} />,
            title: 'Accuracy First',
            description: 'We prioritize delivering precise, contextually relevant answers from your documents.'
        },
        {
            icon: <Zap size={32} />,
            title: 'Lightning Speed',
            description: 'Our optimized retrieval system ensures sub-second response times for all queries.'
        },
        {
            icon: <Shield size={32} />,
            title: 'Privacy & Security',
            description: 'Your data is encrypted end-to-end and never used to train our models.'
        },
        {
            icon: <Rocket size={32} />,
            title: 'Continuous Innovation',
            description: 'We constantly improve our AI models and infrastructure to serve you better.'
        }
    ];

    return (
        <div className="page-container">
            {/* Hero Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ textAlign: 'center', marginBottom: '5rem' }}
            >
                <h1 style={{ fontSize: '3.5rem', marginBottom: '1.5rem', fontWeight: 800 }}>
                    About <span className="gradient-text">Intel AI</span>
                </h1>
                <p style={{ fontSize: '1.25rem', color: '#9ca3af', maxWidth: '800px', margin: '0 auto', lineHeight: '1.8' }}>
                    We're building the future of intelligent document interaction. Our Retrieval-Augmented Generation system
                    combines cutting-edge AI with powerful vector search to unlock the knowledge hidden in your documents.
                </p>
            </motion.div>

            {/* Stats Section */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '2rem',
                marginBottom: '5rem'
            }}>
                {stats.map((stat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.1 }}
                        className="card"
                        style={{ textAlign: 'center' }}
                    >
                        <div style={{ color: '#3b82f6', marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}>
                            {stat.icon}
                        </div>
                        <div style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                            {stat.value}
                        </div>
                        <div style={{ color: '#9ca3af', fontSize: '0.9rem' }}>{stat.label}</div>
                    </motion.div>
                ))}
            </div>

            {/* Mission Section */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="card"
                style={{ marginBottom: '4rem', background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)' }}
            >
                <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem', fontWeight: 700 }}>
                    Our <span className="gradient-text">Mission</span>
                </h2>
                <p style={{ color: '#9ca3af', fontSize: '1.1rem', lineHeight: '1.8', marginBottom: '1rem' }}>
                    We believe that knowledge should be accessible, searchable, and actionable. Traditional document search
                    is limited to keyword matching, but Intel AI understands context, semantics, and intent.
                </p>
                <p style={{ color: '#9ca3af', fontSize: '1.1rem', lineHeight: '1.8' }}>
                    Our mission is to empower individuals and organizations to extract maximum value from their documents
                    through intelligent AI-powered question answering.
                </p>
            </motion.div>

            {/* Values Section */}
            <div style={{ marginBottom: '5rem' }}>
                <h2 style={{ fontSize: '2.5rem', textAlign: 'center', marginBottom: '3rem', fontWeight: 700 }}>
                    What We <span className="gradient-text">Stand For</span>
                </h2>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                    gap: '1.5rem'
                }}>
                    {values.map((value, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 + i * 0.1 }}
                            className="card"
                        >
                            <div style={{ color: '#3b82f6', marginBottom: '1rem' }}>
                                {value.icon}
                            </div>
                            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem', fontWeight: 600 }}>
                                {value.title}
                            </h3>
                            <p style={{ color: '#9ca3af', lineHeight: '1.6' }}>
                                {value.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Founders Section */}
            <div style={{ marginBottom: '5rem' }}>
                <h2 style={{ fontSize: '2.5rem', textAlign: 'center', marginBottom: '3rem', fontWeight: 700 }}>
                    Our <span className="gradient-text">Founders</span>
                </h2>
                <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'center',
                    gap: '2.5rem'
                }}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="card"
                        style={{ width: '300px', textAlign: 'center', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.1)' }}
                    >
                        <div style={{
                            width: '80px',
                            height: '80px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)',
                            margin: '0 auto 1.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '2rem',
                            fontWeight: 'bold'
                        }}>A</div>
                        <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', fontWeight: 700 }}>Ryan Mitchell</h3>
                        <p style={{ color: '#10b981', fontWeight: 600, marginBottom: '0.75rem' }}>Co-Founder & CEO</p>
                        <p style={{ color: '#9ca3af', fontSize: '0.9rem', lineHeight: '1.5' }}>
                            Visionary behind Intel AI, dedicated to reshaping how humans interact with information.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="card"
                        style={{ width: '300px', textAlign: 'center', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.1)' }}
                    >
                        <div style={{
                            width: '80px',
                            height: '80px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                            margin: '0 auto 1.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '2rem',
                            fontWeight: 'bold'
                        }}>S</div>
                        <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', fontWeight: 700 }}>Surya</h3>
                        <p style={{ color: '#3b82f6', fontWeight: 600, marginBottom: '0.75rem' }}>Co-Founder & CTO</p>
                        <p style={{ color: '#9ca3af', fontSize: '0.9rem', lineHeight: '1.5' }}>
                            AI architect focusing on building scalable retrieval systems and large language model workflows.
                        </p>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default About;
