import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

const Auth = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });

    const handleAction = async (e) => {
        e.preventDefault();
        const endpoint = isLogin ? 'login' : 'register';
        try {
            const res = await axios.post(`http://localhost:5000/api/auth/${endpoint}`, formData);
            alert(res.data.message || "Success!");
            if(isLogin) localStorage.setItem('token', res.data.token);
        } catch (err) {
            alert(err.response.data.message || "Something went wrong");
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2>{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
                <form onSubmit={handleAction}>
                    {!isLogin && (
                        <input type="text" placeholder="Full Name" required 
                        onChange={(e) => setFormData({...formData, name: e.target.value})} />
                    )}
                    <input type="email" placeholder="Email Address" required 
                    onChange={(e) => setFormData({...formData, email: e.target.value})} />
                    <input type="password" placeholder="Password" required 
                    onChange={(e) => setFormData({...formData, password: e.target.value})} />
                    <button type="submit">{isLogin ? 'Login' : 'Sign Up'}</button>
                </form>
                <p onClick={() => setIsLogin(!isLogin)} style={{cursor:'pointer', marginTop:'15px', color:'#764ba2'}}>
                    {isLogin ? "Don't have an account? Register" : "Already have an account? Login"}
                </p>
            </div>
        </div>
    );
};

export default Auth;