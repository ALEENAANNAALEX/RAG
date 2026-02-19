import React from 'react';
import { motion } from 'framer-motion';
import {
    FileText,
    Search,
    Zap,
    Shield,
    Cloud,
    Code,
    Database,
    Lock,
    Layers,
    TrendingUp,
    Users,
    Globe
} from 'lucide-react';

const Features = () => {
    const features = [
        {
            icon: <FileText size={32} />,
            title: 'Multi-Format Support',
            description: 'Upload PDFs, TXT, CSV, and more. Our system intelligently parses and indexes any document format.',
            color: '#3b82f6'
        },
        {
            icon: <Search size={32} />,
            title: 'Semantic Search',
            description: 'Go beyond keyword matching. Our AI understands context and meaning to find the most relevant information.',
            color: '#8b5cf6'
        },
        {
            icon: <Zap size={32} />,
            title: 'Real-Time Processing',
            description: 'Get instant answers. Our optimized pipeline processes queries in milliseconds.',
            color: '#f59e0b'
        },
        {
            icon: <Shield size={32} />,
            title: 'Enterprise Security',
            description: 'Bank-level encryption, SOC 2 compliance, and complete data isolation for your peace of mind.',
            color: '#10b981'
        },
        {
            icon: <Cloud size={32} />,
            title: 'Cloud-Native',
            description: 'Scalable infrastructure that grows with your needs. From startup to enterprise.',
            color: '#06b6d4'
        },
        {
            icon: <Code size={32} />,
            title: 'Developer API',
            description: 'Integrate RAG QA into your applications with our comprehensive REST API and SDKs.',
            color: '#ec4899'
        },
        {
            icon: <Database size={32} />,
            title: 'Vector Database',
            description: 'Powered by Pinecone for lightning-fast similarity search across millions of documents.',
            color: '#6366f1'
        },
        {
            icon: <Lock size={32} />,
            title: 'Private Deployment',
            description: 'Deploy on-premises or in your own cloud for complete data sovereignty.',
            color: '#ef4444'
        },
        {
            icon: <Layers size={32} />,
            title: 'Multi-Model Support',
            description: 'Choose from GPT-4, Claude, Gemini, or use your own custom models.',
            color: '#14b8a6'
        },
        {
            icon: <TrendingUp size={32} />,
            title: 'Analytics Dashboard',
            description: 'Track usage, monitor performance, and gain insights into user queries.',
            color: '#f97316'
        },
        {
            icon: <Users size={32} />,
            title: 'Team Collaboration',
            description: 'Share knowledge bases, manage permissions, and collaborate seamlessly.',
            color: '#a855f7'
        },
        {
            icon: <Globe size={32} />,
            title: 'Multi-Language',
            description: 'Support for 100+ languages with automatic translation and localization.',
            color: '#0ea5e9'
        }
    ];

    return (
        <div className="page-container">
            {/* Hero Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ textAlign: 'center', marginBottom: '4rem' }}
            >
                <h1 style={{ fontSize: '3.5rem', marginBottom: '1.5rem', fontWeight: 800 }}>
                    Powerful <span className="gradient-text">Features</span>
                </h1>
                <p style={{ fontSize: '1.25rem', color: '#9ca3af', maxWidth: '700px', margin: '0 auto' }}>
                    Everything you need to unlock the full potential of your documents with AI-powered intelligence.
                </p>
            </motion.div>

            {/* Features Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '2rem',
                marginBottom: '4rem'
            }}>
                {features.map((feature, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="card"
                        style={{
                            position: 'relative',
                            overflow: 'hidden'
                        }}
                    >
                        {/* Gradient Accent */}
                        <div style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '4px',
                            height: '100%',
                            background: `linear-gradient(180deg, ${feature.color}, transparent)`
                        }} />

                        <div style={{ color: feature.color, marginBottom: '1rem' }}>
                            {feature.icon}
                        </div>
                        <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem', fontWeight: 600 }}>
                            {feature.title}
                        </h3>
                        <p style={{ color: '#9ca3af', lineHeight: '1.6', fontSize: '0.95rem' }}>
                            {feature.description}
                        </p>
                    </motion.div>
                ))}
            </div>

            {/* CTA Section */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 }}
                className="card"
                style={{
                    textAlign: 'center',
                    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)',
                    padding: '3rem 2rem'
                }}
            >
                <h2 style={{ fontSize: '2rem', marginBottom: '1rem', fontWeight: 700 }}>
                    Ready to Get Started?
                </h2>
                <p style={{ color: '#9ca3af', marginBottom: '2rem', fontSize: '1.1rem' }}>
                    Experience the power of AI-driven document intelligence today.
                </p>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <a href="/ai-chat" className="btn-primary" style={{ fontSize: '1.1rem', padding: '1rem 2rem' }}>
                        Try It Free
                    </a>
                    <a
                        href="/contact"
                        style={{
                            padding: '1rem 2rem',
                            borderRadius: '8px',
                            border: '1px solid rgba(255,255,255,0.2)',
                            color: 'white',
                            textDecoration: 'none',
                            fontWeight: 600,
                            fontSize: '1.1rem',
                            transition: 'all 0.2s'
                        }}
                    >
                        Contact Sales
                    </a>
                </div>
            </motion.div>
        </div>
    );
};

export default Features;
