import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import useAuthStore from '../store/authStore';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setToken, setUser, setStudentProfile, setClassTeacher } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await authAPI.login({ email, password });
      setToken(response.data.token);
      setUser(response.data.user);
      setStudentProfile(response.data.studentProfile || null);
      setClassTeacher(response.data.classTeacher || null);
      
      // Store userId in localStorage for admin user management
      localStorage.setItem('userId', response.data.user.id);

      // Redirect based on role
      const role = response.data.user.role;
      navigate(`/${role}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      {/* Animated gradient orbs */}
      <div className="absolute top-20 right-20 w-96 h-96 bg-gradient-to-br from-blue-500 to-purple-500 opacity-10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-gradient-to-br from-indigo-500 to-blue-500 opacity-10 rounded-full blur-3xl"></div>
      
      <div className="relative z-10 bg-white/95 backdrop-blur rounded-2xl shadow-2xl p-10 w-full max-w-md border border-white/20">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl mb-4 shadow-lg">
            <span className="text-white font-bold text-2xl">E</span>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-blue-600 bg-clip-text text-transparent mb-2">School ERP</h1>
          {/* <p className="text-slate-500 text-sm font-medium">Professional Management System</p> */}
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-slate-50 hover:bg-slate-100 text-slate-900 placeholder-slate-400 font-medium"
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-slate-50 hover:bg-slate-100 text-slate-900 placeholder-slate-400 font-medium"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="bg-gradient-to-r from-red-50 to-rose-50 border border-red-300 text-red-700 text-sm p-4 rounded-lg flex items-start gap-3 shadow-sm">
              <span className="text-xl">⚠️</span>
              <span className="font-medium">{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-lg font-bold hover:shadow-lg hover:-translate-y-0.5 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform uppercase tracking-wide"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-slate-600 text-sm mt-8 border-t border-slate-200 pt-8">
          <span className="text-slate-500">Need assistance?</span> <br />
          <span className="text-blue-600 font-semibold mt-1 inline-block">Contact your administrator</span>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
