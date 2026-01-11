import fc from 'fast-check';
import pool from '../src/db/connection.js';
import bcrypt from 'bcryptjs';

describe('Property 13: Data Persistence Consistency', () => {
  beforeAll(async () => {
    // Ensure database connection
    await pool.query('SELECT 1');
  });

  afterAll(async () => {
    await pool.end();
  });

  test('should correctly persist and retrieve user data', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          email: fc.emailAddress(),
          password: fc.string({ minLength: 6 }),
          full_name: fc.string({ minLength: 1 }),
          phone: fc.array(fc.constantFrom(...'0123456789'), { minLength: 10, maxLength: 11 }).map(a => a.join(''))
        }),
        async (userData) => {
            // Append a random suffix to email to avoid collisions during multiple runs in same property check
            // though fc generates random data, uniqueness isn't guaranteed across runs without cleanup
            const uniqueEmail = `${Date.now()}_${Math.random().toString(36).substring(7)}_${userData.email}`;
            
            const salt = await bcrypt.genSalt(10);
            const passwordHash = await bcrypt.hash(userData.password, salt);

            // 1. Persist (Create)
            const insertRes = await pool.query(
                'INSERT INTO users (email, password_hash, full_name, phone) VALUES ($1, $2, $3, $4) RETURNING id',
                [uniqueEmail, passwordHash, userData.full_name, userData.phone]
            );
            const userId = insertRes.rows[0].id;

            try {
                // 2. Retrieve (Read)
                const selectRes = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
                const savedUser = selectRes.rows[0];

                // 3. Verify Consistency
                expect(savedUser).toBeDefined();
                expect(savedUser.email).toBe(uniqueEmail);
                expect(savedUser.full_name).toBe(userData.full_name);
                expect(savedUser.phone).toBe(userData.phone);
                
                // Verify password hashing (not storing plain text)
                const isMatch = await bcrypt.compare(userData.password, savedUser.password_hash);
                expect(isMatch).toBe(true);

            } finally {
                // 4. Cleanup
                await pool.query('DELETE FROM users WHERE id = $1', [userId]);
            }
        }
      ),
      { numRuns: 20 } // Run 20 times with random data
    );
  }, 30000);
});
