import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import './PayrollPerformance.css';

const PayrollPerformance = () => {
    const [activeTab, setActiveTab] = useState('payroll');
    const [employees, setEmployees] = useState([]);
    const [payrolls, setPayrolls] = useState([]);
    const [performances, setPerformances] = useState([]);
    const [showPayrollModal, setShowPayrollModal] = useState(false);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [showProgressModal, setShowProgressModal] = useState(false);
    const [progressEmployee, setProgressEmployee] = useState(null);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [payrollForm, setPayrollForm] = useState({ month: '', basic_salary: '', deductions: 0, bonuses: 0 });
    const [reviewForm, setReviewForm] = useState({ rating: 3, feedback: '', goals: '' });
    const [payrollDepartmentFilter, setPayrollDepartmentFilter] = useState('');
    const [performanceDepartmentFilter, setPerformanceDepartmentFilter] = useState('');
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
        const interval = setInterval(() => fetchData(), 10000);
        return () => clearInterval(interval);
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const empRes = await api.get('/employees/');
            const payrollRes = await api.get('/payroll/');
            const perfRes = await api.get('/performance/');
            
            console.log('Employees:', empRes.data);
            console.log('Payroll:', payrollRes.data);
            console.log('Performance:', perfRes.data);
            
            setEmployees(empRes.data);
            setPayrolls(payrollRes.data);
            setPerformances(perfRes.data);
            
            const deptList = [...new Set(empRes.data.map(emp => emp.department).filter(Boolean))];
            setDepartments(deptList);
            
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const getEmployeeInfo = (userId) => {
        const emp = employees.find(e => e.user === userId);
        if (emp) {
            return {
                name: emp.full_name || emp.user_details?.full_name || 'Unknown',
                id: emp.employee_id || 'N/A',
                department: emp.department || 'N/A'
            };
        }
        return { name: 'Unknown', id: 'N/A', department: 'N/A' };
    };

    const runPayroll = async (e) => {
        e.preventDefault();
        try {
            if (!selectedEmployee) {
                alert('Please select an employee');
                return;
            }
            const netSalary = parseFloat(payrollForm.basic_salary) - parseFloat(payrollForm.deductions || 0) + parseFloat(payrollForm.bonuses || 0);
            
            const data = {
                employee: selectedEmployee.user,
                month: payrollForm.month,
                basic_salary: payrollForm.basic_salary,
                deductions: payrollForm.deductions || 0,
                bonuses: payrollForm.bonuses || 0,
                net_salary: netSalary,
                is_paid: true
            };
            
            console.log('Sending payroll data:', data);
            
            await api.post('/payroll/', data);
            setShowPayrollModal(false);
            setPayrollForm({ month: '', basic_salary: '', deductions: 0, bonuses: 0 });
            fetchData();
            alert('Salary slip generated successfully!');
        } catch (error) {
            console.error('Error:', error.response?.data || error.message);
            alert('Error: ' + (error.response?.data?.message || error.message));
        }
    };

    const submitReview = async (e) => {
        e.preventDefault();
        try {
            if (!selectedEmployee) {
                alert('Please select an employee');
                return;
            }
            await api.post('/performance/', {
                employee: selectedEmployee.user,
                rating: parseInt(reviewForm.rating),
                feedback: reviewForm.feedback,
                goals: reviewForm.goals || ''
            });
            setShowReviewModal(false);
            setReviewForm({ rating: 3, feedback: '', goals: '' });
            fetchData();
            alert('Review submitted successfully');
        } catch (error) {
            console.error('Error:', error);
            alert('Error submitting review');
        }
    };

    const markAsPaid = async (id) => {
        try {
            await api.patch(`/payroll/${id}/`, { is_paid: true });
            fetchData();
            alert('Salary marked as paid');
        } catch (error) {
            console.error('Error:', error);
            alert('Error marking as paid');
        }
    };

    const getRatingStars = (rating) => {
        return '⭐'.repeat(rating);
    };

    const generateSalarySlip = (payroll) => {
        const info = getEmployeeInfo(payroll.employee);
        const slipContent = `
========================================
            SALARY SLIP
========================================
Employee Name: ${info.name}
Employee ID: ${info.id}
Department: ${info.department}
Month: ${payroll.month}
----------------------------------------
Basic Salary: ₹${parseFloat(payroll.basic_salary).toLocaleString()}
Deductions: -₹${parseFloat(payroll.deductions).toLocaleString()}
Bonuses: +₹${parseFloat(payroll.bonuses).toLocaleString()}
----------------------------------------
Net Salary: ₹${parseFloat(payroll.net_salary).toLocaleString()}
Status: ${payroll.is_paid ? 'PAID ✅' : 'PENDING ⏳'}
========================================
        `;
        
        const blob = new Blob([slipContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Salary_Slip_${info.name}_${payroll.month}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const getFilteredPayrolls = () => {
        if (!payrollDepartmentFilter) return payrolls;
        const deptUserIds = employees.filter(emp => emp.department === payrollDepartmentFilter).map(emp => emp.user);
        return payrolls.filter(p => deptUserIds.includes(p.employee));
    };

    const getFilteredPerformances = () => {
        const hrUserIds = new Set(employees.filter(emp => emp.user_details?.role === 'hr').map(emp => emp.user));
        const all = performances.filter(p => !hrUserIds.has(p.employee));
        const filtered = performanceDepartmentFilter
            ? all.filter(p => {
                const deptUserIds = employees.filter(emp => emp.department === performanceDepartmentFilter).map(emp => emp.user);
                return deptUserIds.includes(p.employee);
              })
            : all;
        const latestMap = {};
        filtered.forEach(p => {
            const existing = latestMap[p.employee];
            if (!existing || new Date(p.review_date) > new Date(existing.review_date)) {
                latestMap[p.employee] = p;
            }
        });
        return Object.values(latestMap);
    };

    const getEmployeeAllReviews = (userId) => {
        return [...performances.filter(p => p.employee === userId)]
            .sort((a, b) => new Date(a.review_date) - new Date(b.review_date));
    };

    const filteredPayrolls = getFilteredPayrolls();
    const filteredPerformances = getFilteredPerformances();

    if (loading) {
        return <div className="loading">Loading...</div>;
    }

    return (
        <div className="payroll-perf">
            <h1>Payroll & Performance</h1>

            <div className="tabs">
                <button className={activeTab === 'payroll' ? 'tab-active' : 'tab'} onClick={() => setActiveTab('payroll')}>
                    💰 Payroll ({filteredPayrolls.length})
                </button>
                <button className={activeTab === 'performance' ? 'tab-active' : 'tab'} onClick={() => setActiveTab('performance')}>
                    📊 Performance Reviews ({filteredPerformances.length})
                </button>
            </div>

            {activeTab === 'payroll' && (
                <div>
                    <div className="action-bar">
                        <div className="filter-group">
                            <label>Filter by Department:</label>
                            <select 
                                className="filter-select"
                                value={payrollDepartmentFilter} 
                                onChange={(e) => setPayrollDepartmentFilter(e.target.value)}
                            >
                                <option value="">All Departments</option>
                                {departments.map(dept => (
                                    <option key={dept} value={dept}>{dept}</option>
                                ))}
                            </select>
                        </div>
                        <button className="btn-primary" onClick={() => { setSelectedEmployee(null); setShowPayrollModal(true); }}>
                            + Generate Salary Slip
                        </button>
                    </div>
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Employee</th>
                                    <th>Employee ID</th>
                                    <th>Department</th>
                                    <th>Month</th>
                                    <th>Basic Salary</th>
                                    <th>Deductions</th>
                                    <th>Bonuses</th>
                                    <th>Net Salary</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredPayrolls.length > 0 ? (
                                    filteredPayrolls.map(p => {
                                        const info = getEmployeeInfo(p.employee);
                                        return (
                                            <tr key={p.id}>
                                                <td><strong>{info.name}</strong></td>
                                                <td>{info.id}</td>
                                                <td>{info.department}</td>
                                                <td>{p.month}</td>
                                                <td>₹{parseFloat(p.basic_salary).toLocaleString()}</td>
                                                <td className="deductions">-₹{parseFloat(p.deductions).toLocaleString()}</td>
                                                <td className="bonuses">+₹{parseFloat(p.bonuses).toLocaleString()}</td>
                                                <td className="net-salary">₹{parseFloat(p.net_salary).toLocaleString()}</td>
                                                <td>
                                                    {p.is_paid ? (
                                                        <span className="status-paid">✅ Paid</span>
                                                    ) : (
                                                        <span className="status-pending">⏳ Pending</span>
                                                    )}
                                                </td>
                                                <td>
                                                    <button className="btn-slip" onClick={() => generateSalarySlip(p)}>📄 Slip</button>
                                                    {!p.is_paid && (
                                                        <button className="btn-paid" onClick={() => markAsPaid(p.id)}>Mark Paid</button>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="10" className="text-center">No payroll records found</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'performance' && (
                <div>
                    <div className="action-bar">
                        <div className="filter-group">
                            <label>Filter by Department:</label>
                            <select 
                                className="filter-select"
                                value={performanceDepartmentFilter} 
                                onChange={(e) => setPerformanceDepartmentFilter(e.target.value)}
                            >
                                <option value="">All Departments</option>
                                {departments.map(dept => (
                                    <option key={dept} value={dept}>{dept}</option>
                                ))}
                            </select>
                        </div>
                        <button className="btn-primary" onClick={() => { setSelectedEmployee(null); setShowReviewModal(true); }}>
                            + Write Review
                        </button>
                    </div>
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Employee</th>
                                    <th>Employee ID</th>
                                    <th>Department</th>
                                    <th>Reviewer</th>
                                    <th>Date</th>
                                    <th>Rating</th>
                                    <th>Feedback</th>
                                    <th>Goals</th>
                                    <th>Progress</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredPerformances.length > 0 ? (
                                    filteredPerformances.map(p => {
                                        const info = getEmployeeInfo(p.employee);
                                        return (
                                            <tr key={p.id}>
                                                <td><strong>{info.name}</strong></td>
                                                <td>{info.id}</td>
                                                <td>{info.department}</td>
                                                <td>{p.reviewer_name || 'N/A'}</td>
                                                <td>{p.review_date}</td>
                                                <td><span className="rating-stars">{getRatingStars(p.rating)}</span> ({p.rating}/5)</td>
                                                <td className="feedback-cell">{p.feedback}</td>
                                                <td className="goals-cell">{p.goals || '-'}</td>
                                                <td>
                                                    <button
                                                        className="btn-progress"
                                                        onClick={() => {
                                                            setProgressEmployee({ userId: p.employee, info });
                                                            setShowProgressModal(true);
                                                        }}
                                                    >
                                                        📈 Progress
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="9" className="text-center">No performance reviews found</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {showPayrollModal && (
                <div className="modal">
                    <div className="modal-content">
                        <h3>Generate Salary Slip</h3>
                        <form onSubmit={runPayroll}>
                            <div className="form-row">
                                <select required onChange={(e) => {
                                    const emp = employees.find(emp => emp.id === parseInt(e.target.value));
                                    setSelectedEmployee(emp);
                                }}>
                                    <option value="">Select Employee</option>
                                    {employees.map(emp => (
                                        <option key={emp.id} value={emp.id}>
                                            {emp.full_name || emp.user_details?.full_name || 'Unknown'} - {emp.employee_id} ({emp.department})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-row">
                                <input type="text" placeholder="Month (e.g., January 2024)" onChange={(e) => setPayrollForm({...payrollForm, month: e.target.value})} required />
                            </div>
                            <div className="form-row">
                                <input type="number" placeholder="Basic Salary" onChange={(e) => setPayrollForm({...payrollForm, basic_salary: e.target.value})} required />
                            </div>
                            <div className="form-row">
                                <input type="number" placeholder="Deductions" onChange={(e) => setPayrollForm({...payrollForm, deductions: e.target.value})} />
                            </div>
                            <div className="form-row">
                                <input type="number" placeholder="Bonuses" onChange={(e) => setPayrollForm({...payrollForm, bonuses: e.target.value})} />
                            </div>
                            <div className="modal-buttons">
                                <button type="submit" className="btn-primary">Generate Slip</button>
                                <button type="button" className="btn-secondary" onClick={() => setShowPayrollModal(false)}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showReviewModal && (
                <div className="modal">
                    <div className="modal-content">
                        <h3>Write Performance Review</h3>
                        <form onSubmit={submitReview}>
                            <div className="form-row">
                                <select required onChange={(e) => {
                                    const emp = employees.find(emp => emp.id === parseInt(e.target.value));
                                    setSelectedEmployee(emp);
                                }}>
                                    <option value="">Select Employee</option>
                                    {employees
                                        .filter(emp => emp.user_details?.role !== 'hr')
                                        .map(emp => (
                                        <option key={emp.id} value={emp.id}>
                                            {emp.full_name || emp.user_details?.full_name || 'Unknown'} - {emp.employee_id} ({emp.department})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-row">
                                <select onChange={(e) => setReviewForm({...reviewForm, rating: parseInt(e.target.value)})}>
                                    <option value="1">⭐ - Poor</option>
                                    <option value="2">⭐⭐ - Needs Improvement</option>
                                    <option value="3">⭐⭐⭐ - Meets Expectations</option>
                                    <option value="4">⭐⭐⭐⭐ - Exceeds Expectations</option>
                                    <option value="5">⭐⭐⭐⭐⭐ - Outstanding</option>
                                </select>
                            </div>
                            <div className="form-row">
                                <textarea placeholder="Feedback" rows="3" onChange={(e) => setReviewForm({...reviewForm, feedback: e.target.value})} required></textarea>
                            </div>
                            <div className="form-row">
                                <textarea placeholder="Goals (Optional)" rows="2" onChange={(e) => setReviewForm({...reviewForm, goals: e.target.value})}></textarea>
                            </div>
                            <div className="modal-buttons">
                                <button type="submit" className="btn-primary">Submit Review</button>
                                <button type="button" className="btn-secondary" onClick={() => setShowReviewModal(false)}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showProgressModal && progressEmployee && (() => {
                const reviews = getEmployeeAllReviews(progressEmployee.userId);
                const ratingLabels = ['', 'Poor', 'Needs Improvement', 'Meets Expectations', 'Exceeds Expectations', 'Outstanding'];
                return (
                    <div className="modal" onClick={() => setShowProgressModal(false)}>
                        <div className="modal-content progress-modal" onClick={e => e.stopPropagation()}>
                            <div className="progress-modal-header">
                                <div>
                                    <h3>📈 {progressEmployee.info.name}</h3>
                                    <p className="progress-sub">{progressEmployee.info.department} · {progressEmployee.info.id}</p>
                                </div>
                                <button className="progress-close" onClick={() => setShowProgressModal(false)}>✕</button>
                            </div>

                            {reviews.length === 0 ? (
                                <p className="progress-empty">No reviews found for this employee.</p>
                            ) : (
                                <>
                                    <div className="progress-chart">
                                        {reviews.map((r, i) => (
                                            <div key={r.id} className="progress-bar-col">
                                                <div className="progress-bar-wrap">
                                                    <div
                                                        className="progress-bar-fill"
                                                        style={{ height: `${(r.rating / 5) * 100}%`, background: r.rating >= 4 ? '#10b981' : r.rating === 3 ? '#f59e0b' : '#ef4444' }}
                                                    />
                                                    <span className="progress-bar-val">{r.rating}</span>
                                                </div>
                                                <span className="progress-bar-date">{new Date(r.review_date).toLocaleDateString('default', { month: 'short', year: '2-digit' })}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="progress-timeline">
                                        {[...reviews].reverse().map((r, i) => (
                                            <div key={r.id} className="timeline-item">
                                                <div className="timeline-dot" style={{ background: r.rating >= 4 ? '#10b981' : r.rating === 3 ? '#f59e0b' : '#ef4444' }} />
                                                <div className="timeline-body">
                                                    <div className="timeline-top">
                                                        <span className="timeline-stars">{getRatingStars(r.rating)}</span>
                                                        <span className="timeline-rating-label">{ratingLabels[r.rating]}</span>
                                                        <span className="timeline-date">{r.review_date}</span>
                                                    </div>
                                                    {r.reviewer_name && <p className="timeline-reviewer">Reviewed by: {r.reviewer_name}</p>}
                                                    <p className="timeline-feedback">{r.feedback}</p>
                                                    {r.goals && <p className="timeline-goals">🎯 {r.goals}</p>}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                );
            })()}
        </div>
    );
};

export default PayrollPerformance;