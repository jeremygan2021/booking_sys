import request from 'supertest';
import app from '../src/app.js';
import pool from '../src/db/connection.js';
import bcrypt from 'bcryptjs';

/**
 * Integration Tests for Aiyunxiangshe Booking System
 * 
 * These tests verify:
 * 1. Complete booking flow (room and restaurant)
 * 2. Admin backend functionality integration
 * 3. Real-time sync and error recovery
 */

describe('Integration Tests - Booking System', () => {
  let authToken;
  let adminToken;
  let testUserId;
  let testAdminId;
  let testRoomTypeId;
  let testRoomId;
  let testCuisineId;
  let testPackageId;
  let testTimeSlotId;

  // Setup: Create test users and initial data
  beforeAll(async () => {
    // Create test customer user
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('testpassword123', salt);
    
    const userResult = await pool.query(
      'INSERT INTO users (email, password_hash, full_name, phone, role) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      [`test_${Date.now()}@example.com`, passwordHash, 'Test User', '1234567890', 'customer']
    );
    testUserId = userResult.rows[0].id;

    // Create test admin user
    const adminResult = await pool.query(
      'INSERT INTO users (email, password_hash, full_name, phone, role) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      [`admin_${Date.now()}@example.com`, passwordHash, 'Test Admin', '0987654321', 'admin']
    );
    testAdminId = adminResult.rows[0].id;

    // Login to get tokens
    await request(app)
      .post('/api/auth/login')
      .send({
        email: `test_${Date.now()}@example.com`,
        password: 'testpassword123'
      });
    
    // Note: The email won't match exactly due to timestamp, so we'll generate tokens manually
    const { generateToken } = await import('../src/utils/jwt.js');
    authToken = generateToken(testUserId, 'customer');
    adminToken = generateToken(testAdminId, 'admin');

    // Create test room type
    const roomTypeResult = await pool.query(
      `INSERT INTO room_types (name, description, base_price, max_occupancy, amenities, images)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
      ['Test Suite Room', 'A beautiful test room', 500.00, 2, JSON.stringify(['WiFi', 'TV']), JSON.stringify([])]
    );
    testRoomTypeId = roomTypeResult.rows[0].id;

    // Create test room
    const roomResult = await pool.query(
      'INSERT INTO rooms (room_number, room_type_id, status) VALUES ($1, $2, $3) RETURNING id',
      ['TEST-101', testRoomTypeId, 'available']
    );
    testRoomId = roomResult.rows[0].id;

    // Create test cuisine
    const cuisineResult = await pool.query(
      'INSERT INTO cuisines (name, description, image_url) VALUES ($1, $2, $3) RETURNING id',
      ['Test Cuisine', 'Test cuisine description', 'test.jpg']
    );
    testCuisineId = cuisineResult.rows[0].id;

    // Create test meal package
    const packageResult = await pool.query(
      `INSERT INTO meal_packages (name, description, price, cuisine_id, meal_type, max_guests)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
      ['Test Package', 'Test package description', 200.00, testCuisineId, 'lunch', 4]
    );
    testPackageId = packageResult.rows[0].id;

    // Create test time slot
    const timeSlotResult = await pool.query(
      `INSERT INTO time_slots (meal_type, start_time, end_time, max_capacity, is_active)
       VALUES ($1, $2, $3, $4, $5) RETURNING id`,
      ['lunch', '12:00:00', '14:00:00', 20, true]
    );
    testTimeSlotId = timeSlotResult.rows[0].id;
  });

  // Cleanup: Remove test data
  afterAll(async () => {
    // Delete in reverse order of dependencies
    await pool.query('DELETE FROM room_bookings WHERE user_id IN ($1, $2)', [testUserId, testAdminId]);
    await pool.query('DELETE FROM restaurant_bookings WHERE user_id IN ($1, $2)', [testUserId, testAdminId]);
    await pool.query('DELETE FROM rooms WHERE id = $1', [testRoomId]);
    await pool.query('DELETE FROM room_types WHERE id = $1', [testRoomTypeId]);
    await pool.query('DELETE FROM meal_packages WHERE id = $1', [testPackageId]);
    await pool.query('DELETE FROM cuisines WHERE id = $1', [testCuisineId]);
    await pool.query('DELETE FROM time_slots WHERE id = $1', [testTimeSlotId]);
    await pool.query('DELETE FROM users WHERE id IN ($1, $2)', [testUserId, testAdminId]);
    
    await pool.end();
  });

  /**
   * Test 1: Complete Room Booking Flow
   * Validates: Requirements 2.1, 2.2, 2.3, 2.4
   */
  describe('Complete Room Booking Flow', () => {
    let bookingId;

    test('should display room information', async () => {
      const response = await request(app)
        .get('/api/rooms/types')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      
      const testRoom = response.body.data.find(rt => rt.id === testRoomTypeId);
      expect(testRoom).toBeDefined();
      expect(testRoom.name).toBe('Test Suite Room');
      expect(testRoom.base_price).toBe('500.00');
    });

    test('should check room availability', async () => {
      const checkInDate = new Date();
      checkInDate.setDate(checkInDate.getDate() + 7);
      const checkOutDate = new Date(checkInDate);
      checkOutDate.setDate(checkOutDate.getDate() + 2);

      const response = await request(app)
        .get('/api/rooms/availability/check')
        .query({
          check_in_date: checkInDate.toISOString().split('T')[0],
          check_out_date: checkOutDate.toISOString().split('T')[0],
          room_type_id: testRoomTypeId
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.available_rooms).toBeDefined();
      expect(response.body.data.available_rooms.length).toBeGreaterThan(0);
    });

    test('should create a room booking', async () => {
      const checkInDate = new Date();
      checkInDate.setDate(checkInDate.getDate() + 7);
      const checkOutDate = new Date(checkInDate);
      checkOutDate.setDate(checkOutDate.getDate() + 2);

      const response = await request(app)
        .post('/api/rooms/bookings')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          room_id: testRoomId,
          check_in_date: checkInDate.toISOString().split('T')[0],
          check_out_date: checkOutDate.toISOString().split('T')[0],
          guest_count: 2,
          special_requests: 'Test booking'
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.room_id).toBe(testRoomId);
      expect(response.body.data.status).toBe('pending');
      
      bookingId = response.body.data.id;
    });

    test('should retrieve booking details', async () => {
      const response = await request(app)
        .get(`/api/rooms/bookings/${bookingId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(bookingId);
      expect(response.body.data.room_number).toBe('TEST-101');
    });

    test('should prevent double booking', async () => {
      const checkInDate = new Date();
      checkInDate.setDate(checkInDate.getDate() + 7);
      const checkOutDate = new Date(checkInDate);
      checkOutDate.setDate(checkOutDate.getDate() + 2);

      const response = await request(app)
        .post('/api/rooms/bookings')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          room_id: testRoomId,
          check_in_date: checkInDate.toISOString().split('T')[0],
          check_out_date: checkOutDate.toISOString().split('T')[0],
          guest_count: 2
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('ROOM_NOT_AVAILABLE');
    });
  });

  /**
   * Test 2: Complete Restaurant Booking Flow
   * Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5
   */
  describe('Complete Restaurant Booking Flow', () => {
    let restaurantBookingId;

    test('should display restaurant content', async () => {
      const response = await request(app)
        .get('/api/restaurant/content')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
    });

    test('should display cuisines', async () => {
      const response = await request(app)
        .get('/api/restaurant/cuisines')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      
      const testCuisine = response.body.data.find(c => c.id === testCuisineId);
      expect(testCuisine).toBeDefined();
    });

    test('should display meal packages', async () => {
      const response = await request(app)
        .get('/api/restaurant/packages')
        .query({ meal_type: 'lunch' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    test('should display time slots', async () => {
      const response = await request(app)
        .get('/api/restaurant/time-slots')
        .query({ meal_type: 'lunch' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    test('should check restaurant availability', async () => {
      const bookingDate = new Date();
      bookingDate.setDate(bookingDate.getDate() + 3);

      const response = await request(app)
        .get('/api/restaurant/availability')
        .query({
          date: bookingDate.toISOString().split('T')[0],
          meal_type: 'lunch'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.available_slots).toBeDefined();
      expect(response.body.data.available_slots.length).toBeGreaterThan(0);
    });

    test('should create a restaurant booking', async () => {
      const bookingDate = new Date();
      bookingDate.setDate(bookingDate.getDate() + 3);

      const response = await request(app)
        .post('/api/restaurant/bookings')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          user_id: testUserId,
          booking_date: bookingDate.toISOString().split('T')[0],
          meal_type: 'lunch',
          time_slot: '12:00:00',
          guest_count: 3,
          package_id: testPackageId,
          total_price: 600.00,
          special_requests: 'Test restaurant booking'
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.meal_type).toBe('lunch');
      expect(response.body.data.status).toBe('pending');
      
      restaurantBookingId = response.body.data.id;
    });

    test('should retrieve restaurant booking details', async () => {
      const response = await request(app)
        .get(`/api/restaurant/bookings/${restaurantBookingId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(restaurantBookingId);
    });

    test('should prevent overbooking time slots', async () => {
      const bookingDate = new Date();
      bookingDate.setDate(bookingDate.getDate() + 3);

      // Try to book more guests than available capacity
      const response = await request(app)
        .post('/api/restaurant/bookings')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          user_id: testUserId,
          booking_date: bookingDate.toISOString().split('T')[0],
          meal_type: 'lunch',
          time_slot: '12:00:00',
          guest_count: 25, // Exceeds max capacity
          package_id: testPackageId,
          total_price: 5000.00
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('容量不足');
    });
  });

  /**
   * Test 3: Admin Backend Functionality Integration
   * Validates: Requirements 4.1, 4.2, 4.3, 4.4, 5.1, 5.2, 5.3, 5.4
   */
  describe('Admin Backend Functionality', () => {
    test('should allow admin to view all room bookings', async () => {
      const response = await request(app)
        .get('/api/rooms/bookings/all')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    test('should allow admin to view restaurant bookings', async () => {
      const response = await request(app)
        .get('/api/restaurant/bookings')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    test('should allow admin to update room type', async () => {
      const response = await request(app)
        .put(`/api/rooms/types/${testRoomTypeId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          description: 'Updated test room description'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.description).toBe('Updated test room description');
    });

    test('should allow admin to create time slot', async () => {
      const response = await request(app)
        .post('/api/admin/time-slots')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          meal_type: 'dinner',
          start_time: '18:00:00',
          end_time: '20:00:00',
          max_capacity: 30,
          is_active: true
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.meal_type).toBe('dinner');

      // Cleanup
      await pool.query('DELETE FROM time_slots WHERE id = $1', [response.body.data.id]);
    });

    test('should allow admin to update content', async () => {
      const response = await request(app)
        .put('/api/content/restaurant')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          content: '<p>Updated restaurant content</p>'
        })
        .expect(200);

      expect(response.body).toBeDefined();
      expect(response.body.content).toBe('<p>Updated restaurant content</p>');
    });

    test('should prevent non-admin from accessing admin endpoints', async () => {
      const response = await request(app)
        .get('/api/rooms/bookings/all')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
    });
  });

  /**
   * Test 4: Error Recovery and Data Consistency
   * Validates: Requirements 6.3, 6.4, 7.3, 7.4
   */
  describe('Error Recovery and Data Consistency', () => {
    test('should handle invalid booking dates gracefully', async () => {
      const response = await request(app)
        .post('/api/rooms/bookings')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          room_id: testRoomId,
          check_in_date: 'invalid-date',
          check_out_date: '2024-12-31',
          guest_count: 2
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    test('should handle missing required fields', async () => {
      const response = await request(app)
        .post('/api/restaurant/bookings')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          user_id: testUserId,
          meal_type: 'lunch'
          // Missing required fields
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('必填');
    });

    test('should handle non-existent resource requests', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      
      const response = await request(app)
        .get(`/api/rooms/types/${fakeId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('ROOM_TYPE_NOT_FOUND');
    });

    test('should maintain data consistency after booking cancellation', async () => {
      // Create a booking
      const checkInDate = new Date();
      checkInDate.setDate(checkInDate.getDate() + 14);
      const checkOutDate = new Date(checkInDate);
      checkOutDate.setDate(checkOutDate.getDate() + 1);

      const createResponse = await request(app)
        .post('/api/rooms/bookings')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          room_id: testRoomId,
          check_in_date: checkInDate.toISOString().split('T')[0],
          check_out_date: checkOutDate.toISOString().split('T')[0],
          guest_count: 1
        })
        .expect(201);

      const bookingId = createResponse.body.data.id;

      // Cancel the booking
      await request(app)
        .put(`/api/rooms/bookings/${bookingId}/status`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'cancelled' })
        .expect(200);

      // Verify room is available again
      const availabilityResponse = await request(app)
        .get('/api/rooms/availability/check')
        .query({
          check_in_date: checkInDate.toISOString().split('T')[0],
          check_out_date: checkOutDate.toISOString().split('T')[0],
          room_type_id: testRoomTypeId
        })
        .expect(200);

      expect(availabilityResponse.body.data.available_rooms.length).toBeGreaterThan(0);
    });

    test('should handle concurrent booking attempts', async () => {
      const checkInDate = new Date();
      checkInDate.setDate(checkInDate.getDate() + 21);
      const checkOutDate = new Date(checkInDate);
      checkOutDate.setDate(checkOutDate.getDate() + 1);

      const bookingData = {
        room_id: testRoomId,
        check_in_date: checkInDate.toISOString().split('T')[0],
        check_out_date: checkOutDate.toISOString().split('T')[0],
        guest_count: 2
      };

      // Attempt two concurrent bookings
      const [response1, response2] = await Promise.all([
        request(app)
          .post('/api/rooms/bookings')
          .set('Authorization', `Bearer ${authToken}`)
          .send(bookingData),
        request(app)
          .post('/api/rooms/bookings')
          .set('Authorization', `Bearer ${authToken}`)
          .send(bookingData)
      ]);

      // One should succeed, one should fail
      const successCount = [response1, response2].filter(r => r.status === 201).length;
      const failCount = [response1, response2].filter(r => r.status === 400).length;

      expect(successCount).toBe(1);
      expect(failCount).toBe(1);

      // Cleanup successful booking
      const successResponse = response1.status === 201 ? response1 : response2;
      if (successResponse.body.data?.id) {
        await pool.query('DELETE FROM room_bookings WHERE id = $1', [successResponse.body.data.id]);
      }
    });
  });

  /**
   * Test 5: End-to-End Booking Workflow
   * Complete user journey from browsing to booking confirmation
   */
  describe('End-to-End Booking Workflow', () => {
    test('complete user journey: browse rooms -> check availability -> book -> confirm', async () => {
      // Step 1: Browse available rooms
      const browseResponse = await request(app)
        .get('/api/rooms/types')
        .expect(200);

      expect(browseResponse.body.data.length).toBeGreaterThan(0);
      const selectedRoomType = browseResponse.body.data.find(rt => rt.id === testRoomTypeId);

      // Step 2: Check availability
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 30);
      const checkOutDate = new Date(futureDate);
      checkOutDate.setDate(checkOutDate.getDate() + 3);

      const availabilityResponse = await request(app)
        .get('/api/rooms/availability/check')
        .query({
          check_in_date: futureDate.toISOString().split('T')[0],
          check_out_date: checkOutDate.toISOString().split('T')[0],
          room_type_id: selectedRoomType.id
        })
        .expect(200);

      expect(availabilityResponse.body.data.available_rooms.length).toBeGreaterThan(0);
      const selectedRoom = availabilityResponse.body.data.available_rooms[0];

      // Step 3: Create booking
      const bookingResponse = await request(app)
        .post('/api/rooms/bookings')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          room_id: selectedRoom.id,
          check_in_date: futureDate.toISOString().split('T')[0],
          check_out_date: checkOutDate.toISOString().split('T')[0],
          guest_count: 2,
          special_requests: 'End-to-end test booking'
        })
        .expect(201);

      expect(bookingResponse.body.data.status).toBe('pending');
      const bookingId = bookingResponse.body.data.id;

      // Step 4: Retrieve booking confirmation
      const confirmationResponse = await request(app)
        .get(`/api/rooms/bookings/${bookingId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(confirmationResponse.body.data.id).toBe(bookingId);
      expect(confirmationResponse.body.data.guest_name).toBe('Test User');

      // Cleanup
      await pool.query('DELETE FROM room_bookings WHERE id = $1', [bookingId]);
    });
  });
});
