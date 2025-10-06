import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import ms from 'ms';
import { userRepository } from '../repositories/user.repository.js';
import { refreshTokenRepository } from '../repositories/refresh-token.repository.js';
import { verificationCodeRepository } from '../repositories/verification-code.repository.js';
import { smsService } from './sms.service.js';

export const authService = {
   /**
    * Send SMS verification code
    */
   async sendVerificationCode(phone: string) {
      // Validate phone number format (basic validation)
      if (!phone || !/^1[3-9]\d{9}$/.test(phone)) {
         throw new Error('Invalid phone number format');
      }

      // Rate limiting: max 10 codes per phone number per hour
      const recentCount = await verificationCodeRepository.getRecentCodeCount(
         phone,
         60
      );
      if (process.env.NODE_ENV !== 'development' && recentCount >= 10) {
         throw new Error(
            'Too many verification codes requested. Please try again later.'
         );
      }

      // Generate and send code
      const code = smsService.generateCode();
      const timeoutMinutes = parseInt(
         process.env.TENCENT_SMS_CODE_TIMEOUT || '2',
         10
      );
      const expiresAt = new Date(Date.now() + timeoutMinutes * 60 * 1000);

      // Save code to database
      await verificationCodeRepository.createCode(phone, code, expiresAt);

      // Send SMS
      await smsService.sendVerificationCode(phone, code);

      return { message: 'Verification code sent successfully' };
   },

   /**
    * Login or register with phone + verification code
    */
   async loginWithCode(phone: string, code: string, singleDeviceMode = false) {
      // Verify the code
      const validCode = await verificationCodeRepository.findValidCode(
         phone,
         code
      );
      if (!validCode) {
         throw new Error('Invalid or expired verification code');
      }

      // Mark code as used
      await verificationCodeRepository.markCodeAsUsed(validCode.id);

      // Check if user exists
      let user = await userRepository.getUserByPhone(phone);

      // If user doesn't exist, create new user (auto-registration)
      if (!user) {
         user = await userRepository.createUser({
            phone,
            name: undefined, // Optional: user can set name later
         });
      }

      // Revoke all existing tokens for single device mode
      if (singleDeviceMode) {
         await refreshTokenRepository.revokeAllUserTokens(user.id);
      }

      // Generate token pair
      const tokens = await this.generateTokenPair({
         id: user.id,
         phone: user.phone,
         name: user.name || undefined,
         isAdmin: user.isAdmin,
      });

      return { ...tokens, user };
   },

   /**
    * Login with phone + password
    */
   async loginWithPassword(
      phone: string,
      password: string,
      singleDeviceMode = false
   ) {
      // Find user
      const user = await userRepository.getUserByPhone(phone);
      if (!user) {
         throw new Error('Invalid phone number or password');
      }

      // Check if password is set
      if (!user.password) {
         throw new Error(
            'Password not set. Please use SMS verification to login'
         );
      }

      // Validate password
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
         throw new Error('Invalid phone number or password');
      }

      // Revoke all existing tokens for single device mode
      if (singleDeviceMode) {
         await refreshTokenRepository.revokeAllUserTokens(user.id);
      }

      // Generate token pair
      const tokens = await this.generateTokenPair({
         id: user.id,
         phone: user.phone,
         name: user.name || undefined,
         isAdmin: user.isAdmin,
      });

      return { ...tokens, user };
   },

   /**
    * Set or update password (requires SMS verification)
    */
   async setPassword(phone: string, code: string, newPassword: string) {
      // Verify the code
      const validCode = await verificationCodeRepository.findValidCode(
         phone,
         code
      );
      if (!validCode) {
         throw new Error('Invalid or expired verification code');
      }

      // Mark code as used
      await verificationCodeRepository.markCodeAsUsed(validCode.id);

      // Find user
      const user = await userRepository.getUserByPhone(phone);
      if (!user) {
         throw new Error('User not found');
      }

      // Validate password
      if (newPassword.length < 6 || newPassword.length > 255) {
         throw new Error('Password must be between 6 and 255 characters');
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      // Update user password
      await userRepository.updateUser(user.id, { password: hashedPassword });

      return { message: 'Password set successfully' };
   },

   /**
    * Refresh access token
    */
   async refreshAccessToken(refreshToken: string) {
      // Verify refresh token
      let decoded: any;
      try {
         decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!);
      } catch (error) {
         throw new Error('Invalid or expired refresh token');
      }

      // Check if token exists and is valid in database
      const storedToken =
         await refreshTokenRepository.findValidToken(refreshToken);
      if (!storedToken) {
         throw new Error('Refresh token not found or has been revoked');
      }

      // Generate new access token
      const accessToken = this.generateAuthToken({
         id: storedToken.user.id,
         phone: storedToken.user.phone,
         name: storedToken.user.name || undefined,
         isAdmin: storedToken.user.isAdmin,
      });

      return { accessToken, user: storedToken.user };
   },

   /**
    * Revoke refresh token (logout)
    */
   async revokeRefreshToken(refreshToken: string) {
      await refreshTokenRepository.revokeToken(refreshToken);
   },

   /**
    * Generate access + refresh token pair
    */
   async generateTokenPair(payload: {
      id: number;
      phone: string;
      name?: string;
      isAdmin: boolean;
   }) {
      // Generate access token
      const accessToken = this.generateAuthToken(payload);

      // Generate refresh token
      const refreshTokenExpiry = (process.env.REFRESH_TOKEN_EXPIRY ||
         '30Days') as ms.StringValue;
      const refreshToken = jwt.sign(
         { id: payload.id },
         process.env.JWT_REFRESH_SECRET!,
         {
            expiresIn: refreshTokenExpiry,
         }
      );

      // Calculate expiration date
      const expiresAt = this.calculateExpirationDate(refreshTokenExpiry);

      // Store refresh token in database
      await refreshTokenRepository.createRefreshToken(
         payload.id,
         refreshToken,
         expiresAt
      );

      return { accessToken, refreshToken };
   },

   /**
    * Generate access token
    */
   generateAuthToken(payload: {
      id: number;
      phone: string;
      name?: string;
      isAdmin: boolean;
   }) {
      const accessTokenExpiry = (process.env.ACCESS_TOKEN_EXPIRY ||
         '15Minutes') as ms.StringValue;
      return jwt.sign(payload, process.env.JWT_PRIVATE_KEY!, {
         expiresIn: accessTokenExpiry,
      });
   },

   /**
    * Calculate expiration date from ms string
    */
   calculateExpirationDate(expiry: ms.StringValue): Date {
      const milliseconds = ms(expiry);

      if (typeof milliseconds !== 'number') {
         throw new Error('Invalid expiry format');
      }

      return new Date(Date.now() + milliseconds);
   },
};
