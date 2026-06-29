import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import './ProfilePage.css';

const buildImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    const baseUrl = process.env.REACT_APP_API_BASE || 'http://localhost:8000';
    return `${baseUrl}${path}`;
};

const ProfilePage = () => {
    const { user } = useAuth();
    const [employee, setEmployee] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });
    const [profileImage, setProfileImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const savedImageUrl = useRef(null);
    const [formData, setFormData] = useState({ first_name: '', last_name: '', phone: '', address: '' });

    const fetchProfile = async () => {
        try {
            const empRes = await api.get('/employees/');
            const myEmployee = empRes.data.find(e => e.user === user?.id);
            if (myEmployee) {
                setEmployee(myEmployee);
                setFormData({
                    first_name: user?.first_name || '',
                    last_name: user?.last_name || '',
                    phone: user?.phone || '',
                    address: user?.address || ''
                });
                const url = buildImageUrl(myEmployee.profile_picture);
                setImagePreview(url);
                savedImageUrl.current = url;
            } else {
                setMessage({ text: 'No employee record found', type: 'error' });
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
            setMessage({ text: 'Error loading profile', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/jpg'];
            if (validTypes.includes(file.type)) {
                setProfileImage(file);
                setImagePreview(URL.createObjectURL(file));
                setMessage({ text: '', type: '' });
            } else {
                setMessage({ text: 'Please select a valid image file (JPG, PNG, GIF, WEBP)', type: 'error' });
                e.target.value = '';
            }
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleCancel = () => {
        setEditing(false);
        setProfileImage(null);
        setImagePreview(savedImageUrl.current);
        setMessage({ text: '', type: '' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!employee) {
            setMessage({ text: 'No employee record found', type: 'error' });
            return;
        }

        setLoading(true);
        try {
            await api.put(`/auth/update/${user?.id}/`, {
                first_name: formData.first_name,
                last_name: formData.last_name,
                phone: formData.phone,
                address: formData.address
            });

            if (profileImage) {
                const formDataToSend = new FormData();
                formDataToSend.append('profile_picture', profileImage);

                const response = await api.patch(`/employees/${employee.id}/`, formDataToSend, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });

                const newUrl = buildImageUrl(response.data.profile_picture);
                setImagePreview(newUrl);
                savedImageUrl.current = newUrl;
            }

            setMessage({ text: 'Profile updated successfully!', type: 'success' });
            setEditing(false);
            setProfileImage(null);

            setTimeout(() => setMessage({ text: '', type: '' }), 2000);

        } catch (error) {
            console.error('Error updating profile:', error);
            let errorMsg = 'Error updating profile';
            if (error.response?.data?.profile_picture) {
                errorMsg = error.response.data.profile_picture[0];
            } else if (error.response?.data?.message) {
                errorMsg = error.response.data.message;
            } else if (error.message) {
                errorMsg = error.message;
            }
            setMessage({ text: 'Error: ' + errorMsg, type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="loading">Loading...</div>;

    return (
        <div className="profile-page">
            <div className="page-header">
                <h1>My Profile</h1>
                {editing ? (
                    <button className="btn-edit" onClick={handleCancel}>Cancel</button>
                ) : (
                    <button className="btn-edit" onClick={() => setEditing(true)}>Edit Profile</button>
                )}
            </div>

            {message.text && (
                <div className={`message ${message.type}`}>
                    {message.text}
                </div>
            )}

            <div className="profile-container">
                <div className="profile-image-section">
                    <div className="profile-image">
                        {imagePreview ? (
                            <img src={imagePreview} alt="Profile" className="profile-image-img" />
                        ) : (
                            <img src="/assets/WorkHive.png" alt="Default Profile" className="profile-image-img" style={{ objectFit: 'cover' }} />
                        )}
                        {editing && (
                            <div className="image-upload-label">
                                <label htmlFor="profile-image-input">
                                    <span>📷</span>
                                </label>
                                <input
                                    id="profile-image-input"
                                    type="file"
                                    accept="image/jpeg,image/png,image/gif,image/webp"
                                    onChange={handleImageChange}
                                    style={{ display: 'none' }}
                                />
                            </div>
                        )}
                    </div>
                    <h2>{user?.full_name || user?.username}</h2>
                    <p className="user-role">{user?.role === 'hr' ? 'HR Manager' : 'Employee'}</p>
                    <p className="user-email">{user?.email}</p>
                </div>

                <div className="profile-details">
                    <form onSubmit={handleSubmit}>
                        <div className="form-section">
                            <h3>Personal Information</h3>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>First Name</label>
                                    <input 
                                        type="text" 
                                        name="first_name"
                                        value={formData.first_name} 
                                        onChange={handleChange}
                                        disabled={!editing} 
                                        placeholder="First Name"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Last Name</label>
                                    <input 
                                        type="text" 
                                        name="last_name"
                                        value={formData.last_name} 
                                        onChange={handleChange}
                                        disabled={!editing} 
                                        placeholder="Last Name"
                                    />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Username</label>
                                    <input type="text" value={user?.username || ''} disabled />
                                </div>
                                <div className="form-group">
                                    <label>Email</label>
                                    <input type="email" value={user?.email || ''} disabled />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Phone</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        disabled={!editing}
                                        placeholder="Enter phone number"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Joining Date</label>
                                    <input type="text" value={employee?.date_of_joining || ''} disabled />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Address</label>
                                <textarea
                                    name="address"
                                    rows="3"
                                    value={formData.address}
                                    onChange={handleChange}
                                    disabled={!editing}
                                    placeholder="Enter your address"
                                />
                            </div>
                        </div>

                        <div className="form-section">
                            <h3>Employment Information</h3>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Employee ID</label>
                                    <input type="text" value={employee?.employee_id || ''} disabled />
                                </div>
                                <div className="form-group">
                                    <label>Department</label>
                                    <input type="text" value={employee?.department || ''} disabled />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Job Title</label>
                                    <input type="text" value={employee?.job_title || ''} disabled />
                                </div>
                                <div className="form-group">
                                    <label>Salary</label>
                                    <input type="number" value={employee?.salary || ''} disabled />
                                </div>
                            </div>
                        </div>

                        {editing && (
                            <div className="form-actions">
                                <button type="submit" className="btn-save" disabled={loading}>
                                    {loading ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;