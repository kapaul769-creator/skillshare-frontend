import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ArrowRight, ShieldCheck, Users, Globe, BookOpen, Code, Palette, ChefHat, Sparkles, ChevronRight, Briefcase, X } from 'lucide-react';
import { ServiceCategory, UserRole } from '../types.ts';
import { useAuth } from '../context/AuthContext.tsx';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [showSellerModal, setShowSellerModal] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/marketplace?search=${encodeURIComponent(searchTerm)}`);
    } else {
      navigate('/marketplace');
    }
  };

  const handleStartSelling = (e: React.MouseEvent) => {
    e.preventDefault();
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
    logout(); // Ensure independence by clearing current buyer session
    setShowSellerModal(false);
    navigate('/register?role=SELLER');
  };

  const categories = [
    { name: ServiceCategory.COOKING, icon: ChefHat, color: 'text-orange-400', bg: 'bg-orange-400/10' },
    { name: ServiceCategory.PROGRAMMING, icon: Code, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { name: ServiceCategory.DESIGN, icon: Palette, color: 'text-pink-400', bg: 'bg-pink-400/10' },
    { name: ServiceCategory.TUTORING, icon: BookOpen, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
  ];

  return (
    <div className="flex flex-col bg-slate-950 min-h-screen selection:bg-primary-500/30">
      
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

      {/* 1. HERO SECTION */}
      <section className="relative pt-24 pb-20 sm:pt-40 sm:pb-32 overflow-hidden border-b border-slate-900">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none opacity-50">
          <div className="absolute -top-24 left-1/4 w-[600px] h-[600px] bg-primary-600/10 rounded-full blur-[120px]"></div>
          <div className="absolute top-1/2 -right-12 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[100px]"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/10 border border-primary-500/20 mb-8 animate-fade-in">
            <Sparkles className="w-4 h-4 text-primary-400" />
            <span className="text-[10px] font-black text-primary-400 uppercase tracking-[0.2em]">The local skill revolution</span>
          </div>
          
          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black text-white tracking-tighter mb-8 leading-[0.9] sm:leading-[0.85]">
            Sell Your Skills <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 via-indigo-400 to-primary-500">
              Without Marketing
            </span>
          </h1>
          
          <p className="text-lg sm:text-xl text-slate-400 mb-12 max-w-2xl mx-auto font-medium leading-relaxed">
            Connect directly with people looking for your expertise. Real people, real skills, right in your neighborhood.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center items-center gap-5 mb-16">
            <Link
              to="/marketplace"
              className="w-full sm:w-auto px-10 py-5 bg-primary-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-primary-500 transition-all shadow-xl shadow-primary-900/20 active:scale-95 flex items-center justify-center gap-3"
            >
              Find Experts <ArrowRight className="w-4 h-4" />
            </Link>
            <button
              onClick={handleStartSelling}
              className="w-full sm:w-auto px-10 py-5 bg-slate-900 text-slate-300 border border-slate-800 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 hover:text-white transition-all active:scale-95 flex items-center justify-center"
            >
              Start Selling Your Skill
            </button>
          </div>

          <form onSubmit={handleSearch} className="max-w-2xl mx-auto relative group">
            <div className="absolute left-6 text-slate-500 group-focus-within:text-primary-400 transition-colors pointer-events-none">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              className="w-full pl-14 pr-6 py-5 rounded-2xl border border-slate-800 bg-slate-900/50 backdrop-blur-xl text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-primary-500/50 transition-all font-medium text-sm shadow-2xl"
              placeholder="What skill are you looking for?"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </form>
        </div>
      </section>

      {/* 2. QUICK CATEGORY SECTION */}
      <section className="py-24 bg-slate-950/50 border-b border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-[10px] font-black text-primary-500 uppercase tracking-[0.3em] mb-4">Quick Start</h2>
            <h3 className="text-3xl font-black text-white">Popular Categories</h3>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {categories.map((cat, i) => (
              <Link 
                key={i} 
                to={`/marketplace?category=${encodeURIComponent(cat.name)}`}
                className="group p-8 rounded-[2.5rem] bg-slate-900 border border-slate-800 hover:border-primary-500/30 transition-all duration-500 flex flex-col items-center text-center hover:shadow-2xl hover:shadow-primary-500/5"
              >
                <div className={`w-16 h-16 ${cat.bg} rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <cat.icon className={`w-8 h-8 ${cat.color}`} />
                </div>
                <h4 className="text-sm font-bold text-slate-200 mb-1">{cat.name}</h4>
                <div className="flex items-center gap-1 text-[9px] font-black text-slate-500 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                  Explore <ChevronRight className="w-3 h-3" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 3. HOW IT WORKS SECTION */}
      <section className="py-32 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-20">
            <div className="lg:w-1/2 space-y-8">
               <h2 className="text-[10px] font-black text-primary-500 uppercase tracking-[0.3em]">The Process</h2>
               <h3 className="text-4xl sm:text-5xl font-black text-white leading-tight">Simple. Trusted. <br />Personal.</h3>
               <p className="text-slate-400 text-lg leading-relaxed font-medium">
                 We've removed the barriers to entry. No complex marketing, no platform fees. Just skills shared between real people in your community.
               </p>
               <div className="pt-4">
                 <Link to="/register" className="text-primary-400 font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:text-primary-300 transition-colors">
                   Join the community today <ArrowRight className="w-4 h-4" />
                 </Link>
               </div>
            </div>
            <div className="lg:w-1/2 w-full grid gap-4">
               {[
                 { step: '01', title: 'Browse & Discover', desc: 'Find unique skills listed by talented neighbors in your immediate area.' },
                 { step: '02', title: 'Connect Directly', desc: 'Message experts to discuss your needs and schedule convenient sessions.' },
                 { step: '03', title: 'Learn or Earn', desc: 'Master new talents or start generating income from your own expertise.' }
               ].map((item, idx) => (
                 <div key={idx} className="p-8 rounded-[2rem] bg-slate-900/50 border border-slate-800 flex items-start gap-6 hover:bg-slate-900 transition-colors group">
                    <span className="text-2xl font-black text-primary-500/30 group-hover:text-primary-500 transition-colors">{item.step}</span>
                    <div>
                      <h4 className="text-lg font-bold text-white mb-2">{item.title}</h4>
                      <p className="text-sm text-slate-500 leading-relaxed font-medium">{item.desc}</p>
                    </div>
                 </div>
               ))}
            </div>
          </div>
        </div>
      </section>

      {/* 4. WHY CHOOSE US / BENEFITS */}
      <section className="py-24 bg-primary-600/5 border-y border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { icon: ShieldCheck, title: 'Verified Trust', desc: 'Every provider is community-vetted with a transparent history and honest reviews.' },
              { icon: Users, title: 'Local Expertise', desc: 'Build real relationships with local experts who care about your progress.' },
              { icon: Globe, title: 'Flexible Delivery', desc: 'Choose between convenient online sessions or hands-on in-person instruction.' }
            ].map((benefit, i) => (
              <div key={i} className="text-center md:text-left">
                <div className="w-12 h-12 bg-primary-500/10 rounded-2xl flex items-center justify-center mb-6 mx-auto md:mx-0">
                  <benefit.icon className="w-6 h-6 text-primary-400" />
                </div>
                <h4 className="text-lg font-bold text-white mb-3">{benefit.title}</h4>
                <p className="text-sm text-slate-500 leading-relaxed font-medium">{benefit.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Footer */}
      <section className="py-24 border-t border-slate-900">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="bg-gradient-to-br from-primary-600 to-indigo-700 rounded-[3rem] p-12 sm:p-20 relative overflow-hidden shadow-2xl shadow-primary-500/20">
             <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
             <h3 className="text-3xl sm:text-4xl font-black text-white mb-6 relative z-10">Ready to share your talent?</h3>
             <p className="text-primary-100 mb-10 text-lg font-medium relative z-10 opacity-90">
               Join thousands of others turning their passion into a community service today.
             </p>
             <Link 
              to="/register" 
              className="inline-flex items-center px-12 py-5 bg-white text-primary-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-xl active:scale-95 relative z-10"
             >
               Get Started for Free
             </Link>
          </div>
        </div>
      </section>
    </div>
  );
};