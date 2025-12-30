import React, { useState, useRef } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ServiceCategory, ServiceListing, UserRole } from '../types';
import { generateId, saveListing } from '../services/storageService';
import { generateServiceDescription, suggestPrice } from '../services/geminiService';
import { Wand2, Loader2, X, Image as ImageIcon } from 'lucide-react';
import { RichTextEditor } from '../components/RichTextEditor';

export const CreateListing: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ServiceCategory>(ServiceCategory.OTHER);
  const [price, setPrice] = useState('');
  const [priceUnit, setPriceUnit] = useState<'hour' | 'job' | 'item'>('hour');
  const [location, setLocation] = useState('');
  const [isOnline, setIsOnline] = useState(false);
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [keywords, setKeywords] = useState('');
  
  const [isGenerating, setIsGenerating] = useState(false);

  if (!user || user.role !== UserRole.SELLER) {
     return <Navigate to="/" />;
  }

  const handleAISuggest = async () => {
    if (!title) return;
    setIsGenerating(true);
    const [desc, priceRange] = await Promise.all([
        generateServiceDescription(title, category, keywords),
        suggestPrice(title, category)
    ]);
    setDescription(`<p>${desc.replace(/\n/g, '<br/>')}</p>`);
    if (priceRange && !price) {
        const match = priceRange.match(/\d+/);
        if (match) setPrice(match[0]);
    }
    setIsGenerating(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024 * 2) return;
      const reader = new FileReader();
      reader.onloadend = () => setImageUrl(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newListing: ServiceListing = {
      id: generateId(),
      sellerId: user.id,
      sellerName: user.name,
      sellerAvatar: user.avatarUrl,
      title,
      category,
      price: parseFloat(price),
      priceUnit,
      location,
      isOnline,
      description,
      imageUrl: imageUrl || `https://picsum.photos/seed/${generateId()}/800/600`,
      createdAt: Date.now(),
      rating: 0,
      reviewCount: 0
    };
    saveListing(newListing);
    navigate('/dashboard');
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 transition-colors duration-300">
      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-3xl overflow-hidden border border-gray-100 dark:border-gray-700">
        <div className="bg-primary-600 dark:bg-primary-500 px-8 py-8">
           <h1 className="text-2xl font-black text-white">Create Listing</h1>
           <p className="text-primary-100 mt-1 font-medium text-sm">Share your professional expertise with the community.</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="col-span-2">
              <label className="block text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">Skill Title</label>
              <input 
                type="text" required 
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border-none rounded-xl text-sm text-gray-900 dark:text-gray-50 outline-none focus:ring-2 focus:ring-primary-600/10 transition-all font-bold"
                placeholder="e.g. Personal Training, Cooking Classes"
                value={title} onChange={e => setTitle(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">Category</label>
              <select 
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border-none rounded-xl text-sm text-gray-900 dark:text-gray-50 outline-none focus:ring-2 focus:ring-primary-600/10 font-bold"
                value={category} onChange={e => setCategory(e.target.value as ServiceCategory)}
              >
                {Object.values(ServiceCategory).map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">Location</label>
              <input 
                type="text" required 
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border-none rounded-xl text-sm text-gray-900 dark:text-gray-50 outline-none focus:ring-2 focus:ring-primary-600/10 font-bold"
                placeholder="Neighborhood or Online"
                value={location} onChange={e => setLocation(e.target.value)}
              />
            </div>

            <div className="flex items-center sm:pt-4">
               <input 
                 id="isOnline" type="checkbox"
                 className="h-5 w-5 text-primary-600 focus:ring-primary-600/20 border-gray-300 dark:border-gray-700 rounded bg-gray-50 dark:bg-gray-900"
                 checked={isOnline} onChange={e => setIsOnline(e.target.checked)}
               />
               <label htmlFor="isOnline" className="ml-3 text-sm font-bold text-gray-600 dark:text-gray-300">
                 Online sessions available
               </label>
            </div>

            <div>
               <label className="block text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">Price (₹)</label>
               <input 
                 type="number" required min="0" 
                 className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border-none rounded-xl text-sm text-gray-900 dark:text-gray-50 outline-none focus:ring-2 focus:ring-primary-600/10 font-bold"
                 value={price} onChange={e => setPrice(e.target.value)}
               />
            </div>

            <div>
               <label className="block text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">Unit</label>
               <select 
                 className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border-none rounded-xl text-sm text-gray-900 dark:text-gray-50 outline-none focus:ring-2 focus:ring-primary-600/10 font-bold"
                 value={priceUnit} onChange={e => setPriceUnit(e.target.value as any)}
               >
                 <option value="hour">Per Hour</option>
                 <option value="job">Fixed Price</option>
                 <option value="item">Per Item</option>
               </select>
            </div>
            
             <div className="col-span-2">
               <label className="block text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">Skill Image</label>
               <div className="mt-1 flex justify-center px-6 py-10 border-2 border-gray-100 dark:border-gray-700 border-dashed rounded-3xl bg-gray-50 dark:bg-gray-900 relative transition-all hover:border-primary-400 group">
                 {imageUrl ? (
                   <div className="relative w-full">
                     <img src={imageUrl} alt="Preview" className="max-h-64 mx-auto rounded-2xl object-cover" />
                     <button type="button" onClick={() => setImageUrl('')} className="absolute -top-2 -right-2 p-1.5 bg-red-500 text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                       <X className="w-4 h-4" />
                     </button>
                   </div>
                 ) : (
                   <div className="space-y-1 text-center">
                     <ImageIcon className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-700" />
                     <div className="flex text-sm font-bold text-gray-500 dark:text-gray-400">
                       <label className="relative cursor-pointer text-primary-600 dark:text-primary-500 hover:underline">
                         <span>Upload a photo</span>
                         <input ref={fileInputRef} type="file" className="sr-only" accept="image/*" onChange={handleFileChange} />
                       </label>
                       <p className="pl-1">or drag and drop</p>
                     </div>
                   </div>
                 )}
               </div>
            </div>

            <div className="col-span-2">
              <div className="bg-primary-50 dark:bg-gray-900 p-6 rounded-2xl border border-primary-100 dark:border-gray-700 mb-6">
                  <h4 className="text-xs font-black text-primary-600 dark:text-primary-500 flex items-center uppercase tracking-widest mb-3">
                      <Wand2 className="w-4 h-4 mr-2" /> AI Assistant
                  </h4>
                  <div className="flex gap-2">
                     <input 
                        type="text" placeholder="Keywords (e.g. expert, friendly)..." 
                        className="flex-1 px-4 py-2 bg-white dark:bg-gray-800 border-none rounded-xl text-xs text-gray-900 dark:text-gray-50 outline-none focus:ring-2 focus:ring-primary-600/10 font-medium"
                        value={keywords} onChange={(e) => setKeywords(e.target.value)}
                     />
                     <button 
                        type="button" onClick={handleAISuggest} disabled={isGenerating || !title}
                        className="bg-primary-600 dark:bg-primary-500 text-white px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:opacity-90 disabled:opacity-50 transition flex items-center"
                     >
                        {isGenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Write"}
                     </button>
                  </div>
              </div>

              <label className="block text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">Service Description</label>
              <RichTextEditor value={description} onChange={setDescription} />
            </div>
          </div>

          <div className="pt-8 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3">
             <button
               type="button" onClick={() => navigate('/dashboard')}
               className="px-6 py-3 bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-300 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-gray-100 dark:hover:bg-gray-600 transition"
             >
               Cancel
             </button>
             <button
               type="submit"
               className="px-8 py-3 bg-primary-600 dark:bg-primary-500 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:opacity-90 shadow-lg shadow-primary-200 dark:shadow-none transition active:scale-95"
             >
               Post Skill
             </button>
          </div>
        </form>
      </div>
    </div>
  );
};