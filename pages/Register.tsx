import React, { useState, KeyboardEvent, useRef, useMemo, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.tsx';
import { saveUser, generateId } from '../services/storageService.ts';
import { UserRole } from '../types.ts';
import { ArrowLeft, AlertCircle, Upload, X, User as UserIcon, Check, ShieldCheck, ShieldAlert } from 'lucide-react';

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialRole = queryParams.get('role') as UserRole;

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>(initialRole === UserRole.SELLER ? UserRole.SELLER : UserRole.BUYER);
  const [avatarUrl, setAvatarUrl] = useState('');
  const [isCapsLockOn, setIsCapsLockOn] = useState(false);
  const [showPasswordRequirements, setShowPasswordRequirements] = useState(false);
  
  const { login } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync role if query params change
  useEffect(() => {
    if (initialRole === UserRole.SELLER) {
      setRole(UserRole.SELLER);
    }
  }, [initialRole]);

  const passwordRequirements = useMemo(() => ({
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password)
  }), [password]);

  const passwordStrength = useMemo(() => {
    const metCount = Object.values(passwordRequirements).filter(Boolean).length;
    if (metCount === 0) return { label: '', color: 'bg-gray-200', text: 'text-gray-400', score: 0 };
    if (metCount <= 1) return { label: 'Weak', color: 'bg-red-500', text: 'text-red-500', score: 1 };
    if (metCount <= 3) return { label: 'Medium', color: 'bg-orange-500', text: 'text-orange-500', score: 2 };
    return { label: 'Strong', color: 'bg-emerald-500', text: 'text-emerald-500', score: 3 };
  }, [passwordRequirements]);

  const isPasswordValid = Object.values(passwordRequirements).every(Boolean);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPasswordValid) return;

    const newUser = {
      id: generateId(),
      name,
      email,
      role,
      avatarUrl: avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`
    };
    saveUser(newUser);
    login(newUser);
    
    const from = (location.state as any)?.from?.pathname || '/';
    const intent = (location.state as any)?.intent;
    navigate(from, { replace: true, state: { intent } });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 512) {
        alert("Profile photo is too large. Please select an image under 500KB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeAvatar = () => {
    setAvatarUrl('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const checkCapsLock = (e: KeyboardEvent) => {
    setIsCapsLockOn(e.getModifierState('CapsLock'));
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
          Create your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
          Join the community today
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow sm:rounded-3xl sm:px-10 border border-gray-100 dark:border-gray-700 transition-colors duration-300">
          <form className="space-y-6" onSubmit={handleRegister}>
            <div className="flex flex-col items-center mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 font-bold">Profile Photo</label>
              <div className="relative group">
                <div className="w-24 h-24 rounded-full bg-gray-50 dark:bg-gray-900 flex items-center justify-center overflow-hidden border-2 border-gray-100 dark:border-gray-700 shadow-inner">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <UserIcon className="w-12 h-12 text-gray-400" />
                  )}
                </div>
                {avatarUrl ? (
                  <button 
                    type="button"
                    onClick={removeAvatar}
                    className="absolute -top-1 -right-1 p-1 bg-red-500 text-white rounded-full shadow-md hover:opacity-90 transition-opacity"
                  >
                    <X className="w-4 h-4" />
                  </button>
                ) : (
                  <label className="absolute bottom-0 right-0 p-2 bg-primary-600 text-white rounded-full shadow-md cursor-pointer hover:bg-primary-700 transition-colors">
                    <Upload className="w-4 h-4" />
                    <input 
                      ref={fileInputRef}
                      type="file" 
                      className="sr-only" 
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                  </label>
                )}
              </div>
              <p className="mt-2 text-[10px] text-gray-400 uppercase tracking-widest font-black">Optional</p>
            </div>

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 font-bold">Full Name</label>
              <div className="mt-1">
                <input 
                  id="name" 
                  type="text" 
                  required 
                  className="appearance-none block w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl shadow-sm focus:outline-none focus:ring-primary-600 focus:border-primary-600 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-medium" 
                  placeholder="John Doe"
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 font-bold">Email address</label>
              <div className="mt-1">
                <input 
                  id="email" 
                  type="email" 
                  required 
                  className="appearance-none block w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl shadow-sm focus:outline-none focus:ring-primary-600 focus:border-primary-600 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-medium" 
                  placeholder="john@example.com"
                  value={email} 
                  onChange={e => setEmail(e.target.value.toLowerCase())} 
                />
              </div>
            </div>

            <div>
               <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 font-bold">I want to...</label>
               <select className="mt-1 block w-full pl-4 pr-10 py-3 text-base border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-primary-600 focus:border-primary-600 sm:text-sm rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-bold appearance-none" value={role} onChange={e => setRole(e.target.value as UserRole)}>
                  <option value={UserRole.BUYER}>Find Services (Buyer)</option>
                  <option value={UserRole.SELLER}>Offer Services (Seller)</option>
               </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="password" title="Strong password required" className="block text-sm font-medium text-gray-700 dark:text-gray-300 font-bold">
                Create Password
              </label>
              <div className="relative">
                <input 
                  id="password" 
                  type="password" 
                  required 
                  value={password}
                  onFocus={() => setShowPasswordRequirements(true)}
                  onChange={e => setPassword(e.target.value)}
                  onKeyUp={checkCapsLock}
                  className="appearance-none block w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl shadow-sm focus:outline-none focus:ring-primary-600 focus:border-primary-600 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-medium" 
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
                  {isCapsLockOn && (
                    <div className="flex items-center text-orange-500" aria-live="polite">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      <span className="text-[8px] font-black uppercase tracking-tighter">Caps</span>
                    </div>
                  )}
                  {password && (
                    isPasswordValid ? <ShieldCheck className="w-5 h-5 text-emerald-500" /> : <ShieldAlert className="w-5 h-5 text-orange-500" />
                  )}
                </div>
              </div>

              {password && (
                <div className="space-y-1 animate-in fade-in slide-in-from-top-1">
                  <div className="flex justify-between items-center px-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Strength</span>
                    <span className={`text-[10px] font-black uppercase tracking-widest ${passwordStrength.text}`}>
                      {passwordStrength.label}
                    </span>
                  </div>
                  <div className="flex gap-1 h-1">
                    <div className={`flex-1 rounded-full transition-all duration-300 ${passwordStrength.score >= 1 ? passwordStrength.color : 'bg-gray-100 dark:bg-gray-700'}`}></div>
                    <div className={`flex-1 rounded-full transition-all duration-300 ${passwordStrength.score >= 2 ? passwordStrength.color : 'bg-gray-100 dark:bg-gray-700'}`}></div>
                    <div className={`flex-1 rounded-full transition-all duration-300 ${passwordStrength.score >= 3 ? passwordStrength.color : 'bg-gray-100 dark:bg-gray-700'}`}></div>
                  </div>
                </div>
              )}

              {showPasswordRequirements && (
                <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-700 space-y-2 mt-4 animate-in fade-in slide-in-from-top-2">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Password Requirements</p>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                    <RequirementItem label="Min 8 characters" met={passwordRequirements.length} />
                    <RequirementItem label="Uppercase letter" met={passwordRequirements.uppercase} />
                    <RequirementItem label="Lowercase letter" met={passwordRequirements.lowercase} />
                    <RequirementItem label="Number (0-9)" met={passwordRequirements.number} />
                  </ul>
                </div>
              )}
            </div>

            <div>
              <button 
                type="submit" 
                disabled={!isPasswordValid || !name || !email}
                className="w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-lg shadow-primary-200 dark:shadow-none text-sm font-black uppercase tracking-widest text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-600 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
              >
                Create Account
              </button>
            </div>
          </form>
          <div className="mt-6 text-center">
             <Link to="/login" state={location.state} className="text-sm font-bold text-primary-600 hover:underline dark:text-primary-400">Already have an account? Sign in</Link>
          </div>
        </div>
      </div>

      <Link 
        to="/" 
        className="fixed bottom-8 right-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md text-gray-900 dark:text-white px-6 py-3 rounded-full shadow-2xl border border-gray-100 dark:border-gray-700 font-bold flex items-center gap-2 hover:scale-105 transition-all z-50 group active:scale-95"
      >
        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> Back
      </Link>
    </div>
  );
};

const RequirementItem: React.FC<{ label: string; met: boolean }> = ({ label, met }) => (
  <li className={`flex items-center text-[10px] font-bold transition-colors ${met ? 'text-emerald-500' : 'text-gray-400'}`}>
    <div className={`w-4 h-4 rounded-full border flex items-center justify-center mr-2 transition-all ${met ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-gray-200 dark:border-gray-700'}`}>
      {met && <Check className="w-2.5 h-2.5" />}
    </div>
    {label}
  </li>
);