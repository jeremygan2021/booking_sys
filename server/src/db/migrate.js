import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from './connection.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigrations() {
  console.log('🚀 Starting database migrations...');
  
  try {
    const migrationsDir = path.join(__dirname, 'migrations');
    
    if (!fs.existsSync(migrationsDir)) {
      console.log('No migrations directory found.');
      return;
    }

    const files = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();

    if (files.length === 0) {
      console.log('No migration files found.');
      return;
    }

    // Get a client from the pool to run transactions
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      for (const file of files) {
        console.log(`Executing migration: ${file}`);
        const filePath = path.join(migrationsDir, file);
        const sql = fs.readFileSync(filePath, 'utf8');
        
        // Execute the SQL content
        // Note: Some SQL files might contain multiple statements that pg might not handle in one query call depending on driver version
        // but typically pg driver handles multiple statements in one query string.
        await client.query(sql);
        console.log(`✓ Completed: ${file}`);
      }

      await client.query('COMMIT');
      console.log('✅ All migrations applied successfully!');
    } catch (err) {
      await client.query('ROLLBACK');
      console.error(`❌ Error executing migration, rolling back changes...`);
      throw err;
    } finally {
      client.release();
    }
    
    // Close the pool to allow the script to exit
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigrations();
