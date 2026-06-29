import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import './EmployeeManagement.css';

const EmployeeManagement = () => {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState(null);
    const [formData, setFormData] = useState({
        username: '', email: '', password: '', first_name: '', last_name: '',
        role: 'employee', employee_id: '', department: '', job_title: '',
        date_of_joining: '', salary: ''
    });

    useEffect(() => {
        fetchEmployees();
        const interval = setInterval(() => fetchEmployees(), 10000);
        return () => clearInterval(interval);
    }, []);

    const fetchEmployees = async () => {
        try {
            const response = await api.get('/employees/');
            setEmployees(response.data);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!editingEmployee && formData.password.length < 8) {
            alert('Password must be at least 8 characters long');
            return;
        }

        try {
            if (editingEmployee) {
                await api.patch(`/employees/${editingEmployee.id}/`, {
                    department: formData.department,
                    job_title: formData.job_title,
                    date_of_joining: formData.date_of_joining,
                    salary: formData.salary,
                    role: formData.role
                });
            } else {
                const userRes = await api.post('/auth/register/', {
                    username: formData.username,
                    email: formData.email,
                    password: formData.password,
                    first_name: formData.first_name,
                    last_name: formData.last_name,
                    role: formData.role
                });
                await api.post('/employees/', {
                    user: userRes.data.id,
                    employee_id: formData.employee_id,
                    department: formData.department,
                    job_title: formData.job_title,
                    date_of_joining: formData.date_of_joining,
                    salary: formData.salary
                });
            }
            setShowModal(false);
            setEditingEmployee(null);
            setFormData({ username: '', email: '', password: '', first_name: '', last_name: '', role: 'employee', employee_id: '', department: '', job_title: '', date_of_joining: '', salary: '' });
            fetchEmployees();
            alert('Employee saved successfully!');
        } catch (error) {
            console.error('Error:', error);
            alert('Error saving employee');
        }
    };

    const handleEdit = (emp) => {
        setEditingEmployee(emp);
        setFormData({
            employee_id: emp.employee_id,
            department: emp.department,
            job_title: emp.job_title,
            date_of_joining: emp.date_of_joining,
            salary: emp.salary,
            username: emp.user_details?.username || '',
            email: emp.user_details?.email || '',
            first_name: emp.user_details?.first_name || '',
            last_name: emp.user_details?.last_name || '',
            role: emp.user_details?.role || 'employee',
            password: ''
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this employee?')) {
            try {
                await api.delete(`/employees/${id}/`);
                fetchEmployees();
            } catch (error) {
                console.error('Error:', error);
                alert('Error deleting employee');
            }
        }
    };

    const filteredEmployees = employees.filter(emp =>
        emp.full_name?.toLowerCase().includes(search.toLowerCase()) ||
        emp.employee_id?.toLowerCase().includes(search.toLowerCase()) ||
        emp.department?.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) return <div className="loading">Loading...</div>;

    return (
        <div className="emp-management">
            <div className="page-header">
                <h1>Employee Management</h1>
                <button className="btn-primary" onClick={() => { setEditingEmployee(null); setFormData({ username: '', email: '', password: '', first_name: '', last_name: '', role: 'employee', employee_id: '', department: '', job_title: '', date_of_joining: '', salary: '' }); setShowModal(true); }}>
                    + Add Employee
                </button>
            </div>

            <div className="search-bar">
                <input type="text" placeholder="Search by name, ID or department..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>

            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Department</th>
                            <th>Job Title</th>
                            <th>Role</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredEmployees.map(emp => (
                            <tr key={emp.id}>
                                <td>{emp.employee_id}</td>
                                <td>{emp.full_name}</td>
                                <td>{emp.user_details?.email}</td>
                                <td>{emp.department}</td>
                                <td>{emp.job_title}</td>
                                <td><span className={`role-badge ${emp.user_details?.role}`}>{emp.user_details?.role}</span></td>
                                <td>
                                    <button className="btn-edit" onClick={() => handleEdit(emp)}>Edit</button>
                                    <button className="btn-delete" onClick={() => handleDelete(emp.id)}>Delete</button>
                                </td>
                            </tr>
                        ))}
                        {filteredEmployees.length === 0 && (
                            <tr>
                                <td colSpan="7" className="text-center">No employees found</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="modal">
                    <div className="modal-content">
                        <h3>{editingEmployee ? 'Edit Employee' : 'Add New Employee'}</h3>
                        <form onSubmit={handleSubmit}>
                            {!editingEmployee && (
                                <>
                                    <div className="form-row">
                                        <input type="text" name="username" placeholder="Username" value={formData.username} onChange={handleChange} required />
                                        <small className="form-hint">Username must be unique</small>
                                    </div>
                                    <div className="form-row"><input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required /></div>
                                    <div className="form-row"><input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} /></div>
                                    <div className="form-row"><input type="text" name="first_name" placeholder="First Name" value={formData.first_name} onChange={handleChange} /></div>
                                    <div className="form-row"><input type="text" name="last_name" placeholder="Last Name" value={formData.last_name} onChange={handleChange} /></div>
                                </>
                            )}
                            {editingEmployee && (
                                <div className="form-row">
                                    <label>Username: <strong>{formData.username}</strong></label>
                                    <input type="hidden" name="username" value={formData.username} />
                                </div>
                            )}
                            <div className="form-row">
                                <select name="role" value={formData.role} onChange={handleChange}>
                                    <option value="employee">Employee</option>
                                    <option value="hr">HR Manager</option>
                                </select>
                            </div>
                            <div className="form-row"><input type="text" name="employee_id" placeholder="Employee ID" value={formData.employee_id} onChange={handleChange} required /></div>
                            <div className="form-row"><input type="text" name="department" placeholder="Department" value={formData.department} onChange={handleChange} required /></div>
                            <div className="form-row"><input type="text" name="job_title" placeholder="Job Title" value={formData.job_title} onChange={handleChange} required /></div>
                            <div className="form-row"><input type="date" name="date_of_joining" value={formData.date_of_joining} onChange={handleChange} required /></div>
                            <div className="form-row"><input type="number" name="salary" placeholder="Salary" value={formData.salary} onChange={handleChange} required /></div>
                            <div className="modal-buttons">
                                <button type="submit" className="btn-primary">{editingEmployee ? 'Update' : 'Create'}</button>
                                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EmployeeManagement;