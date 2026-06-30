import React, { useState } from 'react';
import api, { fetcher } from '../../services/api';
import useSWR, { mutate } from 'swr';
import './AttendancePage.css';

const AttendancePage = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const { data: attendances = [] } = useSWR('/attendance/my_requests/', fetcher, { refreshInterval: 10000 });
    const { data: leaves = [] } = useSWR('/leave/my/', fetcher, { refreshInterval: 10000 });
    const [showLeaveForm, setShowLeaveForm] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });
    const getLocalDateStr = () => {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    };
    const [leaveForm, setLeaveForm] = useState({ leave_type: 'casual', start_date: '', end_date: '', reason: '' });
    const [attendanceForm, setAttendanceForm] = useState({ date: getLocalDateStr(), check_in_time: '09:00', check_out_time: '17:00', notes: '' });
    const [showAttendanceForm, setShowAttendanceForm] = useState(false);
    const [leaveError, setLeaveError] = useState('');

    // Fetched via SWR

    const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

    const getStatusForDate = (date) => {
        const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        const attendance = attendances.find(a => a.date === dateStr);
        if (attendance) {
            if (attendance.status === 'approved') return { type: 'present', color: '#d1fae5', label: '✓ Present' };
            if (attendance.status === 'pending') return { type: 'pending', color: '#fef3c7', label: '⏳ Pending' };
            if (attendance.status === 'rejected') return { type: 'rejected', color: '#fee2e2', label: '✗ Rejected' };
        }
        const leave = leaves.find(l => { return dateStr >= l.start_date && dateStr <= l.end_date; });
        if (leave) {
            if (leave.status === 'approved') return { type: 'leave', color: '#dbeafe', label: '✓ Leave' };
            if (leave.status === 'pending') return { type: 'pending', color: '#fef3c7', label: '⏳ Leave Pending' };
            if (leave.status === 'rejected') return { type: 'rejected', color: '#fee2e2', label: '✗ Leave Rejected' };
        }
        
        const dayOfWeek = date.getDay();
        if (dayOfWeek === 0 || dayOfWeek === 6) {
            return { type: 'weekend', color: '#f1f5f9', label: '🏖️ Weekend' };
        }
        
        return { type: 'normal', color: 'white', label: '' };
    };

    const handleLeaveSubmit = async (e) => {
        e.preventDefault();
        
        const start = leaveForm.start_date;
        const end = leaveForm.end_date;
        const isOverlap = leaves.some(l => {
            return (start >= l.start_date && start <= l.end_date) || 
                   (end >= l.start_date && end <= l.end_date) ||
                   (start <= l.start_date && end >= l.end_date);
        });
        
        if (isOverlap) {
            setLeaveError('Error: You have already requested leave for some or all of these dates. Please wait for the response or choose different dates.');
            setTimeout(() => setLeaveError(''), 5000);
            return;
        }

        try {
            const formData = {
                leave_type: leaveForm.leave_type,
                start_date: leaveForm.start_date,
                end_date: leaveForm.end_date,
                reason: leaveForm.reason
            };
            console.log('Submitting leave:', formData);
            await api.post('/leave/', formData);
            setMessage({ text: 'Leave request submitted successfully!', type: 'success' });
            setShowLeaveForm(false);
            setLeaveError('');
            setLeaveForm({ leave_type: 'casual', start_date: '', end_date: '', reason: '' });
            mutate('/leave/my/');
            setTimeout(() => setMessage({ text: '', type: '' }), 3000);
        } catch (error) { 
            console.error('Error:', error.response?.data);
            setLeaveError('Error submitting leave request: ' + JSON.stringify(error.response?.data)); 
        }
    };

    const handleAttendanceSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/attendance/request/', attendanceForm);
            setMessage({ text: 'Attendance request submitted successfully!', type: 'success' });
            setShowAttendanceForm(false);
            setAttendanceForm({ date: getLocalDateStr(), check_in_time: '09:00', check_out_time: '17:00', notes: '' });
            mutate('/attendance/my_requests/');
            setTimeout(() => setMessage({ text: '', type: '' }), 3000);
        } catch (error) { setMessage({ text: 'Error submitting attendance request', type: 'error' }); }
    };

    const renderCalendar = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const daysInMonth = getDaysInMonth(year, month);
        const firstDay = getFirstDayOfMonth(year, month);
        const days = [];
        for (let i = 0; i < firstDay; i++) days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const status = getStatusForDate(date);
            days.push(<div key={day} className="calendar-day" style={{ backgroundColor: status.color, border: status.type !== 'normal' ? `2px solid ${status.type === 'present' ? '#10b981' : status.type === 'leave' ? '#3b82f6' : status.type === 'pending' ? '#f59e0b' : status.type === 'weekend' ? '#cbd5e1' : '#ef4444'}` : 'none' }}><span className="day-number">{day}</span>{status.label && <span className="day-status">{status.label}</span>}</div>);
        }
        return days;
    };

    const changeMonth = (delta) => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + delta, 1));
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    const getStatusBadge = (status) => {
        switch(status) {
            case 'approved': return <span className="badge approved">✅ Approved</span>;
            case 'rejected': return <span className="badge rejected">❌ Rejected</span>;
            default: return <span className="badge pending">⏳ Pending</span>;
        }
    };

    const getLeaveTypeLabel = (type) => {
        switch(type) {
            case 'casual': return 'Casual Leave';
            case 'sick': return 'Sick Leave';
            case 'annual': return 'Annual Leave';
            case 'unpaid': return 'Unpaid Leave';
            default: return type;
        }
    };

    return (
        <div className="attendance-page">
            <div className="page-header">
                <h1>Attendance & Leave Management</h1>
                <div className="header-buttons">
                    <button className="btn-primary" onClick={() => setShowAttendanceForm(true)}>📋 Request Attendance</button>
                    <button className="btn-primary" onClick={() => { setLeaveError(''); setShowLeaveForm(true); }}>🏖️ Apply Leave</button>
                </div>
            </div>

            {message.text && <div className={`message ${message.type}`}>{message.text}</div>}

            <div className="calendar-container">
                <div className="calendar-header">
                    <button onClick={() => changeMonth(-1)} className="month-nav">←</button>
                    <h2>{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h2>
                    <button onClick={() => changeMonth(1)} className="month-nav">→</button>
                </div>
                <div className="calendar-weekdays"><div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div></div>
                <div className="calendar-grid">{renderCalendar()}</div>
                <div className="calendar-legend">
                    <div className="legend-item"><span className="legend-color green"></span> Present / Approved</div>
                    <div className="legend-item"><span className="legend-color blue"></span> Leave Approved</div>
                    <div className="legend-item"><span className="legend-color orange"></span> Pending</div>
                    <div className="legend-item"><span className="legend-color red"></span> Rejected</div>
                    <div className="legend-item"><span className="legend-color gray"></span> Weekend</div>
                </div>
            </div>

            {showAttendanceForm && (<div className="modal"><div className="modal-content"><h3>Request Attendance</h3><form onSubmit={handleAttendanceSubmit}>
                <input type="date" value={attendanceForm.date} onChange={(e) => setAttendanceForm({...attendanceForm, date: e.target.value})} required />
                <input type="time" value={attendanceForm.check_in_time} placeholder="Check In Time" onChange={(e) => setAttendanceForm({...attendanceForm, check_in_time: e.target.value})} required />
                <input type="time" value={attendanceForm.check_out_time} placeholder="Check Out Time" onChange={(e) => setAttendanceForm({...attendanceForm, check_out_time: e.target.value})} />
                <textarea placeholder="Notes" onChange={(e) => setAttendanceForm({...attendanceForm, notes: e.target.value})}></textarea>
                <div className="modal-buttons"><button type="submit" className="btn-primary">Submit</button><button type="button" className="btn-secondary" onClick={() => setShowAttendanceForm(false)}>Cancel</button></div>
            </form></div></div>)}

            {showLeaveForm && (<div className="modal"><div className="modal-content"><h3>Apply for Leave</h3>
                {leaveError && <div className="message error" style={{ padding: '10px', fontSize: '13px', marginBottom: '16px' }}>{leaveError}</div>}
                <form onSubmit={handleLeaveSubmit}>
                <select onChange={(e) => setLeaveForm({...leaveForm, leave_type: e.target.value})}><option value="casual">Casual Leave</option><option value="sick">Sick Leave</option><option value="annual">Annual Leave</option><option value="unpaid">Unpaid Leave</option></select>
                <input type="date" placeholder="Start Date" onChange={(e) => setLeaveForm({...leaveForm, start_date: e.target.value})} required />
                <input type="date" placeholder="End Date" onChange={(e) => setLeaveForm({...leaveForm, end_date: e.target.value})} required />
                <textarea placeholder="Reason" onChange={(e) => setLeaveForm({...leaveForm, reason: e.target.value})} required></textarea>
                <div className="modal-buttons"><button type="submit" className="btn-primary">Submit</button><button type="button" className="btn-secondary" onClick={() => setShowLeaveForm(false)}>Cancel</button></div>
            </form></div></div>)}

            <div className="requests-section">
                <h3>My Leave Requests</h3>
                <div className="table-container">
                    <table className="data-table"><thead><tr><th>Type</th><th>Start Date</th><th>End Date</th><th>Duration</th><th>Reason</th><th>Status</th></tr></thead>
                    <tbody>{leaves.map(leave => { const start = new Date(leave.start_date); const end = new Date(leave.end_date); const duration = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
                    return <tr key={leave.id}><td>{getLeaveTypeLabel(leave.leave_type)}</td><td>{leave.start_date}</td><td>{leave.end_date}</td><td>{duration} day(s)</td><td>{leave.reason}</td><td>{getStatusBadge(leave.status)}</td></tr>})}
                    {leaves.length === 0 && <tr><td colSpan="6" className="text-center">No leave requests found</td></tr>}</tbody></table>
                </div>
            </div>

            <div className="requests-section">
                <h3>My Attendance Requests</h3>
                <div className="table-container">
                    <table className="data-table"><thead><tr><th>Date</th><th>Check In</th><th>Check Out</th><th>Status</th><th>Approved By</th><th>Notes</th></tr></thead>
                    <tbody>{attendances.map(att => <tr key={att.id}><td>{att.date}</td><td>{att.check_in_time}</td><td>{att.check_out_time || 'Not set'}</td><td>{getStatusBadge(att.status)}</td><td>{att.approver_name || '-'}</td><td>{att.notes || '-'}</td></tr>)}
                    {attendances.length === 0 && <tr><td colSpan="6" className="text-center">No attendance requests found</td></tr>}</tbody></table>
                </div>
            </div>
        </div>
    );
};

export default AttendancePage;