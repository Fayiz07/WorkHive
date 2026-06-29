import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import './HRHome.css';

const HRHome = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({ totalEmployees: 0, pendingLeaves: 0, pendingAttendance: 0, totalPayroll: 0 });
    const [leaveToday, setLeaveToday] = useState([]);
    const [allPayrolls, setAllPayrolls] = useState([]);
    const [selectedPayrollMonth, setSelectedPayrollMonth] = useState('All');

    useEffect(() => {
        fetchData();
        const interval = setInterval(() => {
            fetchData();
        }, 10000); // Poll every 10 seconds
        return () => clearInterval(interval);
    }, []);

    const fetchData = async () => {
        try {
            const employees = await api.get('/employees/');
            const leaves = await api.get('/leave/');
            const attendance = await api.get('/attendance/pending/');
            const payroll = await api.get('/payroll/');
            
            const today = new Date().toISOString().split('T')[0];
            const onLeave = leaves.data.filter(l => l.status === 'approved' && l.start_date <= today && l.end_date >= today);
            const uniqueLeaveToday = Array.from(new Map(onLeave.map(l => [l.employee, l])).values());
            setLeaveToday(uniqueLeaveToday);
            setStats({
                totalEmployees: employees.data.length,
                pendingLeaves: leaves.data.filter(l => l.status === 'pending').length,
                pendingAttendance: attendance.data.length,
                totalPayroll: 0
            });
            setAllPayrolls(payroll.data);
        } catch (error) { console.error('Error:', error); }
    };

    const uniqueMonths = [...new Set(allPayrolls.map(p => p.month).filter(Boolean))];
    const filteredPayrolls = selectedPayrollMonth === 'All'
        ? allPayrolls
        : allPayrolls.filter(p => p.month === selectedPayrollMonth);
    const dynamicTotalPayroll = filteredPayrolls.reduce((sum, p) => sum + parseFloat(p.net_salary || 0), 0);
    const formattedPayroll = `₹${dynamicTotalPayroll.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    
    let payrollFontSize = '32px';
    if (formattedPayroll.length > 16) payrollFontSize = '18px';
    else if (formattedPayroll.length > 12) payrollFontSize = '24px';

    return (
        <div className="hr-home">
            <h1>HR Home</h1>
            <p>Welcome back, {user?.full_name || user?.username}!</p>

            <div className="stats-grid">
                <div className="stat-card blue">
                    <div className="stat-icon">👥</div>
                    <div>
                        <h3>Total Employees</h3>
                        <div className="stat-number">{stats.totalEmployees}</div>
                    </div>
                </div>
                <div className="stat-card orange">
                    <div className="stat-icon">🏖️</div>
                    <div>
                        <h3>Pending Leaves</h3>
                        <div className="stat-number">{stats.pendingLeaves}</div>
                    </div>
                </div>
                <div className="stat-card purple">
                    <div className="stat-icon">⌛</div>
                    <div>
                        <h3>Pending Attendance</h3>
                        <div className="stat-number">{stats.pendingAttendance}</div>
                    </div>
                </div>
                <div className="stat-card teal">
                    <div className="stat-icon">💰</div>
                    <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                            <h3>Total Payroll</h3>
                            <select 
                                value={selectedPayrollMonth} 
                                onChange={e => setSelectedPayrollMonth(e.target.value)}
                                style={{ padding: '2px 6px', fontSize: '12px', borderRadius: '6px', border: '1px solid #e2e8f0', outline: 'none' }}
                            >
                                <option value="All">All Time</option>
                                {uniqueMonths.map(m => <option key={m} value={m}>{m}</option>)}
                            </select>
                        </div>
                        <div 
                            className="stat-number" 
                            style={{ fontSize: payrollFontSize, wordBreak: 'break-word', transition: 'font-size 0.2s' }}
                        >
                            {formattedPayroll}
                        </div>
                    </div>
                </div>
            </div>

            <div className="dashboard-grid">

                <div className="dash-card">
                    <div className="dash-card-header">👤 On Leave Today</div>
                    {leaveToday.map(l => (
                        <div key={l.id} className="request-item">
                            <strong>{l.employee_name}</strong>
                            <span>{l.leave_type}</span>
                            <span className="badge approved">Approved</span>
                        </div>
                    ))}
                    {leaveToday.length === 0 && <div className="no-data">No one on leave today</div>}
                </div>
            </div>
        </div>
    );
};

export default HRHome;