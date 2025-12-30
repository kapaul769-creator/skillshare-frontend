
import React from 'react';
import { Link } from 'react-router-dom';
import { ServiceListing } from '../types';
import { Star, Heart, CheckCircle2, Globe, MapPin, ChevronRight } from 'lucide-react';

interface ServiceCardProps {
  listing: ServiceListing;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({ listing }) => {
  return (
    <div className="bg-slate-900/40 rounded-[2.5rem] overflow-hidden border border-slate-800/50 hover:border-indigo-500/30 transition-all duration-500 flex flex-col group h-full relative hover:shadow-2xl hover:shadow-indigo-500/5 hover:-translate-y-2">
      
      {/* Thumbnail Container (Modern 16:9) */}
      <Link to={`/service/${listing.id}`} className="relative aspect-video w-full overflow-hidden block">
        <img 
          src={listing.imageUrl} 
          alt={listing.title} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#020617]/80 via-transparent to-transparent opacity-80 group-hover:opacity-100 transition-opacity"></div>
        
        {/* Modality Float Badge */}
        <div className="absolute top-4 left-4 flex items-center gap-2 px-3.5 py-2 bg-slate-950/90 backdrop-blur-xl rounded-2xl border border-white/5 shadow-2xl">
          {listing.isOnline ? (
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(99,102,241,1)]"></div>
              <span className="text-[9px] font-black text-white uppercase tracking-widest">Digital Online</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,1)]"></div>
              <span className="text-[9px] font-black text-white uppercase tracking-widest">In-Person Local</span>
            </div>
          )}
        </div>

        {/* Price Tag Overlay */}
        <div className="absolute bottom-4 left-4">
           <div className="px-4 py-2 bg-indigo-600 rounded-2xl text-[10px] font-black text-white uppercase tracking-widest shadow-xl">
             From ₹{listing.price}
           </div>
        </div>
        
        {/* Wishlist Toggle */}
        <button className="absolute top-4 right-4 p-2.5 bg-black/40 backdrop-blur-md rounded-2xl text-white/50 hover:text-red-500 hover:bg-black/60 transition-all z-10 scale-90 opacity-0 group-hover:opacity-100 group-hover:scale-100">
          <Heart className="w-5 h-5" />
        </button>
      </Link>
      
      {/* Content Area */}
      <div className="p-7 flex-grow flex flex-col">
        
        {/* Seller Info Bar */}
        <div className="flex items-center gap-3 mb-5">
          <img 
            src={listing.sellerAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(listing.sellerName)}`} 
            alt={listing.sellerName}
            className="w-8 h-8 rounded-xl object-cover border border-slate-800 ring-2 ring-slate-900/50" 
          />
          <div className="flex flex-col">
            <span className="text-[11px] font-bold text-slate-100 hover:text-indigo-400 cursor-pointer transition-colors leading-none mb-1">{listing.sellerName}</span>
            <div className="flex items-center gap-1.5">
               <CheckCircle2 className="w-3 h-3 text-indigo-500" />
               <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Trusted Provider</span>
            </div>
          </div>
        </div>

        {/* Listing Title */}
        <Link to={`/service/${listing.id}`} className="block mb-6">
          <h3 className="text-lg font-bold text-slate-50 line-clamp-2 leading-tight group-hover:text-indigo-400 transition-colors h-[2.5em]">
            {listing.title}
          </h3>
        </Link>

        {/* Metadata Row: Rating & Details */}
        <div className="flex items-center justify-between mt-auto pt-6 border-t border-slate-800/50">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/50 rounded-xl">
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span className="text-xs font-black text-amber-500">{listing.rating.toFixed(1)}</span>
            <span className="text-[10px] font-medium text-slate-500">({listing.reviewCount})</span>
          </div>
          
          <Link 
            to={`/service/${listing.id}`} 
            className="flex items-center gap-1.5 text-[9px] font-black text-indigo-400 uppercase tracking-widest hover:text-indigo-300 transition-colors group/link"
          >
            View Listing
            <ChevronRight className="w-3 h-3 group-hover/link:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
};
