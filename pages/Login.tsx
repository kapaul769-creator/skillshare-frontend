import React, { useState, KeyboardEvent } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getUsers } from '../services/storageService';
import { ArrowLeft, AlertCircle } from 'lucide-react';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('sarah@example.com');
  const [error, setError] = useState('');
  const [isCapsLockOn, setIsCapsLockOn] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const users = getUsers();
    const user = users.find(u => u.email === email);
    if (user) {
      login(user);
      const from = (location.state as any)?.from?.pathname || '/';
      const intent = (location.state as any)?.intent;
      navigate(from, { replace: true, state: { intent } });
    } else {
      setError('Account not found.');
    }
  };

  const checkCapsLock = (e: KeyboardEvent) => {
    setIsCapsLockOn(e.getModifierState('CapsLock'));
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4">
        <h2 className="text-center text-3xl font-black text-gray-50 tracking-tight">
          Welcome back
        </h2>
        <p className="mt-2 text-center text-sm font-medium text-gray-300">
          Or <Link to="/register" state={location.state} className="text-primary-500 hover:underline">create account</Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-gray-800 py-10 px-6 shadow-sm border border-gray-700 sm:rounded-3xl sm:px-12">
          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label htmlFor="email" className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">
                Email Address
              </label>
              <input
                id="email" type="email" required
                value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-gray-900 border-none rounded-xl text-sm text-gray-50 outline-none focus:ring-2 focus:ring-primary-500/10 font-bold"
              />
            </div>

            <div>
              <label htmlFor="password" title="Passwords are case-sensitive" className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password" type="password" required defaultValue="password"
                  onKeyUp={checkCapsLock}
                  className="w-full px-4 py-3 bg-gray-900 border-none rounded-xl text-sm text-gray-50 outline-none focus:ring-2 focus:ring-primary-500/10 font-bold"
                />
                {isCapsLockOn && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center text-warning-500">
                    <AlertCircle className="w-3.5 h-3.5 mr-1" />
                    <span className="text-[8px] font-black uppercase tracking-widest">Caps</span>
                  </div>
                )}
              </div>
            </div>

            {error && <div className="text-danger-500 text-xs font-bold text-center">{error}</div>}

            <button type="submit" className="w-full py-4 bg-primary-500 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:opacity-90 transition active:scale-95">
              Sign In
            </button>
          </form>
          
          <div className="mt-10 pt-6 border-t border-gray-700">
             <div className="text-center text-[9px] font-black text-gray-500 uppercase tracking-[0.2em] mb-4">Quick Demo Access</div>
             <div className="flex gap-2">
                <button className="flex-1 py-3 bg-gray-900 text-[10px] font-bold text-gray-300 rounded-xl hover:bg-gray-700 transition" onClick={() => setEmail('sarah@example.com')}>Seller</button>
                <button className="flex-1 py-3 bg-gray-900 text-[10px] font-bold text-gray-300 rounded-xl hover:bg-gray-700 transition" onClick={() => setEmail('mike@example.com')}>Buyer</button>
             </div>
          </div>
        </div>
      </div>

      <Link to="/" className="fixed bottom-8 right-8 bg-gray-800/80 backdrop-blur-md text-gray-50 px-6 py-3 rounded-full shadow-2xl border border-gray-700 font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:scale-105 transition-all z-50 active:scale-95">
        <ArrowLeft className="w-4 h-4" /> Back Home
      </Link>
    </div>
  );
};