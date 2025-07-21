import {config} from 'dotenv';
import mysql, {Pool} from 'mysql2';

config();
/**
 * Type for the user role.
 *
 * This type represents the possible roles a user can have in the application. It can be one of the following:
 *
 * - 'ADMIN': Represents an administrator user.
 * - 'TEACHER': Represents a teacher user.
 * - 'COUNSELOR': Represents a counselor user.
 * - 'STUDENT': Represents a student user.
 */
type UserRole = 'ADMIN' | 'TEACHER' | 'COUNSELOR' | 'STUDENT';

/**
 * Function to create a new MySQL connection pool with the given user role.
 *
 * This function performs the following operations:
 *
 * 1. Determines the user and password for the database connection based on the user role.
 * 2. Creates a new MySQL connection pool with the determined user and password, and the database details from the environment variables.
 *
 * The connection pool is configured to wait for connections if they are all in use, and has a connection limit of 10000 and a queue limit of 0.
 *
 * @param {UserRole} userRole - The role of the user for the database connection.
 * @returns {mysql.Pool} The created MySQL connection pool.
 * @throws {Error} Will throw an error if the user role is invalid.
 */
const createPool = (userRole: UserRole): Pool => {
  let user: string;
  let password: string;
  switch (userRole) {
    case 'ADMIN':
      user = process.env.DB_USER_ADMIN as string;
      password = process.env.DB_PASS_ADMIN as string;
      console.log("Row 38,  createPool.ts, role admin");
      break;
    case 'TEACHER':
      user = process.env.DB_USER_TEACHER as string;
      password = process.env.DB_PASS_TEACHER as string;
      console.log("Row 43,  createPool.ts, role teacher");
      break;
    case 'COUNSELOR':
      user = process.env.DB_USER_COUNSELOR as string;
      password = process.env.DB_PASS_COUNSELOR as string;
      console.log("Row 48,  createPool.ts, role counselor");
      break;
    case 'STUDENT':
      user = process.env.DB_USER_STUDENT as string;
      password = process.env.DB_PASS_STUDENT as string;
      console.log("Row 53,  createPool.ts, role Student");
      break;
    default:
      console.log("Row 56, createPool.ts, Error");
      throw new Error(`Invalid user role: ${userRole}`);
  }
  const pool = mysql.createPool({
    host: process.env.DB_HOST as string,
    user,
    password,
    database: process.env.DB_NAME as string,
    waitForConnections: true,
    connectionLimit: 10000,
    queueLimit: 0,
  });

  pool.getConnection((err, connection) => {
    if (err) {
      console.error('Error connecting to the database:', err);
      process.exit(1);
    } else {
      console.log("Row 74, createPool.ts, Successfully connected to the database");
      connection.release();
    }
  });
console.log("Row 78, createPool.ts, returning pool");
  return pool;
};

export default createPool;
