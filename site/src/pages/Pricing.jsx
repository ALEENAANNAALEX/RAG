import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

const Pricing = () => {
    const plans = [
        {
            name: "Starter",
            price: "$0",
            features: ["Up to 100 documents", "Basic AI models", "Community support", "100 queries/mo"],
            color: "rgba(255,255,255,0.05)"
        },
        {
            name: "Pro",
            price: "$49",
            features: ["Unlimited documents", "Premium AI models", "Priority support", "10,000 queries/mo", "API access"],
            color: "rgba(59, 130, 246, 0.1)",
            popular: true
        },
        {
            name: "Enterprise",
            price: "Custom",
            features: ["On-prem deployment", "Custom model finetuning", "Dedicated manager", "Unlimited everything"],
            color: "rgba(139, 92, 246, 0.1)"
        }
    ];

    return (
        <div className="page-container">
            <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                <h2 style={{ fontSize: '3rem', fontWeight: 700 }}>Simple, Transparent <span className="gradient-text">Pricing</span></h2>
                <p style={{ color: '#9ca3af' }}>Choose the plan that fits your needs.</p>
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '2rem'
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
                            border: plan.popular ? '2px solid #3b82f6' : '1px solid rgba(255,255,255,0.1)',
                            display: 'flex',
                            flexDirection: 'column'
                        }}
                    >
                        {plan.popular && <span style={{
                            background: '#3b82f6',
                            color: 'white',
                            fontSize: '0.7rem',
                            padding: '0.2rem 0.6rem',
                            borderRadius: '20px',
                            width: 'fit-content',
                            marginBottom: '1rem'
                        }}>MOST POPULAR</span>}
                        <h3>{plan.name}</h3>
                        <div style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: '1rem 0' }}>{plan.price}<span style={{ fontSize: '1rem', color: '#9ca3af' }}>{plan.price !== 'Custom' && '/mo'}</span></div>
                        <div style={{ flex: 1, marginBottom: '2rem' }}>
                            {plan.features.map((feat, j) => (
                                <div key={j} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: '#9ca3af' }}>
                                    <Check size={16} color="#3b82f6" />
                                    <span>{feat}</span>
                                </div>
                            ))}
                        </div>
                        <button className={plan.popular ? "btn-primary" : ""} style={{
                            width: '100%',
                            padding: '0.75rem',
                            borderRadius: '8px',
                            border: plan.popular ? 'none' : '1px solid rgba(255,255,255,0.2)',
                            background: plan.popular ? undefined : 'transparent',
                            color: 'white',
                            cursor: 'pointer',
                            fontWeight: 600
                        }}>
                            {plan.price === 'Custom' ? 'Contact Sales' : 'Get Started'}
                        </button>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default Pricing;
