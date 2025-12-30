
import { User, ServiceListing, Message, Review, Booking, BookingStatus } from '../types';
import { INITIAL_USERS, INITIAL_LISTINGS } from '../constants';

const STORAGE_KEYS = {
  USERS: 'skillshare_users',
  LISTINGS: 'skillshare_listings',
  MESSAGES: 'skillshare_messages',
  REVIEWS: 'skillshare_reviews',
  BOOKINGS: 'skillshare_bookings',
  CURRENT_USER: 'skillshare_current_user',
  GALLERIES: 'skillshare_galleries'
};

/**
 * Ensures all required storage keys exist.
 */
export const initializeStorage = () => {
  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
  }
  
  if (!localStorage.getItem(STORAGE_KEYS.LISTINGS)) {
    localStorage.setItem(STORAGE_KEYS.LISTINGS, JSON.stringify(INITIAL_LISTINGS));
  }

  if (!localStorage.getItem(STORAGE_KEYS.BOOKINGS)) {
    localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify([]));
  }

  if (!localStorage.getItem(STORAGE_KEYS.MESSAGES)) {
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify([]));
  }

  if (!localStorage.getItem(STORAGE_KEYS.REVIEWS)) {
    localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify([]));
  }

  if (!localStorage.getItem(STORAGE_KEYS.GALLERIES)) {
    localStorage.setItem(STORAGE_KEYS.GALLERIES, JSON.stringify({}));
  }
  
  console.log('SkillShare Storage Initialized');
};

// User Methods
export const getUsers = (): User[] => {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
};

export const saveUser = (user: User): void => {
  const users = getUsers();
  const index = users.findIndex(u => u.id === user.id);
  if (index >= 0) {
    users[index] = user;
  } else {
    users.push(user);
  }
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
};

// Gallery Methods
export const getGallery = (userId: string): string[] => {
  const galleries = JSON.parse(localStorage.getItem(STORAGE_KEYS.GALLERIES) || '{}');
  return galleries[userId] || [];
};

export const saveToGallery = (userId: string, imageUrl: string): void => {
  const galleries = JSON.parse(localStorage.getItem(STORAGE_KEYS.GALLERIES) || '{}');
  if (!galleries[userId]) galleries[userId] = [];
  galleries[userId].unshift(imageUrl); // Add to start
  localStorage.setItem(STORAGE_KEYS.GALLERIES, JSON.stringify(galleries));
};

export const removeFromGallery = (userId: string, imageUrl: string): void => {
  const data = localStorage.getItem(STORAGE_KEYS.GALLERIES);
  const galleries = data ? JSON.parse(data) : {};
  if (galleries[userId]) {
    const updated = (galleries[userId] as string[]).filter((img: string) => img !== imageUrl);
    galleries[userId] = updated;
    localStorage.setItem(STORAGE_KEYS.GALLERIES, JSON.stringify(galleries));
  }
};

// Authentication Session Methods
export const getCurrentUser = (): User | null => {
  const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  return data ? JSON.parse(data) : null;
};

export const setCurrentUser = (user: User | null): void => {
  if (user) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  } else {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  }
};

// Listing Methods
export const getListings = (): ServiceListing[] => {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.LISTINGS) || '[]');
};

export const saveListing = (listing: ServiceListing): void => {
  const listings = getListings();
  const index = listings.findIndex(l => l.id === listing.id);
  if (index >= 0) {
    listings[index] = listing;
  } else {
    listings.push(listing);
  }
  localStorage.setItem(STORAGE_KEYS.LISTINGS, JSON.stringify(listings));
};

export const deleteListing = (id: string): void => {
  let listings = getListings();
  listings = listings.filter(l => l.id !== id);
  localStorage.setItem(STORAGE_KEYS.LISTINGS, JSON.stringify(listings));
};

// Message Methods
export const getMessages = (): Message[] => {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.MESSAGES) || '[]');
};

export const sendMessage = (msg: Message): void => {
  const messages = getMessages();
  messages.push(msg);
  localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messages));
};

// Review Methods
export const getReviews = (): Review[] => {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.REVIEWS) || '[]');
};

export const getReviewsByListingId = (listingId: string): Review[] => {
  const allReviews = getReviews();
  return allReviews.filter(r => r.listingId === listingId).sort((a, b) => b.date - a.date);
};

export const addReview = (review: Review): void => {
  const reviews = getReviews();
  reviews.push(review);
  localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(reviews));

  const listings = getListings();
  const listingIndex = listings.findIndex(l => l.id === review.listingId);
  
  if (listingIndex >= 0) {
    const listing = listings[listingIndex];
    const currentTotalScore = listing.rating * listing.reviewCount;
    const newCount = listing.reviewCount + 1;
    const newRating = (currentTotalScore + review.rating) / newCount;
    listing.rating = newRating;
    listing.reviewCount = newCount;
    listings[listingIndex] = listing;
    localStorage.setItem(STORAGE_KEYS.LISTINGS, JSON.stringify(listings));
  }
};

// Booking Methods
export const getBookings = (): Booking[] => {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.BOOKINGS) || '[]');
};

export const saveBooking = (booking: Booking): void => {
  const bookings = getBookings();
  const index = bookings.findIndex(b => b.id === booking.id);
  if (index >= 0) {
    bookings[index] = booking;
  } else {
    bookings.push(booking);
  }
  localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));
};

export const updateBookingStatus = (id: string, status: BookingStatus): void => {
  const bookings = getBookings();
  const index = bookings.findIndex(b => b.id === id);
  if (index >= 0) {
    bookings[index].status = status;
    localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));
  }
};

// Helpers
export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};
