import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import request from 'supertest';
import server from '../../src/index';
import {
   createTestUser,
   generateToken,
   cleanupTestData,
} from '../helpers/test-utils';

describe('Users API', () => {
   // Clean up test data after each test
   afterEach(async () => {
      await cleanupTestData();
   });

   describe('GET /api/users/me', () => {
      let token: string;

      const exec = () => {
         return request(server)
            .get('/api/users/me')
            .set('Authorization', `Bearer ${token}`);
      };

      beforeEach(async () => {
         const user = await createTestUser({ phone: '13800138100' });
         token = generateToken({
            id: user.id,
            phone: user.phone,
            name: user.name || undefined,
            isAdmin: user.isAdmin,
         });
      });

      describe('Authentication', () => {
         it('should return 401 if no auth token provided', async () => {
            const res = await request(server).get('/api/users/me');

            expect(res.status).toBe(401);
            expect(res.body.error).toContain('No token provided');
         });

         it('should return 401 if auth token format is invalid', async () => {
            const res = await request(server)
               .get('/api/users/me')
               .set('Authorization', 'InvalidFormat');

            expect(res.status).toBe(401);
            expect(res.body.error).toContain('Invalid authorization format');
         });

         it('should return 403 if auth token is invalid', async () => {
            token = 'invalid-token';

            const res = await exec();

            expect(res.status).toBe(403);
            expect(res.body.error).toContain('Invalid token');
         });

         it('should return 401 if auth token is expired', async () => {
            const jwt = await import('jsonwebtoken');
            token = jwt.sign(
               { id: 1, phone: '13800138100', isAdmin: false },
               process.env.JWT_PRIVATE_KEY!,
               { expiresIn: '-1h' }
            );

            const res = await exec();

            expect(res.status).toBe(401);
            expect(res.body.error).toContain('expired');
         });
      });

      describe('Business Logic', () => {
         it('should return 404 if user does not exist in database', async () => {
            // Create token for non-existent user
            token = generateToken({ id: 999999, phone: '13800138999' });

            const res = await exec();

            expect(res.status).toBe(404);
            expect(res.body.error).toContain('User not found');
         });

         it('should return user data if authenticated', async () => {
            const res = await exec();

            expect(res.status).toBe(200);
            expect(res.body.id).toBeDefined();
            expect(res.body.phone).toBe('13800138100');
            expect(res.body.name).toBeDefined();
            expect(res.body.isAdmin).toBeDefined();
         });
      });

      describe('Success', () => {
         it('should return 200 with user data', async () => {
            const res = await exec();

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('id');
            expect(res.body).toHaveProperty('phone');
            expect(res.body).toHaveProperty('name');
            expect(res.body).toHaveProperty('isAdmin');
         });

         it('should not return password in response', async () => {
            const user = await createTestUser({
               phone: '13800138101',
               password: 'password123',
            });
            token = generateToken({
               id: user.id,
               phone: user.phone,
               name: user.name || undefined,
               isAdmin: user.isAdmin,
            });

            const res = await exec();

            expect(res.status).toBe(200);
            expect(res.body).not.toHaveProperty('password');
         });
      });
   });

   describe('GET /api/users/', () => {
      let token: string;

      const exec = () => {
         return request(server)
            .get('/api/users/')
            .set('Authorization', `Bearer ${token}`);
      };

      beforeEach(async () => {
         const adminUser = await createTestUser({
            phone: '13800138200',
            isAdmin: true,
         });
         token = generateToken({
            id: adminUser.id,
            phone: adminUser.phone,
            name: adminUser.name || undefined,
            isAdmin: adminUser.isAdmin,
         });
      });

      describe('Authentication', () => {
         it('should return 401 if no auth token provided', async () => {
            const res = await request(server).get('/api/users/');

            expect(res.status).toBe(401);
            expect(res.body.error).toContain('No token provided');
         });

         it('should return 403 if auth token is invalid', async () => {
            const res = await request(server)
               .get('/api/users/')
               .set('Authorization', 'Bearer invalid-token');

            expect(res.status).toBe(403);
            expect(res.body.error).toContain('Invalid token');
         });
      });

      describe('Authorization', () => {
         it('should return 403 if user is not admin', async () => {
            const regularUser = await createTestUser({
               phone: '13800138201',
               isAdmin: false,
            });
            token = generateToken({
               id: regularUser.id,
               phone: regularUser.phone,
               name: regularUser.name || undefined,
               isAdmin: regularUser.isAdmin,
            });

            const res = await exec();

            expect(res.status).toBe(403);
            expect(res.body.error).toContain('Admin privileges required');
         });
      });

      describe('Business Logic', () => {
         it('should return all users for admin users', async () => {
            // Create additional test users
            await createTestUser({ phone: '13800138202' });
            await createTestUser({ phone: '13800138203' });

            const res = await exec();

            expect(res.status).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body.length).toBeGreaterThanOrEqual(3); // At least 3 users (admin + 2 created)
         });

         it('should return correct user data structure', async () => {
            const res = await exec();

            expect(res.status).toBe(200);
            expect(res.body.length).toBeGreaterThan(0);
            expect(res.body[0]).toHaveProperty('id');
            expect(res.body[0]).toHaveProperty('phone');
            expect(res.body[0]).toHaveProperty('name');
            expect(res.body[0]).toHaveProperty('isAdmin');
            expect(res.body[0]).toHaveProperty('createdAt');
            expect(res.body[0]).toHaveProperty('updatedAt');
         });
      });

      describe('Success', () => {
         it('should return 200 with array of users', async () => {
            const res = await exec();

            expect(res.status).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
         });

         it('should not include password in response', async () => {
            // Create user with password
            await createTestUser({
               phone: '13800138204',
               password: 'password123',
            });

            const res = await exec();

            expect(res.status).toBe(200);
            res.body.forEach((user: any) => {
               expect(user).not.toHaveProperty('password');
            });
         });

         it('should return empty array if no users exist', async () => {
            // Clean up all users first
            await cleanupTestData();

            // Create only admin user
            const adminUser = await createTestUser({
               phone: '13800138205',
               isAdmin: true,
            });
            token = generateToken({
               id: adminUser.id,
               phone: adminUser.phone,
               name: adminUser.name || undefined,
               isAdmin: adminUser.isAdmin,
            });

            const res = await exec();

            expect(res.status).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body.length).toBe(1); // Only the admin user
         });
      });
   });
});
