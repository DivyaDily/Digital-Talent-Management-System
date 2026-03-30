import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

const Auth = ({ onLogin }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });

    const handleAction = async (e) => {
        e.preventDefault();
        
        // Validation
        if (!formData.email || !formData.password) {
            alert("Logged In Successfully!");
            return;
        }
        
        if (!isLogin && !formData.name) {
            alert("Please enter your full name");
            return;
        }
        
        const endpoint = isLogin ? 'login' : 'register';
        try {
            const res = await axios.post(`http://localhost:5000/api/auth/${endpoint}`, formData);
            alert(res.data.message || "Success!");
            if(isLogin && res.data.token) {
                localStorage.setItem('token', res.data.token);
                onLogin?.(res.data.token);
                setFormData({ name: '', email: '', password: '' });
            }
            if(!isLogin) {
                setIsLogin(true);
                setFormData({ name: '', email: '', password: '' });
            }
        } catch (err) {
            console.error('Error:', err);
            let errorMessage = "Something went wrong";
            
            if (err.response && err.response.data && err.response.data.message) {
                errorMessage = err.response.data.message;
            } else if (err.response && err.response.data && err.response.data.error) {
                errorMessage = err.response.data.error;
            } else if (err.message) {
                errorMessage = err.message;
            }
            
            alert(errorMessage);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-left">
                <div className="welcome-section">
                    <h1>Welcome to Digital Talent Management</h1>
                    <p>Streamline your tasks, track progress, and manage talents efficiently.</p>
                    <img src="/TAlentGrid.png" alt="Talent Management Illustration" className="hero-image" />
                </div>
            </div>
            <div className="auth-right">
                <div className="auth-card">
                    <div className="logo">
                        <img 
                            src="/TAlentGrid.png" 
                            alt="TAlentGrid Logo" 
                            style={{maxWidth: '200px', height: 'auto', marginBottom: '20px'}}
                            onError={(e) => {e.target.src = '/TAlentGrid.png'; console.log('Logo failed to load');}}
                        />
                        <h2>{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
                    </div>
                    <form onSubmit={handleAction} className="auth-form">
                        {!isLogin && (
                            <div className="input-group">
                                <label>Full Name</label>
                                <input type="text" placeholder="Enter your full name" required 
                                onChange={(e) => setFormData({...formData, name: e.target.value})} />
                            </div>
                        )}
                        <div className="input-group">
                            <label>Email Address</label>
                            <input type="email" placeholder="Enter your email" required 
                            onChange={(e) => setFormData({...formData, email: e.target.value})} />
                        </div>
                        <div className="input-group">
                            <label>Password</label>
                            <input type="password" placeholder="Enter your password" required 
                            onChange={(e) => setFormData({...formData, password: e.target.value})} />
                        </div>
                        <button type="submit" className="auth-btn">{isLogin ? 'Login' : 'Sign Up'}</button>
                    </form>
                    <p className="toggle-text" onClick={() => setIsLogin(!isLogin)}>
                        {isLogin ? "Don't have an account? " : "Already have an account? "}
                        <span className="toggle-link">{isLogin ? 'Register' : 'Login'}</span>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Auth;
