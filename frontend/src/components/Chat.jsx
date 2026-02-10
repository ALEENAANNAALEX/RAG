import React, { useState } from 'react';
import { Upload, Send, FileText, MessageCircle, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import Header from './Header';
import Footer from './Footer';

const PdfQaBot = () => {
    let API_URL = import.meta.env.VITE_API_URL;
    if (API_URL && !API_URL.endsWith('/api')) {
        API_URL = API_URL.endsWith('/') ? `${API_URL}api` : `${API_URL}/api`;
    }

    const [file, setFile] = useState(null);
    const [query, setQuery] = useState('');
    const [messages, setMessages] = useState([]);
    const [isUploading, setIsUploading] = useState(false);
    const [isQuerying, setIsQuerying] = useState(false);
    const [uploadStatus, setUploadStatus] = useState(null);

    // Debugging log to see the resolved URL in browser console
    console.log("Resolved API Endpoint:", API_URL);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        const allowedExtensions = ['.pdf', '.txt', '.csv'];

        if (selectedFile) {
            const fileExtension = selectedFile.name.toLowerCase().substring(selectedFile.name.lastIndexOf('.'));
            if (allowedExtensions.includes(fileExtension)) {
                setFile(selectedFile);
                setUploadStatus(null);
            } else {
                alert('Please select a valid PDF, TXT, or CSV file');
            }
        }
    };

    const handleReplaceFile = () => {
        setFile(null);
        setUploadStatus(null);
        setMessages([]);
        document.getElementById('file-input').click();
    };

    const handleUpload = async () => {
        if (!file) {
            alert('Please select a document file first');
            return;
        }

        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        if (!API_URL || API_URL === 'undefined') {
            setUploadStatus('error');
            alert("Configuration Error: VITE_API_URL is not set in Vercel environment variables.");
            setIsUploading(false);
            return;
        }

        try {
            const response = await fetch(`${API_URL}/upload`, {
                method: 'POST',
                body: formData,
            });

            const contentType = response.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                const text = await response.text();
                throw new Error(`Server returned non-JSON response. Status: ${response.status}. Body starts with: ${text.substring(0, 50)}`);
            }

            const data = await response.json();

            if (response.ok) {
                setUploadStatus('success');
                setMessages([{ type: 'bot', content: '✨ Document processed! I\'ve indexed the content and I\'m ready for your questions.' }]);
            } else {
                setUploadStatus('error');
                alert(`Upload failed: ${data.message || data.error || 'Unknown error'}`);
            }
        } catch (error) {
            setUploadStatus('error');
            alert(`Upload error: ${error.message}`);
        } finally {
            setIsUploading(false);
        }
    };

    const handleQuery = async (e) => {
        if (e) e.preventDefault();
        if (!query.trim() || isQuerying) return;

        const userMessage = { type: 'user', content: query };
        setMessages(prev => [...prev, userMessage]);
        const currentQuery = query;
        setQuery('');
        setIsQuerying(true);

        try {
            const response = await fetch(`${API_URL}/query`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: currentQuery.trim() }),
            });

            if (response.ok) {
                const data = await response.json();
                const botMessage = {
                    type: 'bot',
                    content: data.data || 'I couldn\'t find a specific answer in the document for that.'
                };
                setMessages(prev => [...prev, botMessage]);
            } else {
                setMessages(prev => [...prev, { type: 'error', content: 'Connection issue. Please check the server.' }]);
            }
        } catch (error) {
            setMessages(prev => [...prev, { type: 'error', content: 'Network error. Make sure the backend is running.' }]);
        } finally {
            setIsQuerying(false);
        }
    };

    const styles = {
        container: {
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
            color: '#f8fafc',
            fontFamily: "'Inter', system-ui, sans-serif",
            padding: '2rem 1rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
        },
        wrapper: {
            width: '100%',
            maxWidth: '1000px',
            display: 'flex',
            flexDirection: 'column',
            gap: '2rem'
        },
        glassCard: {
            background: 'rgba(30, 41, 59, 0.7)',
            backdropFilter: 'blur(12px)',
            borderRadius: '24px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.3)',
            padding: '2rem',
            transition: 'transform 0.3s ease'
        },
        titleSection: {
            textAlign: 'center',
            marginBottom: '1rem'
        },
        gradientText: {
            background: 'linear-gradient(90deg, #818cf8, #c084fc)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontSize: '2.5rem',
            fontWeight: '800',
            letterSpacing: '-0.025em',
            marginBottom: '0.5rem'
        },
        uploadZone: {
            display: 'flex',
            gap: '1rem',
            alignItems: 'center',
            flexWrap: 'wrap'
        },
        fileInput: {
            display: 'none'
        },
        customFileBtn: {
            flex: 1,
            minWidth: '200px',
            padding: '1rem',
            borderRadius: '16px',
            border: '2px dashed rgba(129, 140, 248, 0.5)',
            background: 'rgba(129, 140, 248, 0.05)',
            color: '#818cf8',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.5rem',
            transition: 'all 0.2s ease'
        },
        primaryBtn: {
            padding: '1rem 2rem',
            borderRadius: '16px',
            background: 'linear-gradient(90deg, #6366f1, #a855f7)',
            color: 'white',
            border: 'none',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            boxShadow: '0 10px 20px rgba(99, 102, 241, 0.3)',
            transition: 'all 0.2s ease'
        },
        chatBox: {
            height: '500px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            paddingRight: '0.5rem',
            marginBottom: '1.5rem',
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgba(255,255,255,0.1) transparent'
        },
        userBubble: {
            alignSelf: 'flex-end',
            background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
            padding: '1rem 1.25rem',
            borderRadius: '20px 20px 4px 20px',
            maxWidth: '80%',
            boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
        },
        botBubble: {
            alignSelf: 'flex-start',
            background: 'rgba(51, 65, 85, 0.5)',
            padding: '1rem 1.25rem',
            borderRadius: '20px 20px 20px 4px',
            maxWidth: '80%',
            border: '1px solid rgba(255,255,255,0.05)'
        },
        inputWrapper: {
            display: 'flex',
            gap: '0.75rem',
            background: 'rgba(15, 23, 42, 0.6)',
            padding: '0.5rem',
            borderRadius: '20px',
            border: '1px solid rgba(255,255,255,0.1)'
        },
        textInput: {
            flex: 1,
            background: 'transparent',
            border: 'none',
            color: 'white',
            padding: '0.75rem 1rem',
            fontSize: '1rem',
            outline: 'none'
        },
        sendBtn: {
            background: '#818cf8',
            color: 'white',
            border: 'none',
            width: '45px',
            height: '45px',
            borderRadius: '15px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
        }
    };

    return (
        <div style={styles.container}>
            {/* Background Glow */}
            <div style={{
                position: 'fixed',
                top: '-10%',
                left: '-10%',
                width: '40%',
                height: '40%',
                background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%)',
                zIndex: 0,
                pointerEvents: 'none'
            }} />
            <div style={{
                position: 'fixed',
                bottom: '-10%',
                right: '-10%',
                width: '40%',
                height: '40%',
                background: 'radial-gradient(circle, rgba(168, 85, 247, 0.1) 0%, transparent 70%)',
                zIndex: 0,
                pointerEvents: 'none'
            }} />

            <div style={{ ...styles.wrapper, position: 'relative', zIndex: 1 }}>
                <Header />

                {/* Glassmorphic Upload Card */}
                <div style={styles.glassCard}>
                    <div style={styles.uploadZone}>
                        <input id="file-input" type="file" onChange={handleFileChange} style={styles.fileInput} />
                        <label
                            htmlFor="file-input"
                            style={{
                                ...styles.customFileBtn,
                                borderColor: file ? '#818cf8' : 'rgba(129, 140, 248, 0.3)',
                                background: file ? 'rgba(129, 140, 248, 0.1)' : 'transparent'
                            }}
                            onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = '#818cf8'; }}
                            onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; if (!file) e.currentTarget.style.borderColor = 'rgba(129, 140, 248, 0.3)'; }}
                        >
                            <Upload size={24} />
                            <span>{file ? file.name : 'Choose PDF, CSV, or TXT'}</span>
                        </label>

                        {uploadStatus === 'success' ? (
                            <button onClick={handleReplaceFile} style={{ ...styles.primaryBtn, background: '#10b981' }}>
                                <CheckCircle size={20} />
                                Linked
                            </button>
                        ) : (
                            <button
                                onClick={handleUpload}
                                disabled={!file || isUploading}
                                style={{ ...styles.primaryBtn, opacity: (!file || isUploading) ? 0.6 : 1 }}
                                onMouseOver={(e) => { if (file && !isUploading) e.currentTarget.style.boxShadow = '0 15px 30px rgba(99, 102, 241, 0.5)'; }}
                                onMouseOut={(e) => { e.currentTarget.style.boxShadow = '0 10px 20px rgba(99, 102, 241, 0.3)'; }}
                            >
                                {isUploading ? <Loader2 className="animate-spin" size={20} /> : <FileText size={20} />}
                                {isUploading ? 'Syncing...' : 'Process Doc'}
                            </button>
                        )}
                    </div>
                </div>

                {/* Enhanced Chat Card */}
                <div style={{ ...styles.glassCard, flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div style={styles.chatBox}>
                        {messages.length === 0 ? (
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.4 }}>
                                <MessageCircle size={64} style={{ marginBottom: '1rem' }} />
                                <p>Upload a file to unlock the knowledge</p>
                            </div>
                        ) : (
                            messages.map((m, i) => (
                                <div key={i} style={m.type === 'user' ? styles.userBubble : m.type === 'error' ? { ...styles.botBubble, background: 'rgba(220, 38, 38, 0.1)', color: '#ef4444' } : styles.botBubble}>
                                    {m.content}
                                </div>
                            ))
                        )}
                        {isQuerying && (
                            <div style={styles.botBubble}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Loader2 className="animate-spin" size={16} />
                                    <span>Analyzing...</span>
                                </div>
                            </div>
                        )}
                    </div>

                    <form onSubmit={handleQuery} style={styles.inputWrapper}>
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Ask anything about the document..."
                            style={styles.textInput}
                        />
                        <button
                            type="submit"
                            disabled={!query.trim() || isQuerying}
                            style={{ ...styles.sendBtn, opacity: (!query.trim() || isQuerying) ? 0.5 : 1 }}
                        >
                            <Send size={20} />
                        </button>
                    </form>
                </div>

                <Footer />
            </div>

            <style>{`
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .animate-spin { animation: spin 1s linear infinite; }
                ::-webkit-scrollbar { width: 6px; }
                ::-webkit-scrollbar-track { background: transparent; }
                ::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 10px; }
                ::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.2); }
            `}</style>
        </div>
    );
};

export default PdfQaBot;