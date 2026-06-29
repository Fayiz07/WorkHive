import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import './AttendanceLeaveManagement.css';
import '../employee/StaffList.css';

const buildImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    const baseUrl = process.env.REACT_APP_API_BASE || 'http://localhost:8000';
    return `${baseUrl}${path}`;
};

const AttendanceLeaveManagement = () => {
    const [activeTab, setActiveTab] = useState('leaves');
    const [leaves, setLeaves] = useState([]);
    const [attendances, setAttendances] = useState([]);
    const [allAttendances, setAllAttendances] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [leaveToday, setLeaveToday] = useState([]);
    const [showLeaveToday, setShowLeaveToday] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [statsYear, setStatsYear] = useState(new Date().getFullYear());
    const [statsMonth, setStatsMonth] = useState(new Date().getMonth());
    const [selectedDepartment, setSelectedDepartment] = useState('');

    useEffect(() => {
        fetchData();
        const interval = setInterval(() => {
            fetchData();
        }, 10000); // Poll every 10 seconds
        return () => clearInterval(interval);
    }, []);

    const fetchData = async () => {
        try {
            const leavesRes = await api.get('/leave/');
            const attendanceRes = await api.get('/attendance/pending/');
            const allAttendanceRes = await api.get('/attendance/');
            const employeesRes = await api.get('/employees/');
            
            setLeaves(leavesRes.data);
            setAttendances(attendanceRes.data);
            setAllAttendances(allAttendanceRes.data);
            setEmployees(employeesRes.data);
            
            const today = new Date().toISOString().split('T')[0];
            const onLeaveToday = leavesRes.data.filter(l => l.status === 'approved' && l.start_date <= today && l.end_date >= today);
            const uniqueLeaveToday = Array.from(new Map(onLeaveToday.map(l => [l.employee, l])).values());
            setLeaveToday(uniqueLeaveToday);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const approveLeave = async (id) => {
        await api.put(`/leave/${id}/approve/`);
        fetchData();
    };

    const rejectLeave = async (id) => {
        await api.put(`/leave/${id}/reject/`);
        fetchData();
    };

    const approveAttendance = async (id) => {
        await api.put(`/attendance/${id}/approve/`);
        fetchData();
    };

    const rejectAttendance = async (id) => {
        await api.put(`/attendance/${id}/reject/`);
        fetchData();
    };

    const calculateEmployeeStats = (emp, targetYear, targetMonth) => {
        const now = new Date();
        const year = targetYear;
        const month = targetMonth;
        
        const monthStart = new Date(year, month, 1);
        let startDate = monthStart;
        if (emp.date_of_joining) {
            const joiningDate = new Date(emp.date_of_joining);
            if (joiningDate > monthStart) {
                startDate = joiningDate;
            }
        }
        
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        let totalWorkingDays = 0;
        let pastWorkingDays = 0;
        
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            if (date >= startDate) {
                const dayOfWeek = date.getDay();
                if (dayOfWeek !== 0 && dayOfWeek !== 6) {
                    totalWorkingDays++;
                    if (date <= now) {
                        pastWorkingDays++;
                    }
                }
            }
        }
        
        const currentMonthPrefix = `${year}-${String(month + 1).padStart(2, '0')}`;
        
        const empAttendances = allAttendances.filter(a => 
            a.employee === emp.user && 
            a.status === 'approved' &&
            a.date.startsWith(currentMonthPrefix) &&
            a.date >= startDate.toISOString().split('T')[0]
        );
        
        const daysWorked = empAttendances.length;
        
        let approvedLeaveDays = 0;
        const empLeaves = leaves.filter(l => l.employee === emp.user && l.status === 'approved');
        
        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const date = new Date(year, month, day);
            if (date >= startDate && date <= now) {
                const dayOfWeek = date.getDay();
                if (dayOfWeek !== 0 && dayOfWeek !== 6) {
                    const hasLeave = empLeaves.some(l => dateStr >= l.start_date && dateStr <= l.end_date);
                    if (hasLeave) {
                        approvedLeaveDays++;
                    }
                }
            }
        }
        
        const unexcusedAbsences = Math.max(0, pastWorkingDays - daysWorked - approvedLeaveDays);
        
        let totalHoursWorked = 0;
        empAttendances.forEach(att => {
            if (att.check_in_time && att.check_out_time) {
                const inTime = new Date(`1970-01-01T${att.check_in_time}`);
                const outTime = new Date(`1970-01-01T${att.check_out_time}`);
                const diffHours = (outTime - inTime) / (1000 * 60 * 60);
                if (diffHours > 0) totalHoursWorked += diffHours;
            }
        });

        return {
            totalWorkingDays,
            pastWorkingDays,
            daysWorked,
            approvedLeaveDays,
            unexcusedAbsences,
            expectedHours: totalWorkingDays * 8,
            hoursWorked: Math.round(totalHoursWorked * 10) / 10
        };
    };

    if (loading) return <div className="loading">Loading...</div>;

    return (
        <div className="attendance-leave-mgmt">
            <div className="page-header">
                <h1>Attendance & Leave Management</h1>
                <button className="btn-leave-today" onClick={() => setShowLeaveToday(true)}>
                    📋 Who is on Leave Today? ({leaveToday.length})
                </button>
            </div>

            <div className="tabs">
                <button className={activeTab === 'leaves' ? 'tab-active' : 'tab'} onClick={() => setActiveTab('leaves')}>
                    Leave Requests ({leaves.filter(l => l.status === 'pending').length})
                </button>
                <button className={activeTab === 'attendance' ? 'tab-active' : 'tab'} onClick={() => setActiveTab('attendance')}>
                    Attendance Requests ({attendances.length})
                </button>
                <button className={activeTab === 'employees' ? 'tab-active' : 'tab'} onClick={() => setActiveTab('employees')}>
                    Employees ({employees.filter(emp => emp.user_details?.role !== 'hr').length})
                </button>
            </div>

            {activeTab === 'leaves' && (
                <div className="requests-container">
                    <h3 className="section-title">Pending Requests</h3>
                    {leaves.filter(l => l.status === 'pending').map(leave => (
                        <div key={leave.id} className="request-card">
                            <div className="request-info">
                                <h3>{leave.employee_name}</h3>
                                <p><strong>{leave.leave_type}</strong> • {leave.start_date} to {leave.end_date}</p>
                                <p className="reason">{leave.reason}</p>
                                <span className="applied-on">Applied: {new Date(leave.applied_on).toLocaleDateString()}</span>
                            </div>
                            <div className="request-actions">
                                <button onClick={() => approveLeave(leave.id)} className="btn-approve">✓ Approve</button>
                                <button onClick={() => rejectLeave(leave.id)} className="btn-reject">✗ Reject</button>
                            </div>
                        </div>
                    ))}
                    {leaves.filter(l => l.status === 'pending').length === 0 && <div className="no-data">No pending leave requests</div>}
                    
                    <h3 className="section-title">History</h3>
                    {leaves.filter(l => l.status !== 'pending').map(leave => (
                        <div key={leave.id} className={`request-card small ${leave.status}`}>
                            <div className="request-info">
                                <strong>{leave.employee_name}</strong> • {leave.leave_type} • {leave.start_date} to {leave.end_date}
                            </div>
                            <div className="request-status">
                                {leave.status === 'approved' ? '✓ Approved' : '✗ Rejected'}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {activeTab === 'attendance' && (
                <div className="requests-container">
                    <h3 className="section-title">Pending Attendance Requests</h3>
                    {attendances.map(att => (
                        <div key={att.id} className="request-card">
                            <div className="request-info">
                                <h3>{att.employee_name}</h3>
                                <p><strong>Date:</strong> {att.date} • <strong>In:</strong> {att.check_in_time} • <strong>Out:</strong> {att.check_out_time || 'Not set'}</p>
                                <p className="reason">{att.notes || 'No notes provided'}</p>
                            </div>
                            <div className="request-actions">
                                <button onClick={() => approveAttendance(att.id)} className="btn-approve">✓ Approve</button>
                                <button onClick={() => rejectAttendance(att.id)} className="btn-reject">✗ Reject</button>
                            </div>
                        </div>
                    ))}
                    {attendances.length === 0 && <div className="no-data">No pending attendance requests</div>}
                </div>
            )}

            {activeTab === 'employees' && (
                <div className="requests-container">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h3 className="section-title" style={{ margin: 0 }}>Employee Directory</h3>
                        <select 
                            value={selectedDepartment} 
                            onChange={e => setSelectedDepartment(e.target.value)}
                            style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', fontWeight: '500', outline: 'none' }}
                        >
                            <option value="">All Departments</option>
                            {[...new Set(employees.filter(emp => emp.user_details?.role !== 'hr').map(emp => emp.department).filter(Boolean))].map(dept => (
                                <option key={dept} value={dept}>{dept}</option>
                            ))}
                        </select>
                    </div>
                    <div className="staff-grid">
                        {employees.filter(emp => emp.user_details?.role !== 'hr').filter(emp => !selectedDepartment || emp.department === selectedDepartment).map(emp => {
                            const isHR = emp.user_details?.role === 'hr';
                            const name = emp.full_name || emp.user_details?.full_name || 'Unknown';
                            const initial = name.charAt(0).toUpperCase();
                            
                            return (
                                <div key={emp.id} className={`staff-card ${isHR ? 'staff-card-hr' : ''}`}>
                                    {isHR && <div className="hr-ribbon">HR</div>}

                                    <div className="staff-avatar">
                                        {emp.profile_picture ? (
                                            <img
                                                src={buildImageUrl(emp.profile_picture)}
                                                alt={name}
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                    e.target.nextElementSibling.style.display = 'flex';
                                                }}
                                            />
                                        ) : null}
                                        <div
                                            className="avatar-placeholder"
                                            style={{ display: emp.profile_picture ? 'none' : 'flex' }}
                                        >
                                            {initial}
                                        </div>
                                    </div>

                                    <div className="staff-info">
                                        <h3>{name}</h3>
                                        <span className={`role-badge ${isHR ? 'role-badge-hr' : 'role-badge-emp'}`}>
                                            {isHR ? '👔 HR Manager' : '👤 Employee'}
                                        </span>
                                        <div className="staff-meta">
                                            <p className="staff-id">
                                                <span>🪪</span> {emp.employee_id}
                                            </p>
                                            {emp.department && (
                                                <p className="staff-department">
                                                    <span>🏢</span> {emp.department}
                                                </p>
                                            )}
                                            {emp.job_title && (
                                                <p className="staff-jobtitle">
                                                    <span>💼</span> {emp.job_title}
                                                </p>
                                            )}
                                        </div>
                                        <button className="btn-view-reviews" style={{ marginTop: '16px', background: '#ecfdf5', color: '#059669' }} onClick={() => setSelectedEmployee(emp)}>
                                            📊 View Monthly Stats
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {selectedEmployee && (
                <div className="modal">
                    <div className="modal-content employee-stats-modal">
                        <div className="stats-header">
                            {(() => {
                                const name = selectedEmployee.full_name || selectedEmployee.user_details?.full_name || 'Unknown';
                                const initial = name.charAt(0).toUpperCase();
                                return (
                                    <>
                                        <div className="staff-avatar" style={{ width: '64px', height: '64px', minWidth: '64px', fontSize: '28px', borderRadius: '20px' }}>
                                            {selectedEmployee.profile_picture ? (
                                                <img
                                                    src={buildImageUrl(selectedEmployee.profile_picture)}
                                                    alt={name}
                                                    onError={(e) => {
                                                        e.target.style.display = 'none';
                                                        e.target.nextElementSibling.style.display = 'flex';
                                                    }}
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '20px' }}
                                                />
                                            ) : null}
                                            <div
                                                className="avatar-placeholder"
                                                style={{ display: selectedEmployee.profile_picture ? 'none' : 'flex', width: '100%', height: '100%', borderRadius: '20px' }}
                                            >
                                                {initial}
                                            </div>
                                        </div>
                                        <div>
                                            <h3>{name}</h3>
                                            <p>{selectedEmployee.job_title} • {selectedEmployee.department}</p>
                                        </div>
                                    </>
                                );
                            })()}
                        </div>
                        
                        {(() => {
                            const stats = calculateEmployeeStats(selectedEmployee, statsYear, statsMonth);
                            const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
                            const currentYear = new Date().getFullYear();
                            
                            let startYear = currentYear;
                            if (selectedEmployee.date_of_joining) {
                                const joinYear = new Date(selectedEmployee.date_of_joining).getFullYear();
                                if (joinYear <= currentYear) startYear = joinYear;
                            }
                            const years = [];
                            for (let y = startYear; y <= currentYear; y++) years.push(y);
                            
                            return (
                                <div className="stats-body">
                                    <div className="stats-controls" style={{ display: 'flex', gap: '10px', marginBottom: '20px', alignItems: 'center' }}>
                                        <h4 className="month-title" style={{ margin: 0, flex: 1 }}>Summary</h4>
                                        <select 
                                            value={statsMonth} 
                                            onChange={e => setStatsMonth(parseInt(e.target.value))}
                                            style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#f8fafc', fontWeight: '600' }}
                                        >
                                            {monthNames.map((m, i) => <option key={i} value={i}>{m}</option>)}
                                        </select>
                                        <select 
                                            value={statsYear} 
                                            onChange={e => setStatsYear(parseInt(e.target.value))}
                                            style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#f8fafc', fontWeight: '600' }}
                                        >
                                            {years.map(y => <option key={y} value={y}>{y}</option>)}
                                        </select>
                                    </div>
                                    
                                    <div className="stats-grid">
                                        <div className="stat-box">
                                            <span className="stat-label">Working Days (Excl. Weekends)</span>
                                            <span className="stat-value">{stats.totalWorkingDays} days</span>
                                        </div>
                                        <div className="stat-box highlight">
                                            <span className="stat-label">Days Worked</span>
                                            <span className="stat-value">{stats.daysWorked} <small>/ {stats.totalWorkingDays}</small></span>
                                        </div>
                                        <div className="stat-box highlight-purple">
                                            <span className="stat-label">Approved Leaves</span>
                                            <span className="stat-value">{stats.approvedLeaveDays} days</span>
                                        </div>
                                        <div className="stat-box highlight-orange">
                                            <span className="stat-label">Auto-Absences</span>
                                            <span className="stat-value">{stats.unexcusedAbsences} days</span>
                                        </div>
                                        <div className="stat-box">
                                            <span className="stat-label">Expected Hours (8hr/day)</span>
                                            <span className="stat-value">{stats.expectedHours} hrs</span>
                                        </div>
                                        <div className="stat-box highlight-blue">
                                            <span className="stat-label">Actual Hours Logged</span>
                                            <span className="stat-value">{stats.hoursWorked} <small>/ {stats.expectedHours}</small></span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })()}
                        
                        <div className="modal-actions mt-4">
                            <button className="btn-secondary w-full" onClick={() => setSelectedEmployee(null)}>Close</button>
                        </div>
                    </div>
                </div>
            )}

            {showLeaveToday && (
                <div className="modal">
                    <div className="modal-content">
                        <h3>📋 Employees on Leave Today</h3>
                        {leaveToday.length === 0 ? (
                            <p className="no-data">No employees on leave today</p>
                        ) : (
                            leaveToday.map(leave => (
                                <div key={leave.id} className="leave-today-item">
                                    <strong>{leave.employee_name}</strong>
                                    <span>{leave.leave_type}</span>
                                    <span>{leave.start_date} to {leave.end_date}</span>
                                    <p>{leave.reason}</p>
                                </div>
                            ))
                        )}
                        <button className="btn-secondary" onClick={() => setShowLeaveToday(false)}>Close</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AttendanceLeaveManagement;