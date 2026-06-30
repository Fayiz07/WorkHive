import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { fetcher } from '../../services/api';
import useSWR from 'swr';
import './EmployeeDashboard.css';

const buildImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    const baseUrl = process.env.REACT_APP_API_BASE || 'http://localhost:8000';
    return `${baseUrl}${path}`;
};

const EmployeeDashboard = () => {
    const { user } = useAuth();
    const { data: events = [], isLoading: loadingEvents } = useSWR('/hr-dashboard/events/', fetcher, { refreshInterval: 10000 });
    const { data: promotions = [], isLoading: loadingPromotions } = useSWR('/hr-dashboard/promotions/', fetcher, { refreshInterval: 10000 });
    const currentYear = new Date().getFullYear();
    const { data: eoyData = [], isLoading: loadingEoy } = useSWR(`/hr-dashboard/eoy/?year=${currentYear}`, fetcher, { refreshInterval: 10000 });
    
    const employeeOfYear = eoyData.length > 0 ? eoyData[0] : null;
    const loading = loadingEvents || loadingPromotions || loadingEoy;

    if (loading) {
        return <div className="loading">Loading...</div>;
    }

    return (
        <div className="emp-dashboard">
            <h1>Welcome, {user?.full_name || user?.username}!</h1>
            <p className="welcome-sub">Here's what's happening at WorkHive</p>

            {/* EOY Card */}
            <div className="eoy-card">
                <div className="eoy-badge">🏆 Employee of the Year {new Date().getFullYear()}</div>
                {employeeOfYear ? (
                    <div className="eoy-content">
                        <div className="eoy-avatar-wrap">
                            {employeeOfYear.employee_profile_picture ? (
                                <img
                                    src={buildImageUrl(employeeOfYear.employee_profile_picture)}
                                    alt={employeeOfYear.employee_name}
                                    className="eoy-avatar-img"
                                    onError={(e) => {
                                        e.target.style.display = 'none';
                                        e.target.nextElementSibling.style.display = 'flex';
                                    }}
                                />
                            ) : null}
                            <div
                                className="eoy-avatar"
                                style={{ display: employeeOfYear.employee_profile_picture ? 'none' : 'flex' }}
                            >
                                {employeeOfYear.employee_name?.charAt(0) || '⭐'}
                            </div>
                        </div>
                        <div className="eoy-info">
                            <h2>{employeeOfYear.employee_name}</h2>
                            <p className="eoy-dept">{employeeOfYear.employee_details?.department || ''}</p>
                            <p className="eoy-reason">"{employeeOfYear.reason}"</p>
                        </div>
                    </div>
                ) : (
                    <div className="eoy-content">
                        <div className="eoy-avatar" style={{ display: 'flex' }}>⭐</div>
                        <div className="eoy-info">
                            <p className="eoy-reason">No Employee of the Year selected yet</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Grid */}
            <div className="dashboard-grid">

                {/* Promotions */}
                <div className="dash-card">
                    <div className="dash-card-header">📈 Recent Promotions</div>
                    {promotions.length > 0 ? (
                        promotions.map(p => (
                            <div key={p.id} className="promotion-item">
                                <div className="promo-row">
                                    <div className="promo-avatar">
                                        {p.employee_profile_picture ? (
                                            <img
                                                src={buildImageUrl(p.employee_profile_picture)}
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
                                            style={{ display: p.employee_profile_picture ? 'none' : 'flex' }}
                                        >
                                            {p.employee_name?.charAt(0) || '?'}
                                        </div>
                                    </div>
                                    <div className="promo-info">
                                        <strong>{p.employee_name}</strong>
                                        <div className="promotion-change">{p.from_position} → {p.to_position}</div>
                                        <div className="promotion-date">{p.date}</div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="no-data">No promotions yet</div>
                    )}
                </div>

                {/* Events */}
                <div className="dash-card">
                    <div className="dash-card-header">📅 Upcoming Events</div>
                    {events.length > 0 ? (
                        events.map(ev => (
                            <div key={ev.id} className="event-item">
                                {ev.image ? (
                                    <img
                                        src={buildImageUrl(ev.image)}
                                        alt={ev.title}
                                        className="event-image"
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
                                <div className="event-details">
                                    <strong>{ev.title}</strong>
                                    <p>{ev.description}</p>
                                    {ev.image && (
                                        <span className="event-date-small">
                                            {new Date(ev.date).toLocaleDateString('default', {
                                                day: 'numeric', month: 'short', year: 'numeric'
                                            })}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="no-data">No upcoming events</div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default EmployeeDashboard;