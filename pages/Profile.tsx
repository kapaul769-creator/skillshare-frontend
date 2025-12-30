import React, { useEffect, useState, useRef } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { getUsers, getListings, saveUser, getGallery, saveToGallery, removeFromGallery, saveListing } from '../services/storageService';
import { generatePortfolioImage } from '../services/geminiService';
import { User, ServiceListing } from '../types';
import { ServiceCard } from '../components/ServiceCard';
import { Mail, Calendar, Briefcase, Star, Edit2, X, Camera, Plus, Trash2, Eye, Wand2, Loader2, Sparkles, Check, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { RichTextEditor } from '../components/RichTextEditor';

export const Profile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user: currentUser, login } = useAuth();
  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [userListings, setUserListings] = useState<ServiceListing[]>([]);
  const [galleryItems, setGalleryItems] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  // Feedback State
  const [isUpdatingAvatar, setIsUpdatingAvatar] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // AI Generation State
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiTopic, setAiTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPreview, setGeneratedPreview] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const [isEditingBio, setIsEditingBio] = useState(false);
  const [editedBio, setEditedBio] = useState('');

  useEffect(() => {
    if (id) {
        const users = getUsers();
        const user = users.find(u => u.id === id);
        if (user) {
            setProfileUser(user);
            setEditedBio(user.bio || '');
            const listings = getListings();
            const relevantListings = listings.filter(l => l.sellerId === user.id);
            setUserListings(relevantListings);
            setGalleryItems(getGallery(user.id));
        }
    }
    setLoading(false);
  }, [id]);

  const handleSaveBio = () => {
    if (profileUser) {
        const updatedUser = { ...profileUser, bio: editedBio };
        saveUser(updatedUser);
        setProfileUser(updatedUser);
        setIsEditingBio(false);
        if (currentUser?.id === profileUser.id) login(updatedUser);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && profileUser) {
      if (file.size > 1024 * 1024) {
        alert("Image is too large. Please select an image under 1MB.");
        return;
      }
      
      setIsUpdatingAvatar(true);
      const reader = new FileReader();
      
      reader.onloadend = () => {
        const newAvatarUrl = reader.result as string;
        const updatedUser = { ...profileUser, avatarUrl: newAvatarUrl };
        
        // 1. Update the user profile
        saveUser(updatedUser);
        setProfileUser(updatedUser);
        
        // 2. Cascade update to all their listings in the marketplace
        const allListings = getListings();
        let updateCount = 0;
        allListings.forEach(l => {
          if (l.sellerId === profileUser.id) {
            l.sellerAvatar = newAvatarUrl;
            saveListing(l);
            updateCount++;
          }
        });

        // 3. Update active session if it's the current user
        if (currentUser?.id === profileUser.id) {
          login(updatedUser);
        }

        // 4. Refresh local state listings view
        const refreshedListings = getListings().filter(l => l.sellerId === profileUser.id);
        setUserListings(refreshedListings);

        // 5. Provide Feedback
        setTimeout(() => {
          setIsUpdatingAvatar(false);
          setSuccessMsg('Profile picture updated across marketplace!');
          setShowSuccess(true);
          setTimeout(() => setShowSuccess(false), 3000);
        }, 800);
      };
      
      reader.readAsDataURL(file);
    }
  };

  const handleGalleryUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && profileUser) {
      if (file.size > 1024 * 512) {
        alert("Image is too large. Please keep it under 500KB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        saveToGallery(profileUser.id, dataUrl);
        setGalleryItems(prev => [dataUrl, ...prev]);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAiGenerate = async () => {
    if (!aiTopic.trim() || !profileUser) return;
    setIsGenerating(true);
    setGeneratedPreview(null);
    
    const primarySkill = userListings[0]?.title || profileUser.name;
    const result = await generatePortfolioImage(aiTopic, primarySkill);
    
    if (result) {
      setGeneratedPreview(result);
    } else {
      alert("Failed to generate image. Please try a different prompt.");
    }
    setIsGenerating(false);
  };

  const handleSaveAiWork = () => {
    if (generatedPreview && profileUser) {
      saveToGallery(profileUser.id, generatedPreview);
      setGalleryItems(prev => [generatedPreview, ...prev]);
      setIsAiModalOpen(false);
      setGeneratedPreview(null);
      setAiTopic('');
    }
  };

  const handleDeleteFromGallery = (img: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (profileUser && window.confirm('Are you sure you want to remove this work from your portfolio?')) {
      removeFromGallery(profileUser.id, img);
      setGalleryItems(prev => prev.filter(item => item !== img));
    }
  };

  if (loading) return null;
  if (!profileUser) return <Navigate to="/marketplace" />;

  const isOwner = currentUser?.id === profileUser.id;

  return (
    <div className="min-h-screen bg-gray-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {showSuccess && (
          <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-emerald-500 text-white px-6 py-4 rounded-2xl shadow-2xl z-[150] flex items-center animate-fade-in border border-emerald-400">
            <CheckCircle className="w-4 h-4 mr-3" />
            <span className="font-black text-[10px] uppercase tracking-widest">{successMsg}</span>
          </div>
        )}

        {/* Profile Header */}
        <div className="bg-gray-800 rounded-[2.5rem] p-10 mb-12 border border-gray-700 shadow-xl">
          <div className="flex flex-col md:flex-row items-center gap-10">
            <div className="relative group">
              <div className="relative w-40 h-40 rounded-[2.5rem] overflow-hidden border-4 border-gray-700 shadow-2xl bg-gray-900">
                <img 
                  src={profileUser.avatarUrl || `https://ui-avatars.com/api/?name=${profileUser.name}`} 
                  alt={profileUser.name}
                  className={`w-full h-full object-cover transition-opacity duration-300 ${isUpdatingAvatar ? 'opacity-30' : 'opacity-100'}`}
                />
                {isUpdatingAvatar && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-primary-500">
                    <Loader2 className="w-8 h-8 animate-spin" />
                    <span className="text-[8px] font-black uppercase tracking-tighter mt-2">Updating...</span>
                  </div>
                )}
                {isOwner && !isUpdatingAvatar && (
                  <label className="absolute inset-0 flex items-center justify-center bg-black/40 text-white cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="w-8 h-8" />
                    <input ref={fileInputRef} type="file" className="sr-only" accept="image/*" onChange={handleAvatarChange} />
                  </label>
                )}
              </div>
            </div>
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
                <h1 className="text-4xl font-black text-gray-50">{profileUser.name}</h1>
                <span className="px-4 py-1.5 bg-primary-600/10 text-primary-500 border border-primary-500/20 rounded-full text-[10px] font-black uppercase tracking-[0.2em] inline-block mx-auto md:mx-0">
                  {profileUser.role}
                </span>
              </div>
              
              <div className="flex flex-wrap justify-center md:justify-start gap-6 mt-6">
                <div className="flex flex-col items-center md:items-start">
                   <span className="text-lg font-black text-gray-50">{userListings.length}</span>
                   <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Active Skills</span>
                </div>
                <div className="w-px h-10 bg-gray-700 hidden md:block"></div>
                <div className="flex flex-col items-center md:items-start">
                   <span className="text-lg font-black text-gray-50">{galleryItems.length}</span>
                   <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Portfolio Works</span>
                </div>
                <div className="w-px h-10 bg-gray-700 hidden md:block"></div>
                <div className="flex flex-col items-center md:items-start">
                   <span className="text-lg font-black text-gray-50">Verified</span>
                   <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Trust Status</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Portfolio Section (Instagram Style) */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-8 px-4">
            <h2 className="text-sm font-black text-gray-500 uppercase tracking-[0.3em]">Portfolio</h2>
            {isOwner && (
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setIsAiModalOpen(true)}
                  className="inline-flex items-center gap-2 px-6 py-2 bg-gray-800 text-primary-400 border border-gray-700 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-gray-700 transition active:scale-95"
                >
                  <Wand2 className="w-3.5 h-3.5" /> Generate with AI
                </button>
                <button 
                  onClick={() => galleryInputRef.current?.click()}
                  className="inline-flex items-center gap-2 px-6 py-2 bg-primary-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-primary-600 transition active:scale-95"
                >
                  <Plus className="w-4 h-4" /> Add Work
                  <input ref={galleryInputRef} type="file" className="sr-only" accept="image/*" onChange={handleGalleryUpload} />
                </button>
              </div>
            )}
          </div>

          {galleryItems.length > 0 ? (
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 md:gap-4 px-1 md:px-0">
              {galleryItems.map((img, index) => (
                <div 
                  key={index} 
                  className="relative aspect-square rounded-xl md:rounded-2xl overflow-hidden bg-gray-800 border border-gray-700 group cursor-pointer"
                  onClick={() => setSelectedImage(img)}
                >
                  <img src={img} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                    <Eye className="text-white w-6 h-6" />
                    {isOwner && (
                      <button 
                        onClick={(e) => handleDeleteFromGallery(img, e)}
                        className="text-white bg-red-600 p-2 rounded-full hover:bg-red-700 transition-colors z-20"
                        title="Delete Image"
                      >
                        <Trash2 className="w-4 h-4 pointer-events-none" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-gray-800/50 p-20 rounded-3xl text-center border-2 border-dashed border-gray-700 mx-4">
              <p className="text-gray-500 font-bold italic">Share your craft with the community.</p>
            </div>
          )}
        </div>

        {/* About & Listed Skills Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-1 space-y-8">
            <div className="bg-gray-800 p-8 rounded-[2rem] border border-gray-700">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest">About</h3>
                {isOwner && !isEditingBio && (
                  <button onClick={() => setIsEditingBio(true)} className="text-primary-500 hover:underline flex items-center text-[10px] font-black uppercase tracking-widest">
                    Edit
                  </button>
                )}
              </div>

              {isEditingBio ? (
                <div className="space-y-4">
                  <RichTextEditor value={editedBio} onChange={setEditedBio} />
                  <div className="flex justify-end gap-2">
                    <button onClick={() => setIsEditingBio(false)} className="px-4 py-2 text-[10px] font-black text-gray-500 uppercase tracking-widest hover:bg-gray-700 rounded-lg">Cancel</button>
                    <button onClick={handleSaveBio} className="px-6 py-2 bg-primary-500 text-white text-[10px] font-black uppercase tracking-widest rounded-lg">Save</button>
                  </div>
                </div>
              ) : (
                <div className="text-gray-400 leading-relaxed rich-text text-sm">
                  <div dangerouslySetInnerHTML={{ __html: profileUser.bio || "No biography shared yet." }} />
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-2">
            <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-8 ml-4">Listed Skills</h3>
            {userListings.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {userListings.map(listing => <ServiceCard key={listing.id} listing={listing} />)}
              </div>
            ) : (
              <div className="bg-gray-800/50 p-12 rounded-[2rem] text-center border border-gray-700">
                <p className="text-gray-500 font-bold italic text-sm">No active skills listed.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* AI Generator Modal */}
      {isAiModalOpen && (
        <div className="fixed inset-0 bg-gray-900/90 backdrop-blur-md flex items-center justify-center z-[120] p-4 animate-fade-in" onClick={() => !isGenerating && setIsAiModalOpen(false)}>
          <div className="bg-gray-800 rounded-[2.5rem] shadow-2xl max-w-lg w-full p-10 border border-gray-700 overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-black text-gray-50 flex items-center gap-3">
                <Sparkles className="text-primary-500 w-6 h-6" /> AI Work Sample
              </h2>
              {!isGenerating && <button onClick={() => setIsAiModalOpen(false)} className="text-gray-500 hover:text-white"><X className="w-6 h-6" /></button>}
            </div>

            {generatedPreview ? (
              <div className="space-y-8 animate-fade-in">
                <div className="relative aspect-square w-full rounded-2xl overflow-hidden border border-gray-700 shadow-xl">
                   <img src={generatedPreview} alt="Generated Work" className="w-full h-full object-cover" />
                </div>
                <div className="flex gap-3">
                   <button 
                    onClick={() => { setGeneratedPreview(null); setAiTopic(''); }}
                    className="flex-1 py-4 bg-gray-900 text-gray-400 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-700 transition"
                   >
                     Redo
                   </button>
                   <button 
                    onClick={handleSaveAiWork}
                    className="flex-[2] py-4 bg-primary-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:opacity-90 transition shadow-lg shadow-primary-900/20 flex items-center justify-center gap-2"
                   >
                     <Check className="w-4 h-4" /> Add to Portfolio
                   </button>
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                <div>
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4">What should the sample show?</label>
                  <textarea 
                    autoFocus
                    disabled={isGenerating}
                    className="w-full h-32 bg-gray-900 border border-gray-700 rounded-2xl p-5 text-gray-50 font-medium placeholder-gray-600 outline-none focus:ring-1 focus:ring-primary-500 transition-all resize-none"
                    placeholder="Describe a specific work result (e.g. 'A close up of a perfectly glazed chocolate cake' or 'A screenshot of a modern mobile app dashboard')."
                    value={aiTopic}
                    onChange={(e) => setAiTopic(e.target.value)}
                  />
                </div>

                {isGenerating ? (
                  <div className="py-12 flex flex-col items-center justify-center space-y-4">
                     <Loader2 className="w-10 h-10 text-primary-500 animate-spin" />
                     <p className="text-[10px] font-black text-primary-500 uppercase tracking-[0.2em] animate-pulse">Visualizing your craft...</p>
                  </div>
                ) : (
                  <button 
                    onClick={handleAiGenerate}
                    disabled={!aiTopic.trim()}
                    className="w-full py-5 bg-primary-500 text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] hover:bg-primary-600 disabled:opacity-50 transition active:scale-95 shadow-xl shadow-primary-900/20"
                  >
                    Generate Sample
                  </button>
                )}
              </div>
            )}
            
            <p className="mt-8 text-[8px] text-gray-600 font-black uppercase tracking-widest text-center">
              AI generated images are for illustrative purposes and match your listed skill context.
            </p>
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
          <div className="max-w-5xl w-full h-full flex items-center justify-center" onClick={e => e.stopPropagation()}>
            <img src={selectedImage} alt="Preview" className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl" />
          </div>
        </div>
      )}
    </div>
  );
};