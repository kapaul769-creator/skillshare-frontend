export enum UserRole {
  BUYER = 'BUYER',
  SELLER = 'SELLER',
  ADMIN = 'ADMIN'
}

export enum ServiceCategory {
  COOKING = 'Cooking & Baking',
  TUTORING = 'Tutoring',
  REPAIRS = 'Repairs & DIY',
  ARTS = 'Arts & Crafts',
  CLEANING = 'Cleaning',
  GARDENING = 'Gardening',
  TECH_SUPPORT = 'Tech Support',
  PROGRAMMING = 'Programming & IT',
  DESIGN = 'Design & Creative',
  LANGUAGES = 'Language & Communication',
  MUSIC = 'Music & Arts',
  OTHER = 'Other'
}

export enum BookingStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  bio?: string;
  sessionsCompleted?: number;
}

export interface ServiceListing {
  id: string;
  sellerId: string;
  sellerName: string;
  sellerAvatar?: string;
  title: string;
  description: string;
  price: number;
  priceUnit: 'hour' | 'job' | 'item';
  category: ServiceCategory;
  location: string;
  imageUrl: string;
  createdAt: number;
  rating: number;
  reviewCount: number;
  isOnline: boolean;
}

export interface Booking {
  id: string;
  listingId: string;
  listingTitle: string;
  buyerId: string;
  buyerName: string;
  sellerId: string;
  sellerName: string;
  status: BookingStatus;
  preferredTime: string;
  message: string;
  createdAt: number;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  listingId?: string;
  content: string;
  timestamp: number;
  read: boolean;
}

export interface Review {
  id: string;
  listingId: string;
  authorId: string;
  authorName: string;
  rating: number;
  comment: string;
  date: number;
}