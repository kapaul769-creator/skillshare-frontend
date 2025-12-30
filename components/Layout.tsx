import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.tsx';
import { Menu, X, User as UserIcon, LogOut, AlertCircle, UserCircle, Briefcase } from 'lucide-react';
import { APP_NAME } from '../constants.ts';
import { UserRole } from '../types.ts';

interface LayoutProps { children: React.ReactNode; }

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isAuthDropdownOpen, setIsAuthDropdownOpen] = useState(false);
  const [showSellerModal, setShowSellerModal] = useState(false);

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
    setIsMenuOpen(false);
    setIsAuthDropdownOpen(false);
  };

  const confirmLogout = () => {
    logout();
    setShowLogoutConfirm(false);
    navigate('/'); 
  };

  const isActive = (path: string) => 
    location.pathname === path 
      ? "text-primary-500 font-bold" 
      : "text-gray-300 hover:text-gray-50 font-medium";

  const handleSellSkillClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsMenuOpen(false);
    
    if (!user) {
      navigate('/login', { state: { from: '/create-listing' } });
      return;
    }

    if (user.role === UserRole.BUYER) {
      setShowSellerModal(true);
    } else {
      navigate('/create-listing');
    }
  };

  const handleCreateSellerAccount = () => {
    logout(); // Ensure independence
    setShowSellerModal(false);
    navigate('/register?role=SELLER');
  };

  const toggleAuthDropdown = () => {
    setIsAuthDropdownOpen(!isAuthDropdownOpen);
    setIsMenuOpen(false);
  };

  const toggleHamburgerMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    setIsAuthDropdownOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col transition-colors duration-300">
      
      {/* Separate Account Requirement Modal */}
      {showSellerModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] shadow-2xl max-w-md w-full p-10 relative overflow-hidden text-center">
             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-500 to-indigo-500"></div>
             <button 
              onClick={() => setShowSellerModal(false)}
              className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors"
             >
               <X className="w-6 h-6" />
             </button>
             
             <div className="w-16 h-16 bg-primary-500/10 rounded-2xl flex items-center justify-center mb-8 mx-auto">
                <Briefcase className="w-8 h-8 text-primary-400" />
             </div>
             
             <h3 className="text-2xl font-black text-white mb-4">Start Selling Today</h3>
             <p className="text-slate-400 font-medium leading-relaxed mb-10">
               To start selling your skills, you need to create a Seller account. Selling requires a separate Seller account.
             </p>
             
             <div className="flex flex-col gap-3">
                <button 
                  onClick={handleCreateSellerAccount}
                  className="w-full py-4 bg-primary-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-primary-500 transition shadow-xl shadow-primary-900/20 active:scale-95"
                >
                  Create Seller Account
                </button>
                <button 
                  onClick={() => setShowSellerModal(false)}
                  className="w-full py-4 text-slate-500 font-black text-[10px] uppercase tracking-widest hover:text-slate-300 transition"
                >
                  Cancel
                </button>
             </div>
          </div>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-gray-800 rounded-3xl shadow-2xl max-w-sm w-full p-8 border border-gray-700">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-red-900/20 rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="w-8 h-8 text-red-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-50 mb-2">Confirm Logout</h3>
              <p className="text-gray-300 mb-8">Are you sure you want to end your session?</p>
              <div className="flex w-full gap-3">
                <button 
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 py-3 px-4 bg-gray-700 text-gray-50 rounded-2xl font-bold hover:bg-gray-600 transition active:scale-95"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmLogout}
                  className="flex-1 py-3 px-4 bg-red-600 text-white rounded-2xl font-bold hover:bg-red-700 transition active:scale-95"
                >
                  Log Out
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navbar */}
      <nav className="bg-gray-800 shadow-sm sticky top-0 z-50 border-b border-gray-700 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <Link to="/" className="flex-shrink-0 flex items-center" onClick={() => { setIsAuthDropdownOpen(false); setIsMenuOpen(false); }}>
                <span className="text-2xl font-black text-primary-500 tracking-tight">{APP_NAME}</span>
              </Link>
              <div className="hidden sm:ml-8 sm:flex sm:space-x-8 items-center">
                <Link to="/marketplace" className={isActive('/marketplace')}>Marketplace</Link>
                {user && user.role === UserRole.SELLER && (
                  <Link to="/dashboard" className={isActive('/dashboard')}>My Dashboard</Link>
                )}
                {user && (
                   <button onClick={handleSellSkillClick} className="text-gray-300 hover:text-primary-500 font-bold transition-colors">Sell Skill</button>
                )}
                {user && user.role === UserRole.ADMIN && (
                   <Link to="/admin" className={isActive('/admin')}>Admin Panel</Link>
                )}
              </div>
            </div>

            <div className="flex items-center">
              <div className="hidden sm:flex sm:items-center space-x-4">
                {user ? (
                  <>
                    <div className="flex items-center space-x-3 ml-4 border-l pl-4 border-gray-700">
                      <Link to={`/profile/${user.id}`} className="flex flex-col text-right hover:opacity-80">
                         <span className="text-sm font-bold text-gray-50">{user.name}</span>
                         <span className="text-[10px] text-gray-300 font-black uppercase tracking-widest">{user.role.toLowerCase()}</span>
                      </Link>
                      <Link to={`/profile/${user.id}`} className="block">
                          {user.avatarUrl ? (
                              <img className="h-8 w-8 rounded-full object-cover border border-gray-700" src={user.avatarUrl} alt="" />
                          ) : (
                              <div className="h-8 w-8 rounded-full bg-gray-700 flex items-center justify-center">
                                  <UserIcon className="h-4 w-4 text-gray-300"/>
                              </div>
                          )}
                      </Link>
                      <button onClick={handleLogoutClick} className="text-gray-400 hover:text-red-400 transition-colors">
                        <LogOut className="w-5 h-5" />
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="space-x-4 flex items-center">
                    <Link to="/login" className="text-gray-300 hover:text-gray-50 font-bold text-sm">Log in</Link>
                    <Link to="/register" className="bg-primary-500 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:opacity-90 transition">Sign up</Link>
                  </div>
                )}
              </div>

              {!user && (
                <div className="sm:hidden flex items-center mr-2">
                  <button 
                    onClick={toggleAuthDropdown}
                    className={`p-2 rounded-xl transition-all ${isAuthDropdownOpen ? 'bg-primary-500/10 text-primary-500 ring-1 ring-primary-500/50' : 'text-gray-400'}`}
                    aria-label="Account Access"
                  >
                    <UserCircle className="w-7 h-7" />
                  </button>
                </div>
              )}

              {user && (
                <div className="sm:hidden flex items-center mr-2">
                  <Link 
                    to={`/profile/${user.id}`} 
                    onClick={() => { setIsAuthDropdownOpen(false); setIsMenuOpen(false); }}
                    className="p-1"
                  >
                    {user.avatarUrl ? (
                      <img className="h-8 w-8 rounded-full object-cover border border-gray-700 shadow-sm" src={user.avatarUrl} alt="" />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-gray-700 flex items-center justify-center border border-gray-600">
                        <UserIcon className="h-4 w-4 text-gray-300"/>
                      </div>
                    )}
                  </Link>
                </div>
              )}

              <div className="-mr-2 flex items-center sm:hidden">
                <button
                  onClick={toggleHamburgerMenu}
                  className="inline-flex items-center justify-center p-2 rounded-md text-gray-300 focus:outline-none"
                >
                  {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {isAuthDropdownOpen && !user && (
          <div className="sm:hidden absolute top-16 right-4 w-52 bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl animate-fade-in flex flex-col z-[100] overflow-hidden p-3 gap-3">
             <Link 
              to="/login" 
              onClick={() => setIsAuthDropdownOpen(false)}
              className="w-full py-4 px-4 bg-gray-700 text-gray-50 rounded-xl text-center font-black text-[10px] uppercase tracking-widest hover:bg-gray-600 transition active:scale-95 block"
             >
               Log In
             </Link>
             <Link 
              to="/register" 
              onClick={() => setIsAuthDropdownOpen(false)}
              className="w-full py-4 px-4 bg-primary-500 text-white rounded-xl text-center font-black text-[10px] uppercase tracking-widest hover:bg-primary-600 transition active:scale-95 block"
             >
               Sign Up
             </Link>
          </div>
        )}

        {isMenuOpen && (
          <div className="sm:hidden bg-gray-800 border-t border-gray-700 animate-fade-in">
            <div className="pt-2 pb-3 space-y-1 px-4">
              <Link to="/marketplace" onClick={() => setIsMenuOpen(false)} className="block px-3 py-3 text-base font-bold text-gray-50 hover:bg-gray-700 rounded-xl transition-colors">Marketplace</Link>
              {user && (
                  <>
                    {user.role === UserRole.SELLER && <Link to="/dashboard" onClick={() => setIsMenuOpen(false)} className="block px-3 py-3 text-base font-bold text-gray-50 hover:bg-gray-700 rounded-xl">Dashboard</Link>}
                    <button onClick={handleSellSkillClick} className="w-full text-left px-3 py-3 text-base font-bold text-primary-500 hover:bg-gray-700 rounded-xl">Sell Skill</button>
                    <Link to={`/profile/${user.id}`} onClick={() => setIsMenuOpen(false)} className="block px-3 py-3 text-base font-bold text-gray-50 hover:bg-gray-700 rounded-xl">My Profile</Link>
                     <button onClick={handleLogoutClick} className="w-full text-left px-3 py-3 text-base font-bold text-red-400 hover:bg-gray-700 rounded-xl">Sign out</button>
                  </>
              )}
            </div>
          </div>
        )}
      </nav>

      <main className="flex-grow">
        {children}
      </main>

      <footer className="bg-gray-800 border-t border-gray-700 mt-auto py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-300 font-medium">
            &copy; {new Date().getFullYear()} {APP_NAME}. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};