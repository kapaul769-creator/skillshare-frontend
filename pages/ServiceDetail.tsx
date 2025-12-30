import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { getListings, sendMessage, generateId, getReviewsByListingId, addReview, saveBooking, getUsers, getBookings, getGallery } from '../services/storageService';
import { ServiceListing, Review, BookingStatus, User as UserType, Booking } from '../types';
import { useAuth } from '../context/AuthContext';
import { MapPin, Star, MessageSquare, CheckCircle, Clock, Shield, Globe, Calendar, Send, Info, ChevronLeft, Eye, X, AlertTriangle } from 'lucide-react';

export const ServiceDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  const [listing, setListing] = useState<ServiceListing | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [seller, setSeller] = useState<UserType | null>(null);
  const [activeBooking, setActiveBooking] = useState<Booking | null>(null);
  const [galleryItems, setGalleryItems] = useState<string[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [bookingMessage, setBookingMessage] = useState('');
  const [preferredTime, setPreferredTime] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [showReviewForm, setShowReviewForm] = useState(false);

  const isOwner = user?.id === listing?.sellerId;

  useEffect(() => {
    const listings = getListings();
    const found = listings.find(l => l.id === id);
    if (found) {
      setListing(found);
      setReviews(getReviewsByListingId(found.id));
      setGalleryItems(getGallery(found.sellerId));
      
      const sellers = getUsers();
      const sellerInfo = sellers.find(u => u.id === found.sellerId);
      if (sellerInfo) setSeller(sellerInfo);

      if (user) {
        const bookings = getBookings();
        const existing = bookings.find(b => b.listingId === found.id && b.buyerId === user.id);
        if (existing) setActiveBooking(existing);
      }
    } else {
      navigate('/marketplace');
    }
  }, [id, navigate, user, location.state]);

  const handleAction = (type: 'contact' | 'booking' | 'payment') => {
    if (!user) {
      navigate('/login', { state: { from: location, intent: type } });
      return;
    }
    if (type === 'contact') setIsContactOpen(true);
    if (type === 'booking') setIsBookingOpen(true);
    if (type === 'payment') {
      setSuccessMsg('Session Started!');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }
  };

  const handleSendMessage = () => {
    if (!listing || !user) return;
    sendMessage({
        id: generateId(),
        senderId: user.id,
        receiverId: listing.sellerId,
        listingId: listing.id,
        content: messageText,
        timestamp: Date.now(),
        read: false
    });
    setIsContactOpen(false);
    setMessageText('');
    setSuccessMsg('Message sent!');
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleRequestBooking = () => {
    if (!listing || !user) return;
    const booking: Booking = {
        id: generateId(),
        listingId: listing.id,
        listingTitle: listing.title,
        buyerId: user.id,
        buyerName: user.name,
        sellerId: listing.sellerId,
        sellerName: listing.sellerName,
        status: BookingStatus.PENDING,
        preferredTime,
        message: bookingMessage,
        createdAt: Date.now()
    };
    saveBooking(booking);
    setActiveBooking(booking);
    setIsBookingOpen(false);
    setBookingMessage('');
    setPreferredTime('');
    setSuccessMsg('Request sent!');
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !listing) return;
    const newReview: Review = {
        id: generateId(),
        listingId: listing.id,
        authorId: user.id,
        authorName: user.name,
        rating: reviewRating,
        comment: reviewComment,
        date: Date.now()
    };
    addReview(newReview);
    setReviews(prev => [newReview, ...prev]);
    setReviewComment('');
    setReviewRating(5);
    setShowReviewForm(false);
  };

  if (!listing) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-all">
      <Link to="/marketplace" className="inline-flex items-center text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-primary-500 mb-8 transition-colors group">
         <ChevronLeft className="w-3.5 h-3.5 mr-1 group-hover:-translate-x-1 transition-transform" /> Back to Market
      </Link>

      {showSuccess && (
        <div className="fixed top-20 right-4 bg-primary-500 text-white px-6 py-4 rounded-2xl shadow-2xl z-[60] flex items-center animate-fade-in border border-primary-400">
          <CheckCircle className="w-4 h-4 mr-3" />
          <span className="font-black text-[10px] uppercase tracking-widest">{successMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Column: Skill Info */}
        <div className="lg:col-span-8 space-y-10">
          
          {/* Header Section: Compact Image + Clean Profile */}
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="w-full md:w-64 flex-shrink-0">
               <img src={listing.imageUrl} alt={listing.title} className="w-full aspect-square md:aspect-[4/3] object-cover rounded-[2rem] shadow-xl border border-gray-700" />
            </div>
            <div className="flex-1">
               <div className="flex items-center gap-2 mb-4">
                  <span className="px-3 py-1 bg-gray-800 text-primary-500 border border-gray-700 rounded-full text-[9px] font-black uppercase tracking-widest">
                      {listing.category}
                  </span>
                  {listing.isOnline && (
                    <span className="px-3 py-1 bg-primary-600 text-white rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1">
                        <Globe className="w-3 h-3" /> Online
                    </span>
                  )}
               </div>
               <h1 className="text-3xl font-black text-gray-50 mb-4 leading-tight">{listing.title}</h1>
               
               <div className="flex items-center gap-4 p-4 bg-gray-800/50 rounded-2xl border border-gray-700">
                  <Link to={`/profile/${listing.sellerId}`}>
                    <img 
                      src={listing.sellerAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(listing.sellerName)}`} 
                      className="w-12 h-12 rounded-xl object-cover border border-gray-700 shadow-sm" 
                      alt="" 
                    />
                  </Link>
                  <div>
                    <Link to={`/profile/${listing.sellerId}`} className="font-black text-gray-50 text-sm hover:text-primary-500 transition-colors">{listing.sellerName}</Link>
                    <div className="flex items-center text-yellow-500 text-xs font-bold mt-0.5">
                      <Star className="w-3.5 h-3.5 fill-current mr-1" />
                      <span>{listing.rating.toFixed(1)}</span>
                      <span className="ml-1 text-gray-500">({listing.reviewCount} reviews)</span>
                    </div>
                  </div>
               </div>
            </div>
          </div>

          {/* Description */}
          <div className="bg-gray-800 p-8 rounded-[2rem] border border-gray-700">
            <h3 className="text-sm font-black text-gray-500 uppercase tracking-widest mb-6">About this skill</h3>
            <div className="rich-text text-gray-300 leading-relaxed prose dark:prose-invert max-w-none text-lg" dangerouslySetInnerHTML={{ __html: listing.description }} />
          </div>

          {/* Portfolio Grid (Instagram Style) */}
          <div className="space-y-6">
            <h3 className="text-sm font-black text-gray-500 uppercase tracking-widest ml-2">Portfolio</h3>
            {galleryItems.length > 0 ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {galleryItems.map((img, index) => (
                  <div 
                    key={index} 
                    className="relative aspect-square rounded-2xl overflow-hidden bg-gray-800 border border-gray-700 group cursor-pointer"
                    onClick={() => setSelectedImage(img)}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Eye className="text-white w-6 h-6" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-gray-800/50 p-12 rounded-3xl text-center border border-dashed border-gray-700">
                <p className="text-gray-500 font-bold italic text-sm">No work samples shared yet.</p>
              </div>
            )}
          </div>

          {/* Feedback */}
          <div className="bg-gray-800 rounded-[2rem] border border-gray-700 p-8">
             <div className="flex items-center justify-between mb-8">
                <h3 className="text-sm font-black text-gray-500 uppercase tracking-widest">Feedback</h3>
                {user && user.id !== listing.sellerId && (
                    <button 
                        onClick={() => setShowReviewForm(!showReviewForm)}
                        className="text-primary-500 font-black text-[10px] uppercase tracking-widest hover:underline"
                    >
                        {showReviewForm ? "Cancel" : "Add Review"}
                    </button>
                )}
             </div>

             {showReviewForm && (
                 <form onSubmit={handleSubmitReview} className="mb-8 p-6 bg-gray-900 rounded-2xl border border-gray-700">
                    <div className="mb-6">
                        <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">Rating</label>
                        <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button key={star} type="button" onClick={() => setReviewRating(star)}>
                                    <Star className={`w-6 h-6 ${star <= reviewRating ? 'text-yellow-400 fill-current' : 'text-gray-700'}`} />
                                </button>
                            ))}
                        </div>
                    </div>
                    <textarea
                        required rows={3}
                        className="w-full border border-gray-700 rounded-xl p-4 bg-gray-800 text-gray-50 placeholder-gray-500 text-sm outline-none focus:ring-1 focus:ring-primary-500 mb-4 transition-all"
                        placeholder="Share your experience..."
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                    />
                    <button type="submit" className="w-full py-3 bg-primary-500 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:opacity-90">
                        Submit Review
                    </button>
                 </form>
             )}

             {reviews.length === 0 ? (
                 <p className="text-gray-500 text-center py-10 italic text-sm font-bold">No feedback yet.</p>
             ) : (
                 <div className="space-y-4">
                     {reviews.map(review => (
                         <div key={review.id} className="p-5 bg-gray-900/50 rounded-2xl border border-gray-700">
                             <div className="flex items-center justify-between mb-2">
                                <div className="font-bold text-gray-50 text-sm">{review.authorName}</div>
                                <div className="flex items-center gap-0.5">
                                   {[...Array(5)].map((_, i) => (
                                       <Star key={i} className={`w-2.5 h-2.5 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-800'}`} />
                                   ))}
                                </div>
                             </div>
                             <p className="text-gray-400 text-sm font-medium leading-relaxed italic">"{review.comment}"</p>
                         </div>
                     ))}
                 </div>
             )}
          </div>
        </div>

        {/* Right Column: Sticky Booking Card */}
        <div className="lg:col-span-4 relative">
           <div className="sticky top-24 bg-gray-800 p-8 rounded-[2.5rem] shadow-2xl border border-primary-500/20 ring-1 ring-primary-500/10">
              <div className="mb-8">
                  <div className="text-[9px] font-black text-gray-500 uppercase tracking-[0.2em] mb-2">Pricing</div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-black text-gray-50">₹{listing.price}</span>
                    <span className="text-gray-500 font-bold text-sm">/{listing.priceUnit}</span>
                  </div>
              </div>
              
              <div className="space-y-3 py-6 border-y border-gray-700 mb-8">
                 <div className="flex justify-between text-[11px] text-gray-400 font-black uppercase tracking-widest">
                   <span>Expert Service</span>
                   <span className="text-gray-50">₹{listing.price}</span>
                 </div>
                 <div className="flex justify-between text-[11px] text-gray-400 font-black uppercase tracking-widest">
                   <span>Booking Protection</span>
                   <span className="text-green-500">FREE</span>
                 </div>
              </div>

              <div className="space-y-4">
                {isOwner ? (
                  <div className="text-center p-6 bg-slate-900 rounded-2xl border border-slate-700">
                    <AlertTriangle className="w-6 h-6 text-orange-500 mx-auto mb-3" />
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-relaxed">
                      You cannot book your own service.
                    </p>
                    <Link to="/dashboard" className="mt-4 block text-[10px] font-black text-primary-500 uppercase tracking-widest hover:underline">
                      Manage this listing
                    </Link>
                  </div>
                ) : activeBooking?.status === BookingStatus.PENDING ? (
                  <div className="text-center p-5 bg-primary-500/5 rounded-2xl border border-primary-500/20">
                    <p className="text-primary-500 font-black flex items-center justify-center gap-2 uppercase tracking-[0.1em] text-[10px]">
                      <Clock className="w-4 h-4 animate-pulse" /> Request is Pending
                    </p>
                  </div>
                ) : (
                  <button 
                    onClick={() => handleAction('booking')}
                    className="w-full bg-primary-500 text-white py-5 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] hover:bg-primary-600 shadow-xl shadow-primary-900/40 transition active:scale-95 flex items-center justify-center gap-3"
                  >
                    <Calendar className="w-4 h-4" /> Reserve Session
                  </button>
                )}
                
                {!isOwner && (
                  <button 
                    onClick={() => handleAction('contact')}
                    className="w-full py-4 bg-gray-900 text-gray-300 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-700 transition active:scale-95 border border-gray-700"
                  >
                    <MessageSquare className="w-4 h-4 inline mr-2" /> Message Seller
                  </button>
                )}

                <div className="flex items-start gap-3 p-4 bg-gray-900 rounded-2xl border border-gray-700">
                   <Shield className="w-4 h-4 text-primary-500 flex-shrink-0" />
                   <p className="text-[8px] text-gray-500 leading-normal font-black uppercase tracking-widest">
                     Payments are held securely and released only after session completion.
                   </p>
                </div>
              </div>
           </div>
        </div>
      </div>

      {/* Booking Modal */}
      {isBookingOpen && (
        <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-md flex items-center justify-center z-[100] p-4 animate-fade-in" onClick={() => setIsBookingOpen(false)}>
          <div className="bg-gray-800 rounded-[2.5rem] shadow-2xl max-w-md w-full p-10 border border-gray-700 animate-fade-in" onClick={e => e.stopPropagation()}>
            <h2 className="text-2xl font-black mb-8 text-gray-50">Reserve Session</h2>
            <div className="space-y-6">
                <div>
                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">Proposed Date & Time</label>
                    <input
                        type="text"
                        className="w-full border border-gray-700 rounded-xl p-4 bg-gray-900 text-gray-50 outline-none focus:ring-1 focus:ring-primary-500 font-bold"
                        placeholder="e.g. Next Tuesday at 11 AM"
                        value={preferredTime}
                        onChange={(e) => setPreferredTime(e.target.value)}
                        autoFocus
                    />
                </div>
                <div>
                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">Optional message</label>
                    <textarea
                        className="w-full border border-gray-700 rounded-xl p-4 h-24 bg-gray-900 text-gray-50 outline-none focus:ring-1 focus:ring-primary-500 font-medium resize-none"
                        placeholder="Share a few details about what you need..."
                        value={bookingMessage}
                        onChange={(e) => setBookingMessage(e.target.value)}
                    />
                </div>
            </div>
            <div className="mt-10 flex gap-3">
              <button onClick={() => setIsBookingOpen(false)} className="flex-1 py-4 text-gray-500 font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-gray-700 transition">
                Cancel
              </button>
              <button 
                onClick={handleRequestBooking}
                disabled={!preferredTime.trim()}
                className="flex-[2] py-4 bg-primary-500 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:opacity-90 disabled:opacity-50 transition active:scale-95 shadow-lg shadow-primary-900/20"
              >
                Send Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Inquiry Modal */}
      {isContactOpen && (
        <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-md flex items-center justify-center z-[100] p-4 animate-fade-in" onClick={() => setIsContactOpen(false)}>
          <div className="bg-gray-800 rounded-[2.5rem] shadow-2xl max-w-md w-full p-10 border border-gray-700" onClick={e => e.stopPropagation()}>
            <h2 className="text-2xl font-black mb-8 text-gray-50">Send Inquiry</h2>
            <textarea
              className="w-full border border-gray-700 rounded-xl p-4 h-40 bg-gray-900 text-gray-50 outline-none focus:ring-1 focus:ring-primary-500 font-medium resize-none mb-8"
              placeholder={`Ask ${listing.sellerName} anything about this skill...`}
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              autoFocus
            />
            <div className="flex gap-3">
              <button onClick={() => setIsContactOpen(false)} className="flex-1 py-4 text-gray-500 font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-gray-700 transition">
                Back
              </button>
              <button 
                onClick={handleSendMessage}
                disabled={!messageText.trim()}
                className="flex-[2] py-4 bg-primary-500 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:opacity-90 transition active:scale-95 shadow-lg shadow-primary-900/20"
              >
                Send Message
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-[110] bg-black/95 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setSelectedImage(null)}
        >
          <button className="absolute top-8 right-8 text-white p-2 hover:bg-gray-800 rounded-full transition"><X className="w-8 h-8" /></button>
          <div className="max-w-4xl w-full h-full flex items-center justify-center" onClick={e => e.stopPropagation()}>
            <img src={selectedImage} alt="Preview" className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl" />
          </div>
        </div>
      )}
    </div>
  );
};