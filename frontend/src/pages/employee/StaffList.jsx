import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import './StaffList.css';

const buildImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    const baseUrl = process.env.REACT_APP_API_BASE || 'http://localhost:8000';
    return `${baseUrl}${path}`;
};

const StaffList = () => {
    const [employees, setEmployees] = useState([]);
    const [performances, setPerformances] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedDepartment, setSelectedDepartment] = useState('');
    const [selectedRole, setSelectedRole] = useState('');
    const [departments, setDepartments] = useState([]);
    const [reviewsModal, setReviewsModal] = useState(null); // { name, reviews[] }

    useEffect(() => {
        fetchEmployees();
        const interval = setInterval(() => fetchEmployees(), 10000);
        return () => clearInterval(interval);
    }, []);

    const fetchEmployees = async () => {
        try {
            const [empRes, perfRes] = await Promise.all([
                api.get('/employees/'),
                api.get('/performance/')
            ]);
            setEmployees(empRes.data);
            setPerformances(perfRes.data);
            const deptList = [...new Set(empRes.data.map(emp => emp.department).filter(Boolean))];
            setDepartments(deptList);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    // Get the latest performance rating for a given employee (matched by user id)
    const getEmployeeRating = (userID) => {
        const empPerfs = performances.filter(p => p.employee === userID);
        if (empPerfs.length === 0) return null;
        // Return the most recent review's rating
        const latest = empPerfs.reduce((a, b) =>
            new Date(a.review_date) >= new Date(b.review_date) ? a : b
        );
        return latest.rating;
    };

    const renderStars = (rating) => {
        return Array.from({ length: 5 }, (_, i) => (
            <span key={i} className={i < rating ? 'star filled' : 'star empty'}>★</span>
        ));
    };

    const getEmployeeReviews = (userID) => {
        return [...performances.filter(p => p.employee === userID)]
            .sort((a, b) => new Date(b.review_date) - new Date(a.review_date));
    };

    const ratingLabel = (r) => ['', 'Poor', 'Needs Improvement', 'Meets Expectations', 'Exceeds Expectations', 'Outstanding'][r] || '';
    const ratingColor = (r) => r >= 4 ? '#10b981' : r === 3 ? '#f59e0b' : '#ef4444';

    const filteredEmployees = employees.filter(emp => {
        const name = emp.full_name || emp.user_details?.full_name || '';
        const matchesSearch =
            name.toLowerCase().includes(search.toLowerCase()) ||
            emp.employee_id?.toLowerCase().includes(search.toLowerCase());
        const matchesDepartment = !selectedDepartment || emp.department === selectedDepartment;
        const matchesRole = !selectedRole || emp.user_details?.role === selectedRole;
        return matchesSearch && matchesDepartment && matchesRole;
    });

    if (loading) return <div className="loading">Loading...</div>;

    return (
        <div className="staff-list">
            <div className="page-header">
                <h1>Staff Directory</h1>
                <p className="subtitle">
                    {filteredEmployees.length} of {employees.length} staff members
                </p>
            </div>

            {/* Filters */}
            <div className="filter-section">
                <div className="search-box">
                    <span className="search-icon">🔍</span>
                    <input
                        type="text"
                        placeholder="Search by name or ID..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    {search && (
                        <button className="search-clear" onClick={() => setSearch('')}>✕</button>
                    )}
                </div>

                <div className="filter-box">
                    <select
                        value={selectedDepartment}
                        onChange={(e) => setSelectedDepartment(e.target.value)}
                    >
                        <option value="">All Departments</option>
                        {departments.map(dept => (
                            <option key={dept} value={dept}>{dept}</option>
                        ))}
                    </select>
                </div>

                <div className="filter-box">
                    <select
                        value={selectedRole}
                        onChange={(e) => setSelectedRole(e.target.value)}
                    >
                        <option value="">All Roles</option>
                        <option value="hr">HR Manager</option>
                        <option value="employee">Employee</option>
                    </select>
                </div>

                {(search || selectedDepartment || selectedRole) && (
                    <button
                        className="clear-all-btn"
                        onClick={() => {
                            setSearch('');
                            setSelectedDepartment('');
                            setSelectedRole('');
                        }}
                    >
                        Clear All
                    </button>
                )}
            </div>

            {/* Active filter chips */}
            {(selectedDepartment || selectedRole) && (
                <div className="filter-chips">
                    {selectedDepartment && (
                        <div className="chip">
                            🏢 {selectedDepartment}
                            <button onClick={() => setSelectedDepartment('')}>✕</button>
                        </div>
                    )}
                    {selectedRole && (
                        <div className="chip">
                            👤 {selectedRole === 'hr' ? 'HR Manager' : 'Employee'}
                            <button onClick={() => setSelectedRole('')}>✕</button>
                        </div>
                    )}
                </div>
            )}

            {/* Staff Grid */}
            <div className="staff-grid">
                {filteredEmployees.map(emp => {
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
                                    {emp.user_details?.phone && (
                                        <p className="staff-phone">
                                            <span>📞</span> {emp.user_details.phone}
                                        </p>
                                    )}
                                    {emp.user_details?.email && (
                                        <p className="staff-email">
                                            <span>✉️</span> {emp.user_details.email}
                                        </p>
                                    )}
                                </div>
                                {!isHR && (() => {
                                    const rating = getEmployeeRating(emp.user);
                                    const allReviews = getEmployeeReviews(emp.user);
                                    return (
                                        <>
                                            {rating !== null && (
                                                <div className="staff-rating">
                                                    <div className="stars-row">{renderStars(rating)}</div>
                                                    <span className="rating-label">HR Review</span>
                                                </div>
                                            )}
                                            {allReviews.length > 0 && (
                                                <button
                                                    className="btn-view-reviews"
                                                    onClick={() => setReviewsModal({ name, reviews: allReviews })}
                                                >
                                                    📋 {allReviews.length} Review{allReviews.length > 1 ? 's' : ''}
                                                </button>
                                            )}
                                        </>
                                    );
                                })()}
                            </div>
                        </div>
                    );
                })}

                {filteredEmployees.length === 0 && (
                    <div className="no-results">
                        <div className="no-results-icon">🔍</div>
                        <p>No staff members found</p>
                        <span>Try adjusting your search or filters</span>
                    </div>
                )}
            </div>

            {/* Reviews Modal */}
            {reviewsModal && (
                <div className="sl-modal-overlay" onClick={() => setReviewsModal(null)}>
                    <div className="sl-modal" onClick={e => e.stopPropagation()}>
                        <div className="sl-modal-header">
                            <div>
                                <h3>📋 Reviews — {reviewsModal.name}</h3>
                                <p className="sl-modal-sub">{reviewsModal.reviews.length} total review{reviewsModal.reviews.length > 1 ? 's' : ''}</p>
                            </div>
                            <button className="sl-modal-close" onClick={() => setReviewsModal(null)}>✕</button>
                        </div>
                        <div className="sl-reviews-list">
                            {reviewsModal.reviews.map((r, i) => (
                                <div key={r.id} className="sl-review-card">
                                    <div className="sl-review-top">
                                        <div className="sl-review-stars">{renderStars(r.rating)}</div>
                                        <span className="sl-review-badge" style={{ background: ratingColor(r.rating) + '22', color: ratingColor(r.rating), border: `1px solid ${ratingColor(r.rating)}44` }}>
                                            {ratingLabel(r.rating)}
                                        </span>
                                        <span className="sl-review-date">{r.review_date}</span>
                                    </div>
                                    {r.reviewer_name && <p className="sl-review-reviewer">By: {r.reviewer_name}</p>}
                                    <p className="sl-review-feedback">{r.feedback}</p>
                                    {r.goals && <p className="sl-review-goals">🎯 {r.goals}</p>}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StaffList;