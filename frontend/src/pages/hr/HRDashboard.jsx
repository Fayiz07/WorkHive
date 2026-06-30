import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import './HRDashboard.css';

const buildImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    const baseUrl = process.env.REACT_APP_API_BASE || 'http://localhost:8000';
    return `${baseUrl}${path}`;
};

const HRDashboard = () => {
    const [employees, setEmployees] = useState([]);
    const [events, setEvents] = useState([]);
    const [promotions, setPromotions] = useState([]);
    const [employeeOfYear, setEmployeeOfYear] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showEventForm, setShowEventForm] = useState(false);
    const [showEOYForm, setShowEOYForm] = useState(false);
    const [showPromotionForm, setShowPromotionForm] = useState(false);
    const [newEvent, setNewEvent] = useState({ title: '', date: '', description: '', image: null });
    const [imagePreview, setImagePreview] = useState(null);
    const [eoyData, setEOYData] = useState({ employee: '', reason: '' });
    const [promotionData, setPromotionData] = useState({ employee: '', from: '', to: '', date: '' });

    useEffect(() => {
        fetchData();
        const interval = setInterval(() => fetchData(), 10000);
        return () => clearInterval(interval);
    }, []);

    const fetchData = async () => {
        try {
            const empRes = await api.get('/employees/');
            const employeeList = empRes.data;
            setEmployees(employeeList);

            const eventsRes = await api.get('/hr-dashboard/events/');
            setEvents(eventsRes.data);

            const promRes = await api.get('/hr-dashboard/promotions/');
            setPromotions(promRes.data);

            const currentYear = new Date().getFullYear();
            const eoyRes = await api.get(`/hr-dashboard/eoy/?year=${currentYear}`);

            // Debug — remove after confirming
            console.log('Employees:', employeeList);
            console.log('EOY data:', eoyRes.data);
            console.log('Promotions:', promRes.data);
            console.log('Events:', eventsRes.data);

            if (eoyRes.data.length > 0) setEmployeeOfYear(eoyRes.data[0]);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    // Match EOY employee by id or user id (handles both API shapes)
    const getEOYEmployee = () => {
        if (!employeeOfYear || employees.length === 0) return null;
        return (
            employees.find(e => e.id === employeeOfYear.employee) ||
            employees.find(e => e.user === employeeOfYear.employee) ||
            null
        );
    };

    // Match promotion employee by id or user id
    const getPromoEmployee = (p) => {
        return (
            employees.find(e => e.id === p.employee) ||
            employees.find(e => e.user === p.employee) ||
            null
        );
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setNewEvent({ ...newEvent, image: file });
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleEventSubmit = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append('title', newEvent.title);
            formData.append('date', newEvent.date);
            formData.append('description', newEvent.description);
            if (newEvent.image) formData.append('image', newEvent.image);
            await api.post('/hr-dashboard/events/', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setShowEventForm(false);
            setNewEvent({ title: '', date: '', description: '', image: null });
            setImagePreview(null);
            fetchData();
        } catch (error) {
            console.error('Error:', error);
            alert('Error adding event');
        }
    };

    const handleEOYSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/hr-dashboard/eoy/', {
                employee: parseInt(eoyData.employee),
                year: new Date().getFullYear(),
                reason: eoyData.reason
            });
            setShowEOYForm(false);
            setEOYData({ employee: '', reason: '' });
            fetchData();
        } catch (error) {
            console.error('Error:', error);
            alert('Error selecting Employee of the Year');
        }
    };

    const handlePromotionSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/hr-dashboard/promotions/', {
                employee: parseInt(promotionData.employee),
                from_position: promotionData.from,
                to_position: promotionData.to,
                date: promotionData.date || new Date().toLocaleString('default', { month: 'short', year: 'numeric' })
            });
            setShowPromotionForm(false);
            setPromotionData({ employee: '', from: '', to: '', date: '' });
            fetchData();
        } catch (error) {
            console.error('Error:', error);
            alert('Error adding promotion');
        }
    };

    const deleteEvent = async (id) => {
        if (window.confirm('Delete this event?')) {
            try { await api.delete(`/hr-dashboard/events/${id}/`); fetchData(); }
            catch (error) { alert('Error deleting event'); }
        }
    };

    const deletePromotion = async (id) => {
        if (window.confirm('Delete this promotion?')) {
            try { await api.delete(`/hr-dashboard/promotions/${id}/`); fetchData(); }
            catch (error) { alert('Error deleting promotion'); }
        }
    };

    if (loading) return <div className="loading">Loading...</div>;

    const eoyEmployee = getEOYEmployee();

    return (
        <div className="hrd-page">
            <div className="hrd-header">
                <div>
                    <h1>HR Dashboard</h1>
                    <p className="hrd-sub">Manage events, recognitions & promotions</p>
                </div>
                <div className="hrd-actions">
                    <button className="hrd-btn" onClick={() => setShowEventForm(true)}>+ Add Event</button>
                    <button className="hrd-btn" onClick={() => setShowEOYForm(true)}>+ EOY Award</button>
                    <button className="hrd-btn hrd-btn-accent" onClick={() => setShowPromotionForm(true)}>+ Promotion</button>
                </div>
            </div>

            <div className="bento-grid">

                {/* EOY - Full width */}
                <div className="bento-card bento-eoy">
                    <div className="bento-label">🏆 Employee of the Year {new Date().getFullYear()}</div>
                    {employeeOfYear ? (
                        <div className="eoy-inner">
                            <div className="eoy-avatar-wrap">
                                {eoyEmployee?.profile_picture ? (
                                    <img
                                        src={buildImageUrl(eoyEmployee.profile_picture)}
                                        alt={employeeOfYear.employee_name}
                                        className="eoy-avatar-img"
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                            e.target.nextElementSibling.style.display = 'flex';
                                        }}
                                    />
                                ) : null}
                                <div
                                    className="eoy-avatar-initials"
                                    style={{ display: eoyEmployee?.profile_picture ? 'none' : 'flex' }}
                                >
                                    {employeeOfYear.employee_name?.charAt(0) || '⭐'}
                                </div>
                            </div>
                            <div className="eoy-info">
                                <h2 className="eoy-name">{employeeOfYear.employee_name}</h2>
                                {eoyEmployee?.department && (
                                    <p className="eoy-dept">{eoyEmployee.department}</p>
                                )}
                                <p className="eoy-reason">"{employeeOfYear.reason}"</p>
                            </div>
                            <div className="eoy-badge">⭐ Top Performer</div>
                        </div>
                    ) : (
                        <div className="bento-empty">No award selected yet for this year</div>
                    )}
                </div>

                {/* Events */}
                <div className="bento-card bento-events">
                    <div className="bento-label">
                        📅 Upcoming Events
                        <span className="bento-count">{events.length}</span>
                    </div>
                    <div className="event-list">
                        {events.length === 0 && (
                            <div className="bento-empty">No events added yet</div>
                        )}
                        {events.map(ev => (
                            <div key={ev.id} className="event-row">
                                {ev.image ? (
                                    <img
                                        src={buildImageUrl(ev.image)}
                                        alt={ev.title}
                                        className="event-thumb"
                                        onError={(e) => { e.target.style.display = 'none'; }}
                                    />
                                ) : (
                                    <div className="event-date-box">
                                        <span className="event-day">{new Date(ev.date).getDate()}</span>
                                        <span className="event-month">
                                            {new Date(ev.date).toLocaleString('default', { month: 'short' })}
                                        </span>
                                    </div>
                                )}
                                <div className="event-info">
                                    <strong>{ev.title}</strong>
                                    <span>{ev.description}</span>
                                    <span className="event-date-small">
                                        {new Date(ev.date).toLocaleDateString('default', {
                                            day: 'numeric', month: 'short', year: 'numeric'
                                        })}
                                    </span>
                                </div>
                                <button className="btn-del" onClick={() => deleteEvent(ev.id)}>✕</button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Promotions */}
                <div className="bento-card bento-promotions">
                    <div className="bento-label">
                        📈 Promotions
                        <span className="bento-count">{promotions.length}</span>
                    </div>
                    <div className="promo-list">
                        {promotions.length === 0 && (
                            <div className="bento-empty">No promotions added yet</div>
                        )}
                        {promotions.map(p => {
                            const emp = getPromoEmployee(p);
                            return (
                                <div key={p.id} className="promo-row">
                                    <div className="promo-avatar">
                                        {emp?.profile_picture ? (
                                            <img
                                                src={buildImageUrl(emp.profile_picture)}
                                                alt={p.employee_name}
                                                className="promo-avatar-img"
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                    e.target.nextElementSibling.style.display = 'flex';
                                                }}
                                            />
                                        ) : null}
                                        <div
                                            className="promo-avatar-initials"
                                            style={{ display: emp?.profile_picture ? 'none' : 'flex' }}
                                        >
                                            {p.employee_name?.charAt(0) || '?'}
                                        </div>
                                    </div>
                                    <div className="promo-info">
                                        <strong>{p.employee_name}</strong>
                                        <span className="promo-change">{p.from_position} → {p.to_position}</span>
                                        <span className="promo-date">{p.date}</span>
                                    </div>
                                    <button className="btn-del" onClick={() => deletePromotion(p.id)}>✕</button>
                                </div>
                            );
                        })}
                    </div>
                </div>

            </div>

            {/* Event Modal */}
            {showEventForm && (
                <div className="modal-overlay" onClick={() => setShowEventForm(false)}>
                    <div className="modal-box" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Add New Event</h3>
                            <button className="modal-close" onClick={() => setShowEventForm(false)}>✕</button>
                        </div>
                        <form onSubmit={handleEventSubmit}>
                            <div className="mfield">
                                <label>Event Title</label>
                                <input type="text" placeholder="e.g. Annual Company Picnic"
                                    value={newEvent.title}
                                    onChange={e => setNewEvent({ ...newEvent, title: e.target.value })}
                                    required />
                            </div>
                            <div className="mfield">
                                <label>Date</label>
                                <input type="date" value={newEvent.date}
                                    onChange={e => setNewEvent({ ...newEvent, date: e.target.value })}
                                    required />
                            </div>
                            <div className="mfield">
                                <label>Description</label>
                                <textarea placeholder="Brief description..." rows="3"
                                    value={newEvent.description}
                                    onChange={e => setNewEvent({ ...newEvent, description: e.target.value })} />
                            </div>
                            <div className="mfield">
                                <label>Event Image (optional)</label>
                                <input type="file" accept="image/*" onChange={handleImageChange} />
                                {imagePreview && (
                                    <img src={imagePreview} alt="Preview" className="modal-img-preview" />
                                )}
                            </div>
                            <div className="modal-btns">
                                <button type="submit" className="hrd-btn hrd-btn-accent">Add Event</button>
                                <button type="button" className="hrd-btn-ghost"
                                    onClick={() => setShowEventForm(false)}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* EOY Modal */}
            {showEOYForm && (
                <div className="modal-overlay" onClick={() => setShowEOYForm(false)}>
                    <div className="modal-box" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Employee of the Year</h3>
                            <button className="modal-close" onClick={() => setShowEOYForm(false)}>✕</button>
                        </div>
                        <form onSubmit={handleEOYSubmit}>
                            <div className="mfield">
                                <label>Select Employee</label>
                                <select required value={eoyData.employee}
                                    onChange={e => setEOYData({ ...eoyData, employee: e.target.value })}>
                                    <option value="">Choose an employee...</option>
                                    {employees.map(emp => (
                                        <option key={emp.id} value={emp.id}>
                                            {emp.full_name || emp.user_details?.full_name || 'Unknown'} — {emp.department}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="mfield">
                                <label>Reason</label>
                                <textarea placeholder="Why this employee deserves the award..." rows="3"
                                    value={eoyData.reason}
                                    onChange={e => setEOYData({ ...eoyData, reason: e.target.value })}
                                    required />
                            </div>
                            <div className="modal-btns">
                                <button type="submit" className="hrd-btn hrd-btn-accent">Select</button>
                                <button type="button" className="hrd-btn-ghost"
                                    onClick={() => setShowEOYForm(false)}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Promotion Modal */}
            {showPromotionForm && (
                <div className="modal-overlay" onClick={() => setShowPromotionForm(false)}>
                    <div className="modal-box" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Add Promotion</h3>
                            <button className="modal-close" onClick={() => setShowPromotionForm(false)}>✕</button>
                        </div>
                        <form onSubmit={handlePromotionSubmit}>
                            <div className="mfield">
                                <label>Select Employee</label>
                                <select required value={promotionData.employee}
                                    onChange={e => setPromotionData({ ...promotionData, employee: e.target.value })}>
                                    <option value="">Choose an employee...</option>
                                    {employees.map(emp => (
                                        <option key={emp.id} value={emp.id}>
                                            {emp.full_name || emp.user_details?.full_name || 'Unknown'} — {emp.department}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="mfield-row">
                                <div className="mfield">
                                    <label>From Position</label>
                                    <input type="text" placeholder="e.g. Senior Developer"
                                        value={promotionData.from}
                                        onChange={e => setPromotionData({ ...promotionData, from: e.target.value })}
                                        required />
                                </div>
                                <div className="mfield">
                                    <label>To Position</label>
                                    <input type="text" placeholder="e.g. Tech Lead"
                                        value={promotionData.to}
                                        onChange={e => setPromotionData({ ...promotionData, to: e.target.value })}
                                        required />
                                </div>
                            </div>
                            <div className="mfield">
                                <label>Date</label>
                                <input type="text" placeholder="e.g. Jan 2026"
                                    value={promotionData.date}
                                    onChange={e => setPromotionData({ ...promotionData, date: e.target.value })} />
                            </div>
                            <div className="modal-btns">
                                <button type="submit" className="hrd-btn hrd-btn-accent">Add Promotion</button>
                                <button type="button" className="hrd-btn-ghost"
                                    onClick={() => setShowPromotionForm(false)}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HRDashboard;