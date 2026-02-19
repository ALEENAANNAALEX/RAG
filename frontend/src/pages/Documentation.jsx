import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Book, Code, FileText, Zap, Settings, HelpCircle } from 'lucide-react';

const Documentation = () => {
    const [activeSection, setActiveSection] = useState('getting-started');

    const sections = [
        { id: 'getting-started', title: 'Getting Started', icon: <Zap size={20} /> },
        { id: 'upload', title: 'Upload Documents', icon: <FileText size={20} /> },
        { id: 'query', title: 'Query System', icon: <HelpCircle size={20} /> },
        { id: 'api', title: 'API Reference', icon: <Code size={20} /> },
        { id: 'advanced', title: 'Advanced Settings', icon: <Settings size={20} /> }
    ];

    const content = {
        'getting-started': {
            title: 'Getting Started with RAG QA',
            sections: [
                {
                    heading: 'What is RAG QA?',
                    content: 'RAG QA (Retrieval-Augmented Generation Question Answering) is an AI-powered system that allows you to ask questions about your documents and get accurate, contextual answers. It combines the power of vector search with large language models to understand and respond to your queries.'
                },
                {
                    heading: 'Quick Start',
                    content: 'Follow these simple steps to get started:',
                    list: [
                        'Navigate to the AI Chat or Doc Chat page',
                        'Upload your document (PDF, TXT, or CSV)',
                        'Wait for the document to be processed',
                        'Start asking questions!'
                    ]
                },
                {
                    heading: 'System Requirements',
                    content: 'RAG QA works on any modern web browser. For best performance, we recommend:',
                    list: [
                        'Chrome, Firefox, Safari, or Edge (latest version)',
                        'Stable internet connection',
                        'Documents under 50MB for optimal processing speed'
                    ]
                }
            ]
        },
        'upload': {
            title: 'Uploading Documents',
            sections: [
                {
                    heading: 'Supported Formats',
                    content: 'RAG QA currently supports the following document formats:',
                    list: [
                        'PDF (.pdf) - Portable Document Format',
                        'Text (.txt) - Plain text files',
                        'CSV (.csv) - Comma-separated values'
                    ]
                },
                {
                    heading: 'Upload Process',
                    content: 'When you upload a document, our system:',
                    list: [
                        'Extracts text content from your file',
                        'Splits the content into semantic chunks',
                        'Generates vector embeddings for each chunk',
                        'Stores embeddings in our vector database',
                        'Indexes the content for fast retrieval'
                    ]
                },
                {
                    heading: 'Best Practices',
                    content: 'For optimal results:',
                    list: [
                        'Use clear, well-formatted documents',
                        'Ensure text is searchable (not scanned images)',
                        'Keep file sizes reasonable (under 50MB)',
                        'Use descriptive filenames'
                    ]
                }
            ]
        },
        'query': {
            title: 'Querying Your Documents',
            sections: [
                {
                    heading: 'How to Ask Questions',
                    content: 'RAG QA uses natural language processing, so you can ask questions just like you would ask a person. Be specific and clear for best results.'
                },
                {
                    heading: 'Query Examples',
                    content: 'Here are some example queries:',
                    list: [
                        '"What is the main conclusion of this research paper?"',
                        '"Summarize the key findings in section 3"',
                        '"What are the recommended dosages mentioned?"',
                        '"List all the authors cited in this document"',
                        '"Explain the methodology used in this study"'
                    ]
                },
                {
                    heading: 'Tips for Better Results',
                    content: 'To get the most accurate answers:',
                    list: [
                        'Be specific in your questions',
                        'Reference specific sections or topics when possible',
                        'Ask one question at a time',
                        'Rephrase if the answer isn\'t what you expected',
                        'Use keywords from your document'
                    ]
                }
            ]
        },
        'api': {
            title: 'API Reference',
            sections: [
                {
                    heading: 'REST API Endpoints',
                    content: 'RAG QA provides the following API endpoints:',
                    code: true,
                    codeBlocks: [
                        {
                            title: 'Upload Document',
                            code: `POST /api/upload
Content-Type: multipart/form-data

{
  "file": <binary>
}`
                        },
                        {
                            title: 'Query Document',
                            code: `POST /api/query
Content-Type: application/json

{
  "query": "Your question here"
}`
                        },
                        {
                            title: 'AI Chat',
                            code: `POST /api/chat
Content-Type: application/json

{
  "message": "Your message",
  "sessionId": "unique-session-id"
}`
                        }
                    ]
                },
                {
                    heading: 'Response Format',
                    content: 'All API responses follow this structure:',
                    code: true,
                    codeBlocks: [
                        {
                            title: 'Success Response',
                            code: `{
  "success": true,
  "data": "Response content here"
}`
                        },
                        {
                            title: 'Error Response',
                            code: `{
  "success": false,
  "error": "Error message here"
}`
                        }
                    ]
                }
            ]
        },
        'advanced': {
            title: 'Advanced Settings',
            sections: [
                {
                    heading: 'Environment Variables',
                    content: 'Configure RAG QA using these environment variables:',
                    list: [
                        'VITE_API_URL - Backend API endpoint',
                        'OPENAI_API_KEY - OpenAI API key for embeddings',
                        'PINECONE_API_KEY - Pinecone vector database key',
                        'GROQ_API_KEY - Groq LLM API key'
                    ]
                },
                {
                    heading: 'Rate Limits',
                    content: 'Free tier limitations:',
                    list: [
                        '50 queries per day',
                        '100 documents maximum',
                        '10MB file size limit',
                        'Community support only'
                    ]
                },
                {
                    heading: 'Customization',
                    content: 'Pro and Enterprise users can customize:',
                    list: [
                        'Embedding model selection',
                        'Chunk size and overlap',
                        'Number of retrieved contexts',
                        'LLM temperature and parameters',
                        'Custom system prompts'
                    ]
                }
            ]
        }
    };

    const activeContent = content[activeSection];

    return (
        <div className="page-container">
            {/* Hero */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ textAlign: 'center', marginBottom: '3rem' }}
            >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginBottom: '1rem' }}>
                    <Book size={48} className="gradient-text" />
                    <h1 style={{ fontSize: '3rem', fontWeight: 800 }}>
                        <span className="gradient-text">Documentation</span>
                    </h1>
                </div>
                <p style={{ fontSize: '1.1rem', color: '#9ca3af' }}>
                    Everything you need to know about using RAG QA
                </p>
            </motion.div>

            <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: '2rem' }}>
                {/* Sidebar */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    style={{ position: 'sticky', top: '6rem', height: 'fit-content' }}
                >
                    <div className="card" style={{ padding: '1rem' }}>
                        {sections.map((section) => (
                            <button
                                key={section.id}
                                onClick={() => setActiveSection(section.id)}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem 1rem',
                                    marginBottom: '0.5rem',
                                    borderRadius: '8px',
                                    border: 'none',
                                    background: activeSection === section.id
                                        ? 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)'
                                        : 'transparent',
                                    color: 'white',
                                    cursor: 'pointer',
                                    textAlign: 'left',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.75rem',
                                    fontWeight: activeSection === section.id ? 600 : 400,
                                    transition: 'all 0.2s'
                                }}
                            >
                                {section.icon}
                                {section.title}
                            </button>
                        ))}
                    </div>
                </motion.div>

                {/* Content */}
                <motion.div
                    key={activeSection}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="card"
                >
                    <h2 style={{ fontSize: '2rem', marginBottom: '2rem', fontWeight: 700 }}>
                        {activeContent.title}
                    </h2>

                    {activeContent.sections.map((section, i) => (
                        <div key={i} style={{ marginBottom: '2.5rem' }}>
                            <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', fontWeight: 600, color: '#3b82f6' }}>
                                {section.heading}
                            </h3>
                            <p style={{ color: '#9ca3af', lineHeight: '1.8', marginBottom: '1rem' }}>
                                {section.content}
                            </p>
                            {section.list && (
                                <ul style={{ color: '#9ca3af', lineHeight: '1.8', marginLeft: '1.5rem' }}>
                                    {section.list.map((item, j) => (
                                        <li key={j} style={{ marginBottom: '0.5rem' }}>{item}</li>
                                    ))}
                                </ul>
                            )}
                            {section.codeBlocks && section.codeBlocks.map((block, j) => (
                                <div key={j} style={{ marginTop: '1rem' }}>
                                    <div style={{ color: '#9ca3af', fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: 600 }}>
                                        {block.title}
                                    </div>
                                    <pre style={{
                                        background: '#0a0a0b',
                                        padding: '1.5rem',
                                        borderRadius: '12px',
                                        overflow: 'auto',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        fontSize: '0.9rem',
                                        lineHeight: '1.6'
                                    }}>
                                        <code style={{ color: '#a5b4fc' }}>{block.code}</code>
                                    </pre>
                                </div>
                            ))}
                        </div>
                    ))}
                </motion.div>
            </div>
        </div>
    );
};

export default Documentation;
