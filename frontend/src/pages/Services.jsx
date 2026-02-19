import React from 'react';
import { motion } from 'framer-motion';
import {
    Brain,
    MessageSquare,
    FileSearch,
    Cpu,
    Globe,
    ShieldCheck,
    Zap,
    Database,
    Bot,
    LineChart
} from 'lucide-react';

const Services = () => {
    const services = [
        {
            icon: <Brain size={32} />,
            title: 'RAG (Retrieval-Augmented Generation)',
            description: 'Enhance LLMs with your private knowledge base for accurate, context-aware answers.',
            features: []
        },
        {
            icon: <MessageSquare size={32} />,
            title: 'Conversational AI',
            description: 'Advanced chatbot solutions that understand intent and maintain complex context.',
            features: []
        },
        {
            icon: <FileSearch size={32} />,
            title: 'Intelligent Document Processing',
            description: 'Extract structured insights from unstructured data like PDFs, emails, and images.',
            features: []
        },
        {
            icon: <Bot size={32} />,
            title: 'AI Agent Orchestration',
            description: 'Multi-agent systems designed to coordinate specialized AI models for complex tasks.',
            features: []
        },
        {
            icon: <LineChart size={32} />,
            title: 'Predictive Analytics',
            description: 'Leverage machine learning to identify patterns and forecast future outcomes.',
            features: []
        },
        {
            icon: <ShieldCheck size={32} />,
            title: 'Enterprise AI Security',
            description: 'Ensuring your AI implementations are secure, compliant, and follow ethical guidelines.',
            features: []
        }
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <div className="page-container">
            {/* Header Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ textAlign: 'center', marginBottom: '5rem' }}
            >
                <h1 style={{ fontSize: '3.5rem', marginBottom: '1.5rem', fontWeight: 800 }}>
                    Our AI <span className="gradient-text">Services</span>
                </h1>
                <p style={{ fontSize: '1.25rem', color: '#9ca3af', maxWidth: '800px', margin: '0 auto', lineHeight: '1.8' }}>
                    Pushing the boundaries of what's possible with artificial intelligence.
                    We provide end-to-end AI solutions tailored to your business needs.
                </p>
            </motion.div>

            {/* Services Grid */}
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
                    gap: '2.5rem',
                    marginBottom: '5rem'
                }}
            >
                {services.map((service, index) => (
                    <motion.div
                        key={index}
                        variants={itemVariants}
                        className="card"
                        whileHover={{ y: -10, transition: { duration: 0.2 } }}
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            height: '100%',
                            background: 'rgba(255, 255, 255, 0.03)',
                            border: '1px solid rgba(255, 255, 255, 0.05)'
                        }}
                    >
                        <div style={{
                            color: '#3b82f6',
                            marginBottom: '1.5rem',
                            background: 'rgba(59, 130, 246, 0.1)',
                            width: 'fit-content',
                            padding: '1rem',
                            borderRadius: '12px'
                        }}>
                            {service.icon}
                        </div>
                        <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', fontWeight: 700 }}>{service.title}</h3>
                        <p style={{ color: '#9ca3af', marginBottom: '1.5rem', lineHeight: '1.6', flex: 1 }}>
                            {service.description}
                        </p>
                        {service.features?.length > 0 && (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                {service.features.map((feature, i) => (
                                    <span
                                        key={i}
                                        style={{
                                            fontSize: '0.75rem',
                                            background: 'rgba(59, 130, 246, 0.05)',
                                            color: '#60a5fa',
                                            padding: '0.25rem 0.75rem',
                                            borderRadius: '100px',
                                            border: '1px solid rgba(59, 130, 246, 0.2)'
                                        }}
                                    >
                                        {feature}
                                    </span>
                                ))}
                            </div>
                        )}
                    </motion.div>
                ))}
            </motion.div>

            {/* CTA Section */}
            <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="card"
                style={{
                    textAlign: 'center',
                    padding: '4rem 2rem',
                    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)',
                    borderRadius: '24px'
                }}
            >
                <h2 style={{ fontSize: '2.5rem', marginBottom: '1.5rem', fontWeight: 700 }}>
                    Ready to <span className="gradient-text">Transform</span> Your Business?
                </h2>
                <p style={{ fontSize: '1.1rem', color: '#9ca3af', marginBottom: '2.5rem', maxWidth: '600px', margin: '0 auto 2.5rem' }}>
                    Schedule a consultation with our AI experts today and discover how our solutions can drive growth and efficiency for your organization.
                </p>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                    <button className="btn-primary" style={{ padding: '0.8rem 2rem', fontSize: '1rem' }}>
                        Contact Sales
                    </button>
                    <button style={{
                        padding: '0.8rem 2rem',
                        fontSize: '1rem',
                        background: 'transparent',
                        color: 'white',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        borderRadius: '12px',
                        cursor: 'pointer'
                    }}>
                        View Case Studies
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default Services;
