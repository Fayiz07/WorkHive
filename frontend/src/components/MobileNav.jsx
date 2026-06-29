import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './MobileNav.css';

const MobileNav = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    return (
        <div className="mobile-nav-container">
            <nav className="mobile-nav">
                {user?.role === 'hr' ? (
                    <>
                        <button onClick={() => navigate("/hr/home")}>
                            <img src="/assets/Dashboard.png" alt="Home" className="nav-icon" />
                            <span>Home</span>
                        </button>
                        <button onClick={() => navigate("/hr/dashboard")}>
                            <img src="/assets/Dashboard.png" alt="Dashboard" className="nav-icon" />
                            <span>Dashboard</span>
                        </button>
                        <button onClick={() => navigate("/hr/employees")}>
                            <img src="/assets/Employees.png" alt="Employees" className="nav-icon" />
                            <span>Employees</span>
                        </button>
                        <button onClick={() => navigate("/hr/attendance-leave")}>
                            <img src="/assets/Attendance.png" alt="Attendance" className="nav-icon" />
                            <span>Attendance</span>
                        </button>
                        <button onClick={() => navigate("/hr/payroll-performance")}>
                            <img src="/assets/Payroll.png" alt="Payroll" className="nav-icon" />
                            <span>Payroll</span>
                        </button>
                        <button onClick={() => navigate("/employee/profile")}>
                            <img src="/assets/Profile.png" alt="Profile" className="nav-icon" />
                            <span>Profile</span>
                        </button>
                    </>
                ) : (
                    <>
                        <button onClick={() => navigate("/dashboard")}>
                            <img src="/assets/Dashboard.png" alt="Dashboard" className="nav-icon" />
                            <span>Dashboard</span>
                        </button>
                        <button onClick={() => navigate("/employee/attendance")}>
                            <img src="/assets/Attendance.png" alt="Attendance" className="nav-icon" />
                            <span>Attendance</span>
                        </button>
                        <button onClick={() => navigate("/employee/staff")}>
                            <img src="/assets/Employees.png" alt="Staff" className="nav-icon" />
                            <span>Staff</span>
                        </button>
                        <button onClick={() => navigate("/employee/profile")}>
                            <img src="/assets/Profile.png" alt="Profile" className="nav-icon" />
                            <span>Profile</span>
                        </button>
                    </>
                )}
            </nav>
        </div>
    );
};

export default MobileNav;