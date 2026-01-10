import React, { useState } from 'react';
import axios from 'axios';
import FedExLogo from './FedEx_Logo.png';   // <--- IMPORTANT fix

const Auth = ({ setRole }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async () => {
        try {
            const res = await axios.post('http://localhost:8000/auth/login', { username, password });

            if (res.data.role === 'agent') {
                if (username === 'agent1') setRole('agent1');
                else if (username === 'agent2') setRole('agent2');
                else setRole('agent');
            } else {
                setRole(res.data.role);
            }
        } catch (err) {
            const errorDetail = err.response?.data?.detail || JSON.stringify(err.response?.data) || 'Network error';
            alert('Login failed: ' + errorDetail);
            console.log('Login error:', err.response?.data);
        }
    };

    return (
        <div style={{
            fontFamily: 'Arial, sans-serif',
            backgroundImage: 'url(https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1950&q=80)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
        }}>
            <div style={{
                display: 'flex',
                width: '100%',
                maxWidth: '1200px',
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                borderRadius: '10px',
                boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
                overflow: 'hidden'
            }}>

                {/* LEFT PANEL */}
                <div style={{
                    flex: 1,
                    padding: '40px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    backgroundColor: '#4D148C',  // FedEx Purple
                    color: '#fff'
                }}>

                    {/* FedEx Logo */}
                    <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                        <img
                            src={FedExLogo}
                            alt="FedEx Logo"
                            style={{ width: '180px', height: 'auto' }}
                        />
                    </div>

                    <h1 style={{ fontSize: '2.3rem', marginBottom: '20px', textAlign: 'center' }}>
                        FedEx Recovery AI Portal
                    </h1>

                    <p style={{ fontSize: '1.15rem', marginBottom: '20px' }}>
                        Revolutionizing debt collection with AI automation, monitoring and smart decision systems.
                    </p>

                    <ul style={{ fontSize: '1rem', lineHeight: '1.6' }}>
                        <li><strong>AI Insights:</strong> Predict risk & performance.</li>
                        <li><strong>Automated Emails:</strong> AI personalized escalation.</li>
                        <li><strong>Role-based Access:</strong> Admin, Manager, Agent.</li>
                        <li><strong>Monitoring:</strong> Track breaches & SLAs in real-time.</li>
                        <li><strong>Integrated Tools:</strong> Analyze calls, emails & disputes.</li>
                    </ul>

                    <p style={{ fontSize: '1rem', marginTop: '20px', fontStyle: 'italic' }}>
                        Login to explore how AI transforms recoveries.
                    </p>
                </div>

                {/* RIGHT PANEL */}
                <div style={{
                    flex: 1,
                    padding: '40px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    backgroundColor: '#fff'
                }}>
                    <h2 style={{ textAlign: 'center', color: '#333', marginBottom: '25px' }}>Login</h2>

                    <input
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '15px',
                            marginBottom: '15px',
                            border: '1px solid #ddd',
                            borderRadius: '5px',
                            fontSize: '16px',
                            boxSizing: 'border-box'
                        }}
                    />

                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '15px',
                            marginBottom: '20px',
                            border: '1px solid #ddd',
                            borderRadius: '5px',
                            fontSize: '16px',
                            boxSizing: 'border-box'
                        }}
                    />

                    <button
                        onClick={handleLogin}
                        style={{
                            width: '100%',
                            padding: '15px',
                            backgroundColor: '#FF6600', // FedEx Orange
                            color: '#fff',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer',
                            fontSize: '16px',
                            fontWeight: 'bold'
                        }}
                    >
                        Login
                    </button>

                    <p style={{ textAlign: 'center', marginTop: '20px', color: '#666' }}>
                        Use: fedex_admin/pass, dca_manager/pass, agent1/pass, or agent2/pass
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Auth;
