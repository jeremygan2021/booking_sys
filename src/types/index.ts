// User types
export interface User {
  id: string
  email: string
  fullName: string
  phone?: string
  role: 'customer' | 'admin'
  createdAt: string
  updatedAt: string
}

// Room types
export interface RoomType {
  id: string
  name: string
  description?: string
  base_price: string // API returns as string
  max_occupancy: number
  amenities: string[]
  images: string[]
  created_at: string
  updated_at: string
}

export interface Room {
  id: string
  roomNumber: string
  roomTypeId: string
  roomType?: RoomType
  status: 'available' | 'occupied' | 'maintenance'
  createdAt: string
  updatedAt: string
}

export interface RoomBooking {
  id: string
  userId: string
  user?: User
  roomId: string
  room?: Room
  checkInDate: string
  checkOutDate: string
  guestCount: number
  totalPrice: number
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  specialRequests?: string
  createdAt: string
  updatedAt: string
}

// Restaurant types
export interface Cuisine {
  id: string
  name: string
  description?: string
  imageUrl?: string
  createdAt: string
}

export interface MealPackage {
  id: string
  name: string
  description?: string
  price: number
  cuisineId: string
  cuisine?: Cuisine
  mealType: 'lunch' | 'dinner'
  maxGuests: number
  createdAt: string
  updatedAt: string
}

export interface RestaurantBooking {
  id: string
  userId: string
  user?: User
  bookingDate: string
  mealType: 'lunch' | 'dinner'
  timeSlot: string
  guestCount: number
  packageId: string
  package?: MealPackage
  totalPrice: number
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  specialRequests?: string
  createdAt: string
  updatedAt: string
}

export interface TimeSlot {
  id: string
  mealType: 'lunch' | 'dinner'
  startTime: string
  endTime: string
  maxCapacity: number
  isActive: boolean
  createdAt: string
}

// Content management types
export interface ContentSection {
  id: string
  sectionKey: string
  title?: string
  content?: string
  images: string[]
  metadata: Record<string, unknown>
  updatedAt: string
}

export interface UploadedFile {
  id: string
  filename: string
  originalName: string
  filePath: string
  fileSize: number
  mimeType: string
  uploadedBy: string
  createdAt: string
}

// API response types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: unknown
    timestamp: string
  }
}

// Form types
export interface RoomBookingForm {
  checkInDate: string
  checkOutDate: string
  guestCount: number
  specialRequests?: string
}

export interface RestaurantBookingForm {
  bookingDate: string
  mealType: 'lunch' | 'dinner'
  timeSlot: string
  guestCount: number
  packageId: string
  specialRequests?: string
}

export interface LoginForm {
  email: string
  password: string
}

// Calendar types
export interface CalendarDay {
  date: string
  isAvailable: boolean
  isToday: boolean
  isSelected: boolean
  bookings: (RoomBooking | RestaurantBooking)[]
}

export interface CalendarMonth {
  year: number
  month: number
  days: CalendarDay[]
}
