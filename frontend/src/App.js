import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import EmployeeDashboard from './pages/employee/EmployeeDashboard';
import AttendancePage from './pages/employee/AttendancePage';
import ProfilePage from './pages/employee/ProfilePage';
import StaffList from './pages/employee/StaffList';
import HRHome from './pages/hr/HRHome';
import HRDashboard from './pages/hr/HRDashboard';
import EmployeeManagement from './pages/hr/EmployeeManagement';
import AttendanceLeaveManagement from './pages/hr/AttendanceLeaveManagement';
import PayrollPerformance from './pages/hr/PayrollPerformance';
import './App.css';

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/" element={<Navigate to="/dashboard" />} />
                    <Route path="/dashboard" element={<ProtectedRoute><Layout><EmployeeDashboard /></Layout></ProtectedRoute>} />
                    <Route path="/employee/attendance" element={<ProtectedRoute allowedRoles={['employee']}><Layout><AttendancePage /></Layout></ProtectedRoute>} />
                    <Route path="/employee/profile" element={<ProtectedRoute allowedRoles={['employee', 'hr']}><Layout><ProfilePage /></Layout></ProtectedRoute>} />
                    <Route path="/employee/staff" element={<ProtectedRoute allowedRoles={['employee', 'hr']}><Layout><StaffList /></Layout></ProtectedRoute>} />
                    <Route path="/hr/home" element={<ProtectedRoute allowedRoles={['hr']}><Layout><HRHome /></Layout></ProtectedRoute>} />
                    <Route path="/hr/dashboard" element={<ProtectedRoute allowedRoles={['hr']}><Layout><HRDashboard /></Layout></ProtectedRoute>} />
                    <Route path="/hr/employees" element={<ProtectedRoute allowedRoles={['hr']}><Layout><EmployeeManagement /></Layout></ProtectedRoute>} />
                    <Route path="/hr/attendance-leave" element={<ProtectedRoute allowedRoles={['hr']}><Layout><AttendanceLeaveManagement /></Layout></ProtectedRoute>} />
                    <Route path="/hr/payroll-performance" element={<ProtectedRoute allowedRoles={['hr']}><Layout><PayrollPerformance /></Layout></ProtectedRoute>} />
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;