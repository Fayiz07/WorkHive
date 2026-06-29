import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const CreateEmployee = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        first_name: '',
        last_name: '',
        role: 'employee',
        employee_id: '',
        department: '',
        job_title: '',
        date_of_joining: '',
        salary: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (formData.password.length < 8) {
            setError('Password must be at least 8 characters long');
            setLoading(false);
            return;
        }

        try {
            // Step 1: Create User
            const userResponse = await api.post('/auth/register/', {
                username: formData.username,
                email: formData.email,
                password: formData.password,
                first_name: formData.first_name,
                last_name: formData.last_name,
                role: formData.role
            });

            // Step 2: Create Employee Profile
            await api.post('/employees/', {
                user: userResponse.data.id,
                employee_id: formData.employee_id,
                department: formData.department,
                job_title: formData.job_title,
                date_of_joining: formData.date_of_joining,
                salary: formData.salary
            });

            navigate('/hr/employees');
        } catch (err) {
            setError(err.response?.data?.message || 'Error creating employee');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Add New Employee</h1>
                <button className="btn-secondary" onClick={() => navigate('/hr/employees')}>
                    Cancel
                </button>
            </div>

            {error && <div className="error-message">{error}</div>}

            <form onSubmit={handleSubmit} className="form-container">
                <div className="form-section">
                    <h3>Account Information</h3>
                    <div className="form-grid">
                        <div className="form-group">
                            <label>Username *</label>
                            <input type="text" name="username" required onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label>Email *</label>
                            <input type="email" name="email" required onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label>Password *</label>
                            <input type="password" name="password" onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label>First Name</label>
                            <input type="text" name="first_name" onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label>Last Name</label>
                            <input type="text" name="last_name" onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label>Role</label>
                            <select name="role" onChange={handleChange}>
                                <option value="employee">Employee</option>
                                <option value="hr">HR Manager</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="form-section">
                    <h3>Employment Information</h3>
                    <div className="form-grid">
                        <div className="form-group">
                            <label>Employee ID *</label>
                            <input type="text" name="employee_id" required onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label>Department *</label>
                            <input type="text" name="department" required onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label>Job Title *</label>
                            <input type="text" name="job_title" required onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label>Date of Joining *</label>
                            <input type="date" name="date_of_joining" required onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label>Salary *</label>
                            <input type="number" name="salary" required onChange={handleChange} />
                        </div>
                    </div>
                </div>

                <div className="form-actions">
                    <button type="submit" disabled={loading} className="btn-primary">
                        {loading ? 'Creating...' : 'Create Employee'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateEmployee;