import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Navbar() {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="w-full bg-white shadow-sm fixed top-0 left-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center h-16">
        <Link to={role === 'teacher' ? '/teacher/dashboard' : role === 'student' ? '/student/dashboard' : '/'} className="text-orange font-bold text-xl tracking-tight mr-8 flex-shrink-0">Learning Management System</Link>
        <div className="flex-1 flex items-center justify-end gap-4">
          {user && role === 'student' && (
            <>
              <Link to="/student/dashboard" className="hover:text-orange transition">Dashboard</Link>
              <Link to="/student/courses" className="hover:text-orange transition">Courses</Link>
              <Link to="/student/timetable" className="hover:text-orange transition">Timetable</Link>
              <Link to="/student/profile" className="hover:text-orange transition">Profile</Link>
            </>
          )}
          {user && role === 'teacher' && (
            <>
              <Link to="/teacher/dashboard" className="hover:text-orange transition">Dashboard</Link>
              <Link to="/teacher/courses" className="hover:text-orange transition">Courses</Link>
              <Link to="/teacher/messenger" className="hover:text-orange transition">Messenger</Link>
              <Link to="/teacher/profile" className="hover:text-orange transition">Profile</Link>
            </>
          )}
          {user ? (
            <button onClick={handleLogout} className="ml-2 px-3 py-1 rounded bg-orange text-white font-semibold hover:bg-orange-dark transition">Logout</button>
          ) : (
            <>
              <Link to="/login" className="hover:text-orange transition">Login</Link>
              <Link to="/register" className="hover:text-orange transition">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
} 