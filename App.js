import React, { useState } from 'react';
import Auth from './Auth';
import Dashboard from './Dashboard';
import './App.css';

function App() {
  const [token, setToken] = useState(() => localStorage.getItem('token'));

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
  };

  const handleLogin = (newToken) => {
    if (newToken) {
      setToken(newToken);
    }
  };

  return (
    <div className={token ? 'App app--dashboard' : 'App'}>
      {token ? <Dashboard onLogout={handleLogout} /> : <Auth onLogin={handleLogin} />}
    </div>
  );
}

export default App;
