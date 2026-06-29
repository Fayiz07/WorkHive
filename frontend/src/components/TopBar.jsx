import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './TopBar.css';

const TopBar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="topbar">
            <div className="topbar-left">
                <img src="/assets/WorkHive.png" alt="Logo" className="topbar-logo" />
                <span className="topbar-title">WorkHive</span>
            </div>
            
            <div className="topbar-right">
                <span className="topbar-user">{user?.full_name || user?.username}</span>
                <button onClick={handleLogout} className="topbar-logout">
                    Logout
                </button>
            </div>
        </div>
    );
};

export default TopBar;