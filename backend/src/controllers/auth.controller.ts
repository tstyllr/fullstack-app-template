import type { Request, Response } from 'express';
import { z } from 'zod';
import { authService } from '../services/auth.service.js';

// Validation schemas
const sendCodeSchema = z.object({
   phone: z.string().regex(/^1[3-9]\d{9}$/, 'Invalid phone number format'),
});

const loginWithCodeSchema = z.object({
   phone: z.string().regex(/^1[3-9]\d{9}$/, 'Invalid phone number format'),
   code: z.string().length(6, 'Verification code must be 6 digits'),
   singleDeviceMode: z.boolean().optional(),
});

const loginWithPasswordSchema = z.object({
   phone: z.string().regex(/^1[3-9]\d{9}$/, 'Invalid phone number format'),
   password: z.string().min(1, 'Password is required'),
   singleDeviceMode: z.boolean().optional(),
});

const setPasswordSchema = z.object({
   phone: z.string().regex(/^1[3-9]\d{9}$/, 'Invalid phone number format'),
   code: z.string().length(6, 'Verification code must be 6 digits'),
   password: z
      .string()
      .min(6, 'Password must be at least 6 characters')
      .max(255),
});

const refreshSchema = z.object({
   refreshToken: z.string().min(1, 'Refresh token is required'),
});

const logoutSchema = z.object({
   refreshToken: z.string().min(1, 'Refresh token is required'),
});

export const authController = {
   /**
    * POST /api/auth/send-code
    * Send SMS verification code to phone
    */
   async sendCode(req: Request, res: Response) {
      const validation = sendCodeSchema.safeParse(req.body);
      if (!validation.success) {
         return res
            .status(400)
            .json({ error: validation.error.errors[0]?.message });
      }

      try {
         const { phone } = validation.data;
         const result = await authService.sendVerificationCode(phone);
         res.json(result);
      } catch (error) {
         if (error instanceof Error) {
            res.status(400).json({ error: error.message });
         } else {
            res.status(500).json({ error: 'Internal server error' });
         }
      }
   },

   /**
    * POST /api/auth/login-with-code
    * Login or register with phone + SMS verification code
    */
   async loginWithCode(req: Request, res: Response) {
      const validation = loginWithCodeSchema.safeParse(req.body);
      if (!validation.success) {
         return res
            .status(400)
            .json({ error: validation.error.errors[0]?.message });
      }

      try {
         const { phone, code, singleDeviceMode = false } = validation.data;
         const { accessToken, refreshToken, user } =
            await authService.loginWithCode(phone, code, singleDeviceMode);

         res.json({
            accessToken,
            refreshToken,
            user: {
               id: user.id,
               phone: user.phone,
               name: user.name,
               isAdmin: user.isAdmin,
            },
         });
      } catch (error) {
         if (error instanceof Error) {
            res.status(400).json({ error: error.message });
         } else {
            res.status(500).json({ error: 'Internal server error' });
         }
      }
   },

   /**
    * POST /api/auth/login-with-password
    * Login with phone + password (requires password to be set)
    */
   async loginWithPassword(req: Request, res: Response) {
      const validation = loginWithPasswordSchema.safeParse(req.body);
      if (!validation.success) {
         return res
            .status(400)
            .json({ error: validation.error.errors[0]?.message });
      }

      try {
         const { phone, password, singleDeviceMode = false } = validation.data;
         const { accessToken, refreshToken, user } =
            await authService.loginWithPassword(
               phone,
               password,
               singleDeviceMode
            );

         res.json({
            accessToken,
            refreshToken,
            user: {
               id: user.id,
               phone: user.phone,
               name: user.name,
               isAdmin: user.isAdmin,
            },
         });
      } catch (error) {
         if (error instanceof Error) {
            res.status(400).json({ error: error.message });
         } else {
            res.status(500).json({ error: 'Internal server error' });
         }
      }
   },

   /**
    * POST /api/auth/set-password
    * Set or update password (requires SMS verification)
    */
   async setPassword(req: Request, res: Response) {
      const validation = setPasswordSchema.safeParse(req.body);
      if (!validation.success) {
         return res
            .status(400)
            .json({ error: validation.error.errors[0]?.message });
      }

      try {
         const { phone, code, password } = validation.data;
         const result = await authService.setPassword(phone, code, password);
         res.json(result);
      } catch (error) {
         if (error instanceof Error) {
            res.status(400).json({ error: error.message });
         } else {
            res.status(500).json({ error: 'Internal server error' });
         }
      }
   },

   /**
    * POST /api/auth/refresh
    * Refresh access token using refresh token
    */
   async refresh(req: Request, res: Response) {
      const validation = refreshSchema.safeParse(req.body);
      if (!validation.success) {
         return res
            .status(400)
            .json({ error: validation.error.errors[0]?.message });
      }

      try {
         const { refreshToken } = validation.data;
         const { accessToken, user } =
            await authService.refreshAccessToken(refreshToken);

         res.json({
            accessToken,
            user: {
               id: user.id,
               phone: user.phone,
               name: user.name,
               isAdmin: user.isAdmin,
            },
         });
      } catch (error) {
         if (error instanceof Error) {
            res.status(401).json({ error: error.message });
         } else {
            res.status(500).json({ error: 'Internal server error' });
         }
      }
   },

   /**
    * POST /api/auth/logout
    * Logout by revoking refresh token
    */
   async logout(req: Request, res: Response) {
      const validation = logoutSchema.safeParse(req.body);
      if (!validation.success) {
         return res
            .status(400)
            .json({ error: validation.error.errors[0]?.message });
      }

      try {
         const { refreshToken } = validation.data;
         await authService.revokeRefreshToken(refreshToken);

         res.json({ message: 'Logged out successfully' });
      } catch (error) {
         if (error instanceof Error) {
            res.status(400).json({ error: error.message });
         } else {
            res.status(500).json({ error: 'Internal server error' });
         }
      }
   },
};
