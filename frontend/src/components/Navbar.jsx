import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link2, LogOut, User } from 'lucide-react';

export const Navbar = () => {
  const { email, logout } = useAuth();

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-indigo-600 p-2 rounded-lg text-white shadow-sm">
            <Link2 className="w-6 h-6" />
          </div>
          <span className="font-bold text-xl text-slate-800 tracking-tight">NanoLink</span>
        </div>

        {email && (
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-slate-600 bg-slate-100 py-1.5 px-3 rounded-full">
              <User className="w-4 h-4 text-slate-500" />
              <span>{email}</span>
            </div>
            <button
              onClick={logout}
              className="flex items-center space-x-2 text-sm font-medium text-slate-600 hover:text-red-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors py-1.5 px-3 rounded-xl shadow-sm"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};