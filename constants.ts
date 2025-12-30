
import { ServiceCategory, UserRole, User, ServiceListing } from './types';

export const APP_NAME = "Sell Your Skill";

export const INITIAL_USERS: User[] = [
  {
    id: 'u1',
    name: 'Sarah Jenkins',
    email: 'sarah@example.com',
    role: UserRole.SELLER,
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200&h=200',
    bio: 'Passionate baker with 10 years of experience. I specialize in organic sourdough and french pastries. I believe in using only the highest quality local ingredients.',
    sessionsCompleted: 45
  },
  {
    id: 'u2',
    name: 'Mike Ross',
    email: 'mike@example.com',
    role: UserRole.BUYER,
    avatarUrl: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=200&h=200'
  },
  {
    id: 'u3',
    name: 'Admin User',
    email: 'admin@example.com',
    role: UserRole.ADMIN,
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200&h=200'
  }
];

export const INITIAL_LISTINGS: ServiceListing[] = [
  {
    id: 'l1',
    sellerId: 'u1',
    sellerName: 'Sarah Jenkins',
    sellerAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200&h=200',
    title: 'Artisan Sourdough Masterclass',
    description: 'Learn the secrets of perfect sourdough from home. We will cover starter maintenance, hydration levels, and baking techniques.',
    price: 450,
    priceUnit: 'hour',
    category: ServiceCategory.COOKING,
    location: 'Online',
    imageUrl: 'https://images.unsplash.com/photo-1585478259715-876a6a81fc08?auto=format&fit=crop&q=80&w=800&h=600',
    createdAt: Date.now() - 100000,
    rating: 4.9,
    reviewCount: 28,
    isOnline: true
  },
  {
    id: 'l2',
    sellerId: 'u4',
    sellerName: 'David Chen',
    sellerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200&h=200',
    title: 'I teach Python to beginners',
    description: 'Get started with programming using Python. I focus on practical exercises and building real-world projects.',
    price: 350,
    priceUnit: 'hour',
    category: ServiceCategory.PROGRAMMING,
    location: 'Westside Library / Online',
    imageUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=800&h=600',
    createdAt: Date.now() - 200000,
    rating: 5.0,
    reviewCount: 15,
    isOnline: true
  },
  {
    id: 'l3',
    sellerId: 'u5',
    sellerName: 'Elena Rodriguez',
    sellerAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200&h=200',
    title: 'I design basic UX/UI works',
    description: 'Master Figma and design principles. I will help you create your first mobile app prototype.',
    price: 850,
    priceUnit: 'job',
    category: ServiceCategory.DESIGN,
    location: 'North Hills',
    imageUrl: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&q=80&w=800&h=600',
    createdAt: Date.now() - 300000,
    rating: 4.7,
    reviewCount: 10,
    isOnline: false
  }
];
