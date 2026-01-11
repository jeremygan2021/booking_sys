import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/rooms',
      name: 'rooms',
      component: () => import('../views/booking/RoomBookingView.vue'),
    },
    {
      path: '/rooms/book',
      name: 'room-booking',
      component: () => import('../views/booking/RoomBookingFormView.vue'),
    },
    {
      path: '/rooms/:id',
      name: 'room-detail',
      component: () => import('../components/booking/RoomDetail.vue'),
    },
    {
      path: '/restaurant',
      name: 'restaurant',
      component: () => import('../views/booking/RestaurantBookingView.vue'),
    },
    {
      path: '/admin',
      name: 'admin',
      component: () => import('../views/admin/AdminDashboard.vue'),
      meta: { requiresAuth: true },
      children: [
        {
          path: 'content',
          name: 'admin-content',
          component: () => import('../views/admin/ContentManagement.vue'),
        },
        {
          path: 'bookings',
          name: 'admin-bookings',
          component: () => import('../views/admin/BookingManagement.vue'),
        },
        {
          path: 'calendar',
          name: 'admin-calendar',
          component: () => import('../views/admin/CalendarView.vue'),
        },
        {
          path: 'timeslots',
          name: 'admin-timeslots',
          component: () => import('../views/admin/TimeSlotManagement.vue'),
        },
      ],
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
    },
    {
      path: '/booking/rooms',
      redirect: '/rooms',
    },
    {
      path: '/booking/restaurant',
      redirect: '/restaurant',
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/AboutView.vue'),
    },
    {
      path: '/contact',
      name: 'contact',
      component: () => import('../views/ContactView.vue'),
    },
  ],
})

// Navigation guard for admin routes
router.beforeEach(async (to, _from, next) => {
  const authStore = useAuthStore()

  // Check if route requires authentication
  if (to.matched.some((record) => record.meta.requiresAuth)) {
    // If not authenticated, verify token first
    if (!authStore.isAuthenticated) {
      const isValid = await authStore.verifyToken()

      if (!isValid) {
        // Redirect to login page
        next({
          name: 'login',
          query: { redirect: to.fullPath },
        })
        return
      }
    }

    // Check if user is admin
    if (!authStore.isAdmin) {
      // Redirect to home if not admin
      next({ name: 'home' })
      return
    }

    // User is authenticated and is admin
    next()
  } else if (to.name === 'login' && authStore.isAuthenticated) {
    // If already authenticated and trying to access login, redirect to admin
    next({ name: 'admin' })
  } else {
    // Route doesn't require authentication
    next()
  }
})

export default router
