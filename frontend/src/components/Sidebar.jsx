import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import './Sidebar.css';

const Sidebar = () => {
    const { user } = useAuth();
    const location = useLocation();
    const [profilePic, setProfilePic] = useState(null);

    useEffect(() => {
        if (user) {
            api.get('/employees/')
                .then(res => {
                    const myEmp = res.data.find(e => e.user === user.id);
                    if (myEmp && myEmp.profile_picture) {
                        const baseUrl = process.env.REACT_APP_API_BASE || 'http://localhost:8000';
                        const url = myEmp.profile_picture.startsWith('http') ? myEmp.profile_picture : `${baseUrl}${myEmp.profile_picture}`;
                        setProfilePic(url);
                    }
                })
                .catch(err => console.error('Failed to load profile pic', err));
        }
    }, [user]);

    const isActive = (path) => location.pathname === path;

    return (
        <div className="sidebar">
            <div className="sidebar-user">
                <div className="user-avatar" style={{ overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {profilePic ? (
                        <img src={profilePic} alt="User Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                        <img src="/assets/WorkHive.png" alt="Default Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    )}
                </div>
                <h4>{user?.full_name || user?.username}</h4>
                <p className="user-role">{user?.role === 'hr' ? 'HR Manager' : 'Employee'}</p>
            </div>

            <nav className="sidebar-nav">
                {user?.role === 'hr' ? (
                    <>
                        <Link to="/hr/home" className={`sidebar-link ${isActive('/hr/home') ? 'active' : ''}`}>
                            <img src="/assets/Dashboard.png" alt="Home" className="sidebar-icon" />
                            <span>Home</span>
                        </Link>
                        <Link to="/hr/dashboard" className={`sidebar-link ${isActive('/hr/dashboard') ? 'active' : ''}`}>
                            <img src="/assets/Dashboard.png" alt="Dashboard" className="sidebar-icon" />
                            <span>Dashboard</span>
                        </Link>
                        <Link to="/hr/employees" className={`sidebar-link ${isActive('/hr/employees') ? 'active' : ''}`}>
                            <img src="/assets/Employees.png" alt="Employees" className="sidebar-icon" />
                            <span>Employee Management</span>
                        </Link>
                        <Link to="/hr/attendance-leave" className={`sidebar-link ${isActive('/hr/attendance-leave') ? 'active' : ''}`}>
                            <img src="/assets/Attendance.png" alt="Attendance" className="sidebar-icon" />
                            <span>Attendance & Leave</span>
                        </Link>
                        <Link to="/hr/payroll-performance" className={`sidebar-link ${isActive('/hr/payroll-performance') ? 'active' : ''}`}>
                            <img src="/assets/Payroll.png" alt="Payroll" className="sidebar-icon" />
                            <span>Payroll & Performance</span>
                        </Link>
                        <Link to="/employee/profile" className={`sidebar-link ${isActive('/employee/profile') ? 'active' : ''}`}>
                            <img src="/assets/Profile.png" alt="Profile" className="sidebar-icon" />
                            <span>Profile</span>
                        </Link>
                    </>
                ) : (
                    <>
                        <Link to="/dashboard" className={`sidebar-link ${isActive('/dashboard') ? 'active' : ''}`}>
                            <img src="/assets/Dashboard.png" alt="Dashboard" className="sidebar-icon" />
                            <span>Dashboard</span>
                        </Link>
                        <Link to="/employee/attendance" className={`sidebar-link ${isActive('/employee/attendance') ? 'active' : ''}`}>
                            <img src="/assets/Attendance.png" alt="Attendance" className="sidebar-icon" />
                            <span>Attendance & Leave</span>
                        </Link>
                        <Link to="/employee/staff" className={`sidebar-link ${isActive('/employee/staff') ? 'active' : ''}`}>
                            <img src="/assets/Employees.png" alt="Staff" className="sidebar-icon" />
                            <span>Staff List</span>
                        </Link>
                        <Link to="/employee/profile" className={`sidebar-link ${isActive('/employee/profile') ? 'active' : ''}`}>
                            <img src="/assets/Profile.png" alt="Profile" className="sidebar-icon" />
                            <span>My Profile</span>
                        </Link>
                    </>
                )}
            </nav>
        </div>
    );
};

export default Sidebar;