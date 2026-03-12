import React from 'react';
import { useNavigate } from 'react-router-dom';

const RoleSelectionPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="w-full max-w-4xl">
        <h1 className="text-4xl font-bold text-center text-white mb-4">School ERP System 🎓</h1>
        <p className="text-center text-slate-300 mb-12">Select your role to continue</p>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Student Registration */}
          <div className="bg-white rounded-2xl shadow-2xl p-8 hover:shadow-3xl transition transform hover:scale-105">
            <div className="text-center">
              <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">👨‍🎓</span>
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Student</h2>
              <p className="text-slate-600 text-sm mb-6">Register as a student to access your dashboard and admission portal</p>
              <button
                onClick={() => navigate('/register/student')}
                className="w-full bg-primary text-white py-2 rounded-lg font-semibold hover:bg-indigo-700 transition"
              >
                Register as Student
              </button>
            </div>
          </div>

          {/* Teacher Registration */}
          <div className="bg-white rounded-2xl shadow-2xl p-8 hover:shadow-3xl transition transform hover:scale-105">
            <div className="text-center">
              <div className="w-16 h-16 bg-cyan-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">👨‍🏫</span>
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Teacher</h2>
              <p className="text-slate-600 text-sm mb-6">Register as a teacher to manage classes and access faculty dashboard</p>
              <button
                onClick={() => navigate('/register/teacher')}
                className="w-full bg-secondary text-white py-2 rounded-lg font-semibold hover:bg-cyan-600 transition"
              >
                Register as Teacher
              </button>
            </div>
          </div>

          {/* Staff Registration */}
          <div className="bg-white rounded-2xl shadow-2xl p-8 hover:shadow-3xl transition transform hover:scale-105">
            <div className="text-center">
              <div className="w-16 h-16 bg-violet-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">👔</span>
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Staff</h2>
              <p className="text-slate-600 text-sm mb-6">Register as staff (accountant, librarian, transport manager, etc)</p>
              <button
                onClick={() => navigate('/register/staff')}
                className="w-full bg-accent text-white py-2 rounded-lg font-semibold hover:bg-violet-700 transition"
              >
                Register as Staff
              </button>
            </div>
          </div>
        </div>

        <p className="text-center text-slate-400 text-sm mt-8">
          Already have an account?{' '}
          <button
            onClick={() => navigate('/login')}
            className="text-cyan-400 underline font-medium hover:text-cyan-300 transition"
          >
            Login here
          </button>
        </p>
      </div>
    </div>
  );
};

export default RoleSelectionPage;
