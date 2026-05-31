import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CreditCard, Lock, CheckCircle, Loader2 } from 'lucide-react';

const Payment = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const selectedPackage = location.state?.package || null;

    const [packages, setPackages] = useState([]);
    const [selectedPkg, setSelectedPkg] = useState(selectedPackage);
    const [paymentDetails, setPaymentDetails] = useState({
        cardNumber: '',
        cvv: '',
        expiryMonth: '',
        expiryYear: '',
        cardholderName: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const API_URL = import.meta.env.VITE_API_URL
        ? (import.meta.env.VITE_API_URL.endsWith('/api')
            ? import.meta.env.VITE_API_URL
            : import.meta.env.VITE_API_URL + '/api')
        : '/api';

    useEffect(() => {
        fetchPackages();
    }, []);

    const fetchPackages = async () => {
        try {
            const response = await fetch(`${API_URL}/packages`);
            const data = await response.json();
            if (data.success) {
                const paidPackages = data.data.filter(pkg => pkg.id !== 'free');
                setPackages(paidPackages);
                if (!selectedPkg && paidPackages.length > 0) {
                    setSelectedPkg(paidPackages[0]);
                }
            }
        } catch (err) {
            console.error('Error fetching packages:', err);
        }
    };

    const handleInputChange = (e) => {
        let value = e.target.value;
        const name = e.target.name;

        // Format card number
        if (name === 'cardNumber') {
            value = value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
        }

        setPaymentDetails({
            ...paymentDetails,
            [name]: value
        });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        try {
            const response = await fetch(`${API_URL}/payment/process`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    packageType: selectedPkg.id,
                    paymentDetails: {
                        cardNumber: paymentDetails.cardNumber.replace(/\s/g, ''),
                        cvv: paymentDetails.cvv,
                        expiryMonth: paymentDetails.expiryMonth,
                        expiryYear: paymentDetails.expiryYear
                    }
                }),
            });

            const data = await response.json();

            if (data.success) {
                setSuccess(true);
                
                // Update user in localStorage
                const user = JSON.parse(localStorage.getItem('user') || '{}');
                user.hasSubscription = true;
                user.role = 'user';
                localStorage.setItem('user', JSON.stringify(user));

                // Redirect after 2 seconds
                setTimeout(() => {
                    navigate('/ai-chat');
                }, 2000);
            } else {
                setError(data.message || 'Payment failed');
            }
        } catch (err) {
            console.error('Payment error:', err);
            setError('Network error. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    if (success) {
        return (
            <div className="page-container" style={{ paddingTop: '5rem', textAlign: 'center' }}>
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    style={{ maxWidth: '500px', margin: '0 auto' }}
                >
                    <CheckCircle size={80} color="#10b981" style={{ margin: '0 auto 2rem' }} />
                    <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', fontWeight: 800 }}>
                        Payment <span className="gradient-text">Successful!</span>
                    </h1>
                    <p style={{ color: '#9ca3af', fontSize: '1.1rem' }}>
                        Your subscription is now active. Redirecting to AI Chat...
                    </p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="page-container" style={{ paddingTop: '5rem' }}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ maxWidth: '900px', margin: '0 auto' }}
            >
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <CreditCard size={48} color="#3b82f6" style={{ margin: '0 auto 1rem' }} />
                    <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', fontWeight: 800 }}>
                        Complete Your <span className="gradient-text">Payment</span>
                    </h1>
                    <p style={{ color: '#9ca3af' }}>Secure dummy payment system for testing</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
                    {/* Package Selection */}
                    <div className="card">
                        <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', fontWeight: 700 }}>
                            Select Package
                        </h2>
                        {packages.map((pkg) => (
                            <div
                                key={pkg.id}
                                onClick={() => setSelectedPkg(pkg)}
                                style={{
                                    padding: '1rem',
                                    marginBottom: '1rem',
                                    border: selectedPkg?.id === pkg.id ? '2px solid #3b82f6' : '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    background: selectedPkg?.id === pkg.id ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                                            {pkg.name}
                                        </h3>
                                        <p style={{ color: '#9ca3af', fontSize: '0.9rem' }}>
                                            {pkg.duration} days access
                                        </p>
                                    </div>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#3b82f6' }}>
                                        ${pkg.price}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Payment Form */}
                    <div className="card">
                        <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', fontWeight: 700 }}>
                            Payment Details
                        </h2>

                        {error && (
                            <div style={{
                                background: 'rgba(239, 68, 68, 0.1)',
                                border: '1px solid rgba(239, 68, 68, 0.3)',
                                borderRadius: '8px',
                                padding: '1rem',
                                marginBottom: '1.5rem',
                                color: '#ef4444'
                            }}>
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#9ca3af', fontSize: '0.9rem' }}>
                                    Cardholder Name
                                </label>
                                <input
                                    type="text"
                                    name="cardholderName"
                                    value={paymentDetails.cardholderName}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="John Doe"
                                    style={{
                                        width: '100%',
                                        padding: '0.875rem',
                                        background: '#0a0a0b',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '8px',
                                        color: 'white',
                                        fontSize: '1rem'
                                    }}
                                />
                            </div>

                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#9ca3af', fontSize: '0.9rem' }}>
                                    Card Number
                                </label>
                                <input
                                    type="text"
                                    name="cardNumber"
                                    value={paymentDetails.cardNumber}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="1234 5678 9012 3456"
                                    maxLength="19"
                                    style={{
                                        width: '100%',
                                        padding: '0.875rem',
                                        background: '#0a0a0b',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '8px',
                                        color: 'white',
                                        fontSize: '1rem'
                                    }}
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', color: '#9ca3af', fontSize: '0.9rem' }}>
                                        Expiry Date
                                    </label>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <input
                                            type="text"
                                            name="expiryMonth"
                                            value={paymentDetails.expiryMonth}
                                            onChange={handleInputChange}
                                            required
                                            placeholder="MM"
                                            maxLength="2"
                                            style={{
                                                flex: 1,
                                                padding: '0.875rem',
                                                background: '#0a0a0b',
                                                border: '1px solid rgba(255,255,255,0.1)',
                                                borderRadius: '8px',
                                                color: 'white',
                                                fontSize: '1rem',
                                                textAlign: 'center'
                                            }}
                                        />
                                        <input
                                            type="text"
                                            name="expiryYear"
                                            value={paymentDetails.expiryYear}
                                            onChange={handleInputChange}
                                            required
                                            placeholder="YY"
                                            maxLength="2"
                                            style={{
                                                flex: 1,
                                                padding: '0.875rem',
                                                background: '#0a0a0b',
                                                border: '1px solid rgba(255,255,255,0.1)',
                                                borderRadius: '8px',
                                                color: 'white',
                                                fontSize: '1rem',
                                                textAlign: 'center'
                                            }}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', color: '#9ca3af', fontSize: '0.9rem' }}>
                                        CVV
                                    </label>
                                    <input
                                        type="text"
                                        name="cvv"
                                        value={paymentDetails.cvv}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="123"
                                        maxLength="4"
                                        style={{
                                            width: '100%',
                                            padding: '0.875rem',
                                            background: '#0a0a0b',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            borderRadius: '8px',
                                            color: 'white',
                                            fontSize: '1rem',
                                            textAlign: 'center'
                                        }}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading || !selectedPkg}
                                className="btn-primary"
                                style={{
                                    width: '100%',
                                    padding: '1rem',
                                    fontSize: '1rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.5rem',
                                    opacity: (isLoading || !selectedPkg) ? 0.7 : 1
                                }}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="animate-spin" size={20} />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <Lock size={20} />
                                        Pay ${selectedPkg?.price || 0}
                                    </>
                                )}
                            </button>

                            <div style={{ marginTop: '1rem', textAlign: 'center', color: '#9ca3af', fontSize: '0.8rem' }}>
                                <Lock size={14} style={{ display: 'inline', marginRight: '0.25rem' }} />
                                This is a dummy payment system for testing. Use any valid card format.
                            </div>
                        </form>
                    </div>
                </div>
            </motion.div>

            <style>{`
                @keyframes spin { 
                    from { transform: rotate(0deg); } 
                    to { transform: rotate(360deg); } 
                }
                .animate-spin { 
                    animation: spin 1s linear infinite; 
                }
            `}</style>
        </div>
    );
};

export default Payment;

