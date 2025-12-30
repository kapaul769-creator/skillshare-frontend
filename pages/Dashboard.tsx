import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getListings, getMessages, deleteListing, getBookings, updateBookingStatus } from '../services/storageService';
import { ServiceListing, Message, UserRole, Booking, BookingStatus } from '../types';
import { Link, Navigate } from 'react-router-dom';
import { Plus, Trash2, Mail, Edit, Calendar, CheckCircle, XCircle, Clock, Star } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [myListings, setMyListings] = useState<ServiceListing[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [activeTab, setActiveTab] = useState<'listings' | 'bookings' | 'messages'>('bookings');

  useEffect(() => {
    if (user) {
      const allListings = getListings();
      setMyListings(allListings.filter(l => l.sellerId === user.id));

      const allMessages = getMessages();
      setMessages(allMessages.filter(m => m.receiverId === user.id));

      const allBookings = getBookings();
      setBookings(allBookings.filter(b => b.sellerId === user.id).sort((a,b) => b.createdAt - a.createdAt));
    }
  }, [user]);

  const handleDeleteListing = (id: string) => {
    if (confirm('Delete this skill listing?')) {
      deleteListing(id);
      setMyListings(prev => prev.filter(l => l.id !== id));
    }
  };

  const handleBookingStatus = (id: string, status: BookingStatus) => {
    updateBookingStatus(id, status);
    setBookings(prev => prev.map(b => b.id === id ? {...b, status} : b));
  };

  if (!user) return <Navigate to="/" />;
  if (user.role !== UserRole.SELLER) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 transition-colors duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
            <h1 className="text-4xl font-black text-gray-900 dark:text-gray-50">Seller Console</h1>
            <p className="text-gray-500 dark:text-gray-300 mt-2 font-medium">Overview of your skills and community impact.</p>
        </div>
        <Link to="/create-listing" className="inline-flex items-center px-8 py-3 bg-primary-600 dark:bg-primary-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-primary-200 dark:shadow-none hover:opacity-90 transition active:scale-95">
            <Plus className="w-4 h-4 mr-2" /> List New Skill
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {[
            { label: 'My Skills', value: myListings.length, color: 'text-primary-600 dark:text-primary-500' },
            { label: 'Pending Slots', value: bookings.filter(b => b.status === BookingStatus.PENDING).length, color: 'text-warning-500' },
            { label: 'Completed', value: bookings.filter(b => b.status === BookingStatus.COMPLETED).length, color: 'text-success-500' },
            { label: 'Inquiries', value: messages.length, color: 'text-indigo-400' },
        ].map((stat, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="text-[9px] text-gray-400 dark:text-gray-500 font-black uppercase tracking-widest mb-1">{stat.label}</div>
                <div className={`text-3xl font-black ${stat.color}`}>{stat.value}</div>
            </div>
        ))}
      </div>

      {/* View Switcher */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-1">
        {(['bookings', 'listings', 'messages'] as const).map(tab => (
            <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${
                    activeTab === tab 
                    ? 'bg-gray-900 dark:bg-primary-500 text-white shadow-md' 
                    : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
            >
                {tab}
            </button>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        {activeTab === 'bookings' && (
            <div className="p-8">
                <h2 className="text-xl font-bold mb-8 text-gray-900 dark:text-gray-50">Recent Requests</h2>
                {bookings.length === 0 ? (
                    <p className="text-center py-12 text-gray-400 italic text-sm">No session requests.</p>
                ) : (
                    <div className="space-y-4">
                        {bookings.map(booking => (
                            <div key={booking.id} className="p-6 bg-gray-50 dark:bg-gray-900 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 border border-transparent hover:border-gray-200 dark:hover:border-gray-700 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-500 font-black text-lg">
                                        {booking.buyerName.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="font-bold text-gray-900 dark:text-gray-50">{booking.buyerName}</div>
                                        <div className="text-xs text-gray-500 dark:text-gray-300 font-medium">{booking.listingTitle}</div>
                                        <div className="flex items-center gap-2 mt-1 text-[10px] font-bold text-primary-600 dark:text-primary-500">
                                            <Calendar className="w-3 h-3" /> {booking.preferredTime}
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="flex gap-2">
                                    {booking.status === BookingStatus.PENDING && (
                                        <>
                                            <button 
                                                onClick={() => handleBookingStatus(booking.id, BookingStatus.ACCEPTED)}
                                                className="px-4 py-2 bg-success-500 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:opacity-90"
                                            >
                                                Accept
                                            </button>
                                            <button 
                                                onClick={() => handleBookingStatus(booking.id, BookingStatus.CANCELLED)}
                                                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-[10px] font-black uppercase tracking-widest hover:opacity-90"
                                            >
                                                Deny
                                            </button>
                                        </>
                                    )}
                                    {booking.status === BookingStatus.ACCEPTED && (
                                        <button 
                                            onClick={() => handleBookingStatus(booking.id, BookingStatus.COMPLETED)}
                                            className="px-4 py-2 bg-primary-600 dark:bg-primary-500 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:opacity-90"
                                        >
                                            Mark Done
                                        </button>
                                    )}
                                    {booking.status === BookingStatus.COMPLETED && (
                                        <span className="px-4 py-2 bg-success-500/10 text-success-500 rounded-lg text-[10px] font-black uppercase tracking-widest">Completed</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        )}

        {activeTab === 'listings' && (
            <div className="p-8">
                <h2 className="text-xl font-bold mb-8 text-gray-900 dark:text-gray-50">Active Skills</h2>
                {myListings.length === 0 ? (
                    <p className="text-center py-12 text-gray-400 italic text-sm">No skills listed yet.</p>
                ) : (
                    <div className="grid gap-4">
                        {myListings.map(listing => (
                            <div key={listing.id} className="p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl flex items-center justify-between border border-transparent hover:border-gray-200 dark:hover:border-gray-700 transition-all">
                                <div className="flex items-center gap-4">
                                    <img src={listing.imageUrl} alt="" className="h-16 w-16 rounded-xl object-cover shadow-sm" />
                                    <div>
                                        <h4 className="text-sm font-bold text-gray-900 dark:text-gray-50">{listing.title}</h4>
                                        <div className="text-xs font-black text-primary-600 dark:text-primary-500 mt-0.5">₹{listing.price}/{listing.priceUnit}</div>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => handleDeleteListing(listing.id)}
                                        className="p-2.5 bg-white dark:bg-gray-800 text-gray-400 hover:text-red-500 rounded-lg transition-colors shadow-sm"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        )}

        {activeTab === 'messages' && (
            <div className="p-8">
                <h2 className="text-xl font-bold mb-8 text-gray-900 dark:text-gray-50">Inquiries</h2>
                {messages.length === 0 ? (
                    <p className="text-center py-12 text-gray-400 italic text-sm">No messages.</p>
                ) : (
                    <div className="space-y-6">
                        {messages.map(msg => (
                            <div key={msg.id} className="p-6 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-transparent">
                                <div className="flex justify-between items-center mb-2">
                                    <div className="font-bold text-gray-900 dark:text-gray-50 text-sm">Inquiry from Client</div>
                                    <div className="text-[10px] text-gray-400 font-bold">{new Date(msg.timestamp).toLocaleDateString()}</div>
                                </div>
                                <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed mb-3">"{msg.content}"</p>
                                <button className="text-[10px] font-black text-primary-600 dark:text-primary-500 uppercase tracking-widest hover:underline">Reply</button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        )}
      </div>
    </div>
  );
};