import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Info, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const Pricing = () => {
    const [billingCycle, setBillingCycle] = useState('monthly');
    const navigate = useNavigate();

    const handlePlanSelection = (plan) => {
        // Check if user is logged in
        const token = localStorage.getItem('token');
        
        if (!token) {
            // Redirect to signup if not logged in
            navigate('/signup');
            return;
        }

        // Map plans to package IDs
        const packageMap = {
            'Starter': 'free',
            'Pro': 'pro',
            'Enterprise': 'enterprise'
        };

        const packageId = packageMap[plan.name];

        if (packageId === 'free') {
            // Free plan - just go to AI Chat
            navigate('/ai-chat');
        } else if (packageId) {
            // Paid plans - go to payment
            navigate('/payment', { 
                state: { 
                    package: {
                        id: packageId,
                        name: plan.name,
                        price: parseFloat(plan.price.replace('$', '')) || 0,
                        duration: 30
                    }
                }
            });
        } else {
            // Contact sales for custom
            navigate('/contact');
        }
    };

    const plans = [
        {
            name: "Starter",
            price: billingCycle === 'monthly' ? "$0" : "$0",
            description: "Perfect for students and individuals exploring RAG technology.",
            features: [
                "2 document uploads",
                "Knowledge base queries only",
                "Basic document parsing",
                "Community support",
                "10 chats per day"
            ],
            color: "rgba(148, 163, 184, 0.1)",
            accent: "#94a3b8"
        },
        {
            name: "Pro",
            price: billingCycle === 'monthly' ? "$29.99" : "$24.99",
            description: "Full access for professionals and teams.",
            features: [
                "Unlimited document uploads",
                "Unlimited AI conversations",
                "Full knowledge base access",
                "Priority email support",
                "Advanced document parsing",
                "API Access"
            ],
            color: "rgba(59, 130, 246, 0.1)",
            accent: "#3b82f6",
            popular: true
        },
        {
            name: "Enterprise",
            price: "Custom",
            description: "Bespoke solutions for high-scale organizations.",
            features: [
                "everything in Pro",
                "On-premise deployment",
                "Custom model finetuning",
                "Dedicated Account Manager",
                "SSO & Advanced Security",
                "SLA Guarantees"
            ],
            color: "rgba(139, 92, 246, 0.1)",
            accent: "#8b5cf6"
        }
    ];

    const faqs = [
        { q: "Can I cancel my subscription any time?", a: "Yes, all our paid plans are contract-free and can be canceled at any time from your account settings." },
        { q: "What document formats do you support?", a: "We currently support PDF, TXT, CSV, and DOCX. Table structure extraction is available on Pro plans." },
        { q: "Is my data used to train AI models?", a: "Absolutely not. Your privacy is our priority. We have strict data isolation policies in place." },
        { q: "Do you offer a free trial for the Pro plan?", a: "Yes, we offer a 7-day free trial of our Pro features for new accounts." }
    ];

    return (
        <div className="page-container">
            {/* Background Decorations */}
            <div style={{
                position: 'fixed',
                top: '20%',
                right: '5%',
                width: '400px',
                height: '400px',
                background: 'radial-gradient(circle, rgba(59, 130, 246, 0.05) 0%, transparent 70%)',
                zIndex: -1,
                pointerEvents: 'none'
            }} />

            {/* Header section */}
            <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ fontSize: '3.5rem', fontWeight: 800, marginBottom: '1rem' }}
                >
                    Simple, Transparent <span className="gradient-text">Plans</span>
                </motion.h1>
                <p style={{ color: '#9ca3af', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto 2rem' }}>
                    Boost your productivity with the world's most advanced RAG engine.
                </p>

                {/* Billing Toggle */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '1rem',
                    marginBottom: '3rem'
                }}>
                    <span style={{ color: billingCycle === 'monthly' ? 'white' : '#64748b' }}>Monthly</span>
                    <button
                        onClick={() => setBillingCycle(prev => prev === 'monthly' ? 'yearly' : 'monthly')}
                        style={{
                            width: '50px',
                            height: '26px',
                            background: '#1e293b',
                            borderRadius: '20px',
                            position: 'relative',
                            border: '1px solid rgba(255,255,255,0.1)',
                            cursor: 'pointer'
                        }}
                    >
                        <motion.div
                            animate={{ x: billingCycle === 'monthly' ? 2 : 24 }}
                            style={{
                                width: '20px',
                                height: '20px',
                                background: '#3b82f6',
                                borderRadius: '50%',
                                position: 'absolute',
                                top: 2
                            }}
                        />
                    </button>
                    <span style={{ color: billingCycle === 'yearly' ? 'white' : '#64748b' }}>
                        Yearly <span style={{ color: '#10b981', fontSize: '0.8rem', fontWeight: 600 }}>(Save 20%)</span>
                    </span>
                </div>
            </div>

            {/* Pricing Cards */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: '2rem',
                marginBottom: '6rem'
            }}>
                {plans.map((plan, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.1 }}
                        className="card"
                        style={{
                            background: plan.color,
                            border: plan.popular ? `2px solid ${plan.accent}` : '1px solid rgba(255,255,255,0.05)',
                            display: 'flex',
                            flexDirection: 'column',
                            position: 'relative',
                            overflow: 'hidden'
                        }}
                    >
                        {plan.popular && (
                            <div style={{
                                background: plan.accent,
                                color: 'white',
                                padding: '0.25rem 1rem',
                                position: 'absolute',
                                top: '1rem',
                                right: '-2rem',
                                transform: 'rotate(45deg)',
                                width: '150px',
                                textAlign: 'center',
                                fontSize: '0.75rem',
                                fontWeight: 700
                            }}>
                                BEST VALUE
                            </div>
                        )}

                        <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{plan.name}</h3>
                        <p style={{ color: '#9ca3af', fontSize: '0.9rem', marginBottom: '2rem', height: '3rem' }}>{plan.description}</p>

                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem', marginBottom: '2rem' }}>
                            <span style={{ fontSize: '3rem', fontWeight: 800 }}>{plan.price}</span>
                            {plan.price !== 'Custom' && <span style={{ color: '#64748b' }}>/mo</span>}
                        </div>

                        <div style={{ flex: 1, marginBottom: '2rem' }}>
                            {plan.features.map((feat, j) => (
                                <div key={j} style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', color: '#cbd5e1', fontSize: '0.95rem' }}>
                                    <Check size={18} color={plan.accent} style={{ flexShrink: 0 }} />
                                    <span>{feat}</span>
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={() => handlePlanSelection(plan)}
                            className={plan.popular ? "btn-primary" : ""}
                            style={{
                                width: '100%',
                                padding: '1rem',
                                borderRadius: '12px',
                                border: plan.popular ? 'none' : '1px solid rgba(255,255,255,0.2)',
                                background: plan.popular ? undefined : 'rgba(255,255,255,0.05)',
                                color: 'white',
                                cursor: 'pointer',
                                fontWeight: 600,
                                textAlign: 'center',
                                textDecoration: 'none',
                                transition: 'all 0.2s'
                            }}
                        >
                            {plan.name === 'Enterprise' ? 'Contact Sales' : 'Get Started'}
                        </button>
                    </motion.div>
                ))}
            </div>

            {/* FAQ Section */}
            <div style={{ maxWidth: '800px', margin: '0 auto 4rem' }}>
                <h2 style={{ textAlign: 'center', fontSize: '2.5rem', marginBottom: '3rem' }}>
                    Common <span className="gradient-text">Questions</span>
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {faqs.map((faq, i) => (
                        <div
                            key={i}
                            style={{
                                padding: '1.5rem',
                                background: 'rgba(255,255,255,0.03)',
                                borderRadius: '16px',
                                border: '1px solid rgba(255,255,255,0.05)'
                            }}
                        >
                            <h4 style={{ fontSize: '1.1rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <HelpCircle size={18} color="#3b82f6" />
                                {faq.q}
                            </h4>
                            <p style={{ color: '#9ca3af', lineHeight: '1.6' }}>{faq.a}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Pricing;
