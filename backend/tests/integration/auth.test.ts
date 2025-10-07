import { describe, it, expect, beforeEach, afterEach, mock } from 'bun:test';
import request from 'supertest';
import server from '../../src/index';
import {
   createTestUser,
   createVerificationCode,
   createRefreshToken,
   cleanupTestData,
} from '../helpers/test-utils';
import { smsService } from '../../src/services/sms.service';

// Mock SMS service to prevent actual SMS sending
mock.module('../../src/services/sms.service', () => ({
   smsService: {
      sendVerificationCode: mock(async () => Promise.resolve()),
      generateCode: mock(() => '123456'),
      validateConfig: mock(() => true),
   },
}));

describe('Auth API', () => {
   // Clean up test data after each test
   afterEach(async () => {
      await cleanupTestData();
   });

   describe('POST /api/auth/send-code', () => {
      let phone: string;

      const exec = () => {
         return request(server).post('/api/auth/send-code').send({ phone });
      };

      beforeEach(() => {
         phone = '13800138000';
      });

      describe('Input Validation', () => {
         it('should return 400 if phone is missing', async () => {
            phone = '';

            const res = await exec();

            expect(res.status).toBe(400);
            expect(res.body.error).toBeDefined();
         });

         it('should return 400 if phone format is invalid', async () => {
            phone = '12345';

            const res = await exec();

            expect(res.status).toBe(400);
            expect(res.body.error).toContain('Invalid phone number');
         });

         it('should return 400 if phone does not start with 1', async () => {
            phone = '23800138000';

            const res = await exec();

            expect(res.status).toBe(400);
         });

         it('should return 400 if phone is not 11 digits', async () => {
            phone = '138001380';

            const res = await exec();

            expect(res.status).toBe(400);
         });
      });

      describe('Success', () => {
         it('should return 200 and success message for valid phone', async () => {
            const res = await exec();

            expect(res.status).toBe(200);
            expect(res.body.message).toBe(
               'Verification code sent successfully'
            );
         });

         it('should create verification code in database', async () => {
            await exec();

            // Verify code was created (we'll import prisma to check)
            const { PrismaClient } = await import(
               '../../generated/prisma/index.js'
            );
            const prisma = new PrismaClient();
            const code = await prisma.verificationCode.findFirst({
               where: { phone },
            });

            expect(code).toBeDefined();
            expect(code?.code).toBe('123456');
            expect(code?.isUsed).toBe(false);
         });
      });
   });

   describe('POST /api/auth/login-with-code', () => {
      let phone: string;
      let code: string;
      let singleDeviceMode: boolean | undefined;

      const exec = () => {
         const body: any = { phone, code };
         if (singleDeviceMode !== undefined) {
            body.singleDeviceMode = singleDeviceMode;
         }
         return request(server).post('/api/auth/login-with-code').send(body);
      };

      beforeEach(() => {
         phone = '13800138001';
         code = '123456';
         singleDeviceMode = undefined;
      });

      describe('Input Validation', () => {
         it('should return 400 if phone is missing', async () => {
            phone = '';

            const res = await exec();

            expect(res.status).toBe(400);
         });

         it('should return 400 if code is missing', async () => {
            code = '';

            const res = await exec();

            expect(res.status).toBe(400);
         });

         it('should return 400 if phone format is invalid', async () => {
            phone = '12345';

            const res = await exec();

            expect(res.status).toBe(400);
         });

         it('should return 400 if code is not 6 digits', async () => {
            code = '12345';

            const res = await exec();

            expect(res.status).toBe(400);
         });
      });

      describe('Business Logic', () => {
         it('should return 400 if verification code is invalid', async () => {
            // Don't create any verification code

            const res = await exec();

            expect(res.status).toBe(400);
            expect(res.body.error).toContain('Invalid or expired');
         });

         it('should return 400 if verification code is expired', async () => {
            // Create expired code (negative minutes)
            await createVerificationCode(phone, code, -1);

            const res = await exec();

            expect(res.status).toBe(400);
            expect(res.body.error).toContain('Invalid or expired');
         });

         it('should create new user if user does not exist (auto-registration)', async () => {
            await createVerificationCode(phone, code);

            const res = await exec();

            expect(res.status).toBe(200);
            expect(res.body.user).toBeDefined();
            expect(res.body.user.phone).toBe(phone);
            expect(res.body.user.isAdmin).toBe(false);
         });

         it('should login existing user', async () => {
            const user = await createTestUser({ phone });
            await createVerificationCode(phone, code);

            const res = await exec();

            expect(res.status).toBe(200);
            expect(res.body.user.id).toBe(user.id);
            expect(res.body.user.phone).toBe(phone);
         });

         it('should mark verification code as used', async () => {
            await createVerificationCode(phone, code);

            await exec();

            const { PrismaClient } = await import(
               '../../generated/prisma/index.js'
            );
            const prisma = new PrismaClient();
            const verCode = await prisma.verificationCode.findFirst({
               where: { phone, code },
            });

            expect(verCode?.isUsed).toBe(true);
         });

         it('should not allow reusing the same code', async () => {
            await createVerificationCode(phone, code);

            // First login
            await exec();

            // Try to login again with same code
            const res = await exec();

            expect(res.status).toBe(400);
            expect(res.body.error).toContain('Invalid or expired');
         });

         it('should revoke all existing tokens in single device mode', async () => {
            const user = await createTestUser({ phone });
            await createRefreshToken(user.id);
            await createVerificationCode(phone, code);

            singleDeviceMode = true;

            await exec();

            const { PrismaClient } = await import(
               '../../generated/prisma/index.js'
            );
            const prisma = new PrismaClient();
            const tokens = await prisma.refreshToken.findMany({
               where: { userId: user.id, isRevoked: false },
            });

            // Old tokens should be revoked, but new token should exist
            expect(
               tokens.every((t) => t.createdAt > new Date(Date.now() - 1000))
            ).toBe(true);
         });
      });

      describe('Success', () => {
         it('should return 200 with tokens and user data', async () => {
            await createVerificationCode(phone, code);

            const res = await exec();

            expect(res.status).toBe(200);
            expect(res.body.accessToken).toBeDefined();
            expect(res.body.refreshToken).toBeDefined();
            expect(res.body.user).toBeDefined();
            expect(res.body.user.phone).toBe(phone);
         });
      });
   });

   describe('POST /api/auth/login-with-password', () => {
      let phone: string;
      let password: string;
      let singleDeviceMode: boolean | undefined;

      const exec = () => {
         const body: any = { phone, password };
         if (singleDeviceMode !== undefined) {
            body.singleDeviceMode = singleDeviceMode;
         }
         return request(server)
            .post('/api/auth/login-with-password')
            .send(body);
      };

      beforeEach(() => {
         phone = '13800138002';
         password = 'password123';
         singleDeviceMode = undefined;
      });

      describe('Input Validation', () => {
         it('should return 400 if phone is missing', async () => {
            phone = '';

            const res = await exec();

            expect(res.status).toBe(400);
         });

         it('should return 400 if password is missing', async () => {
            password = '';

            const res = await exec();

            expect(res.status).toBe(400);
         });

         it('should return 400 if phone format is invalid', async () => {
            phone = '12345';

            const res = await exec();

            expect(res.status).toBe(400);
         });
      });

      describe('Business Logic', () => {
         it('should return 400 if user does not exist', async () => {
            const res = await exec();

            expect(res.status).toBe(400);
            expect(res.body.error).toContain(
               'Invalid phone number or password'
            );
         });

         it('should return 400 if password is not set', async () => {
            await createTestUser({ phone }); // No password

            const res = await exec();

            expect(res.status).toBe(400);
            expect(res.body.error).toContain('Password not set');
         });

         it('should return 400 if password is incorrect', async () => {
            await createTestUser({ phone, password: 'different123' });

            const res = await exec();

            expect(res.status).toBe(400);
            expect(res.body.error).toContain(
               'Invalid phone number or password'
            );
         });

         it('should login with correct password', async () => {
            const user = await createTestUser({ phone, password });

            const res = await exec();

            expect(res.status).toBe(200);
            expect(res.body.user.id).toBe(user.id);
         });

         it('should revoke all existing tokens in single device mode', async () => {
            const user = await createTestUser({ phone, password });
            await createRefreshToken(user.id);

            singleDeviceMode = true;

            await exec();

            const { PrismaClient } = await import(
               '../../generated/prisma/index.js'
            );
            const prisma = new PrismaClient();
            const tokens = await prisma.refreshToken.findMany({
               where: { userId: user.id, isRevoked: false },
            });

            // Only new token should exist
            expect(
               tokens.every((t) => t.createdAt > new Date(Date.now() - 1000))
            ).toBe(true);
         });
      });

      describe('Success', () => {
         it('should return 200 with tokens and user data', async () => {
            await createTestUser({ phone, password });

            const res = await exec();

            expect(res.status).toBe(200);
            expect(res.body.accessToken).toBeDefined();
            expect(res.body.refreshToken).toBeDefined();
            expect(res.body.user).toBeDefined();
            expect(res.body.user.phone).toBe(phone);
         });
      });
   });

   describe('POST /api/auth/set-password', () => {
      let phone: string;
      let code: string;
      let password: string;

      const exec = () => {
         return request(server)
            .post('/api/auth/set-password')
            .send({ phone, code, password });
      };

      beforeEach(() => {
         phone = '13800138003';
         code = '123456';
         password = 'newpassword123';
      });

      describe('Input Validation', () => {
         it('should return 400 if phone is missing', async () => {
            phone = '';

            const res = await exec();

            expect(res.status).toBe(400);
         });

         it('should return 400 if code is missing', async () => {
            code = '';

            const res = await exec();

            expect(res.status).toBe(400);
         });

         it('should return 400 if password is missing', async () => {
            password = '';

            const res = await exec();

            expect(res.status).toBe(400);
         });

         it('should return 400 if password is too short', async () => {
            password = '12345';

            const res = await exec();

            expect(res.status).toBe(400);
            expect(res.body.error).toContain('at least 6 characters');
         });

         it('should return 400 if phone format is invalid', async () => {
            phone = '12345';

            const res = await exec();

            expect(res.status).toBe(400);
         });

         it('should return 400 if code is not 6 digits', async () => {
            code = '12345';

            const res = await exec();

            expect(res.status).toBe(400);
         });
      });

      describe('Business Logic', () => {
         it('should return 400 if verification code is invalid', async () => {
            await createTestUser({ phone });

            const res = await exec();

            expect(res.status).toBe(400);
            expect(res.body.error).toContain('Invalid or expired');
         });

         it('should return 400 if user does not exist', async () => {
            await createVerificationCode(phone, code);

            const res = await exec();

            expect(res.status).toBe(400);
            expect(res.body.error).toContain('User not found');
         });

         it('should set password successfully', async () => {
            await createTestUser({ phone });
            await createVerificationCode(phone, code);

            const res = await exec();

            expect(res.status).toBe(200);
            expect(res.body.message).toContain('Password set successfully');
         });

         it('should update existing password', async () => {
            await createTestUser({ phone, password: 'oldpassword' });
            await createVerificationCode(phone, code);

            const res = await exec();

            expect(res.status).toBe(200);

            // Verify can login with new password
            const loginRes = await request(server)
               .post('/api/auth/login-with-password')
               .send({ phone, password });

            expect(loginRes.status).toBe(200);
         });

         it('should mark verification code as used', async () => {
            await createTestUser({ phone });
            await createVerificationCode(phone, code);

            await exec();

            const { PrismaClient } = await import(
               '../../generated/prisma/index.js'
            );
            const prisma = new PrismaClient();
            const verCode = await prisma.verificationCode.findFirst({
               where: { phone, code },
            });

            expect(verCode?.isUsed).toBe(true);
         });
      });

      describe('Success', () => {
         it('should return 200 with success message', async () => {
            await createTestUser({ phone });
            await createVerificationCode(phone, code);

            const res = await exec();

            expect(res.status).toBe(200);
            expect(res.body.message).toBeDefined();
         });
      });
   });

   describe('POST /api/auth/refresh', () => {
      let refreshToken: string;

      const exec = () => {
         return request(server)
            .post('/api/auth/refresh')
            .send({ refreshToken });
      };

      beforeEach(async () => {
         const user = await createTestUser({ phone: '13800138004' });
         refreshToken = await createRefreshToken(user.id);
      });

      describe('Input Validation', () => {
         it('should return 400 if refresh token is missing', async () => {
            refreshToken = '';

            const res = await exec();

            expect(res.status).toBe(400);
         });
      });

      describe('Business Logic', () => {
         it('should return 401 if refresh token is invalid JWT', async () => {
            refreshToken = 'invalid-token';

            const res = await exec();

            expect(res.status).toBe(401);
            expect(res.body.error).toContain('Invalid or expired');
         });

         it('should return 401 if refresh token is not in database', async () => {
            // Generate a valid JWT but not in DB
            const jwt = await import('jsonwebtoken');
            refreshToken = jwt.sign(
               { id: 999 },
               process.env.JWT_REFRESH_SECRET!,
               { expiresIn: '30d' }
            );

            const res = await exec();

            expect(res.status).toBe(401);
            expect(res.body.error).toContain('not found or has been revoked');
         });

         it('should return 401 if refresh token is revoked', async () => {
            // Revoke the token
            const { PrismaClient } = await import(
               '../../generated/prisma/index.js'
            );
            const prisma = new PrismaClient();
            await prisma.refreshToken.update({
               where: { token: refreshToken },
               data: { isRevoked: true },
            });

            const res = await exec();

            expect(res.status).toBe(401);
         });

         it('should return new access token for valid refresh token', async () => {
            const res = await exec();

            expect(res.status).toBe(200);
            expect(res.body.accessToken).toBeDefined();
            expect(res.body.user).toBeDefined();
         });
      });

      describe('Success', () => {
         it('should return 200 with new access token and user data', async () => {
            const res = await exec();

            expect(res.status).toBe(200);
            expect(res.body.accessToken).toBeDefined();
            expect(res.body.user).toBeDefined();
            expect(res.body.user.phone).toBeDefined();
         });

         it('should not return refresh token in response', async () => {
            const res = await exec();

            expect(res.status).toBe(200);
            expect(res.body.refreshToken).toBeUndefined();
         });
      });
   });

   describe('POST /api/auth/logout', () => {
      let refreshToken: string;

      const exec = () => {
         return request(server).post('/api/auth/logout').send({ refreshToken });
      };

      beforeEach(async () => {
         const user = await createTestUser({ phone: '13800138005' });
         refreshToken = await createRefreshToken(user.id);
      });

      describe('Input Validation', () => {
         it('should return 400 if refresh token is missing', async () => {
            refreshToken = '';

            const res = await exec();

            expect(res.status).toBe(400);
         });
      });

      describe('Business Logic', () => {
         it('should revoke refresh token', async () => {
            const res = await exec();

            expect(res.status).toBe(200);

            // Verify token is revoked in database
            const { PrismaClient } = await import(
               '../../generated/prisma/index.js'
            );
            const prisma = new PrismaClient();
            const token = await prisma.refreshToken.findUnique({
               where: { token: refreshToken },
            });

            expect(token?.isRevoked).toBe(true);
         });

         it('should succeed even if token does not exist', async () => {
            refreshToken = 'non-existent-token';

            const res = await exec();

            expect(res.status).toBe(200);
         });
      });

      describe('Success', () => {
         it('should return 200 with success message', async () => {
            const res = await exec();

            expect(res.status).toBe(200);
            expect(res.body.message).toBe('Logged out successfully');
         });

         it('should not allow using revoked token to refresh', async () => {
            // Logout
            await exec();

            // Try to refresh with revoked token
            const refreshRes = await request(server)
               .post('/api/auth/refresh')
               .send({ refreshToken });

            expect(refreshRes.status).toBe(401);
         });
      });
   });
});
