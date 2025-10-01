import * as tencentcloud from 'tencentcloud-sdk-nodejs-sms';
import { logger } from '../utils/logger.js';

/**
 * SMS Service for Tencent Cloud SMS
 *
 * Configuration required (see .env.example):
 * - TENCENT_SMS_SECRET_ID
 * - TENCENT_SMS_SECRET_KEY
 * - TENCENT_SMS_APP_ID
 * - TENCENT_SMS_SIGN_NAME
 * - TENCENT_SMS_TEMPLATE_ID
 * - TENCENT_SMS_REGION (optional, defaults to ap-guangzhou)
 * - TENCENT_SMS_CODE_TIMEOUT (optional, verification code validity in minutes, defaults to 2)
 *
 * Reference: https://cloud.tencent.com/document/product/382/43197
 */

const SmsClient = tencentcloud.sms.v20210111.Client;

interface SmsConfig {
   secretId: string;
   secretKey: string;
   appId: string;
   signName: string;
   templateId: string;
   region: string;
   codeTimeoutMinutes: string;
}

interface SmsError extends Error {
   code?: string;
   requestId?: string;
}

// Lazy-initialized SMS client
let smsClient: InstanceType<typeof SmsClient> | null = null;

/**
 * Get SMS configuration from environment variables
 */
function getSmsConfig(): SmsConfig {
   return {
      secretId: process.env.TENCENT_SMS_SECRET_ID || '',
      secretKey: process.env.TENCENT_SMS_SECRET_KEY || '',
      appId: process.env.TENCENT_SMS_APP_ID || '',
      signName: process.env.TENCENT_SMS_SIGN_NAME || '',
      templateId: process.env.TENCENT_SMS_TEMPLATE_ID || '',
      region: process.env.TENCENT_SMS_REGION || 'ap-guangzhou',
      codeTimeoutMinutes: process.env.TENCENT_SMS_CODE_TIMEOUT || '2',
   };
}

/**
 * Initialize SMS client (lazy initialization)
 */
function getSmsClient(): InstanceType<typeof SmsClient> {
   if (smsClient) {
      return smsClient;
   }

   const config = getSmsConfig();

   smsClient = new SmsClient({
      credential: {
         /* 为了保护密钥安全，建议将密钥设置在环境变量中或者配置文件中。
          * 硬编码密钥到代码中有可能随代码泄露而暴露，有安全隐患，并不推荐。
          * SecretId、SecretKey 查询: https://console.cloud.tencent.com/cam/capi */
         secretId: config.secretId,
         secretKey: config.secretKey,
      },
      /* 必填：地域信息，可以直接填写字符串ap-guangzhou，支持的地域列表参考 https://cloud.tencent.com/document/api/382/52071#.E5.9C.B0.E5.9F.9F.E5.88.97.E8.A1.A8 */
      region: config.region,
      /* 非必填:
       * 客户端配置对象，可以指定超时时间等配置 */
      profile: {
         /* SDK默认用TC3-HMAC-SHA256进行签名，非必要请不要修改这个字段 */
         signMethod: 'HmacSHA256',
         httpProfile: {
            reqMethod: 'POST', // 请求方法
            reqTimeout: 60, // 请求超时时间，默认60s
            /**
             * 指定接入地域域名，默认就近地域接入域名为 sms.tencentcloudapi.com ，也支持指定地域域名访问，例如广州地域的域名为 sms.ap-guangzhou.tencentcloudapi.com
             */
            endpoint: 'sms.tencentcloudapi.com',
         },
      },
   });
   return smsClient;
}

/**
 * Validate phone number format
 * Supports international format with country code
 */
function validatePhoneNumber(phone: string): boolean {
   // Remove spaces and dashes for validation
   const normalized = phone.replace(/[\s-]/g, '');

   // E.164 format: +[country code][number] (max 15 digits)
   // Must start with + or a digit, total 7-15 digits
   const e164Pattern = /^\+?[1-9]\d{6,14}$/;

   return e164Pattern.test(normalized);
}

/**
 * Normalize phone number to E.164 format
 */
function normalizePhoneNumber(phone: string): string {
   const normalized = phone.replace(/[\s-]/g, '');

   // Ensure it starts with +
   if (!normalized.startsWith('+')) {
      // Assume China (+86) if no country code
      return `+86${normalized}`;
   }

   return normalized;
}

export const smsService = {
   /**
    * Send verification code via SMS
    * @param phone - Phone number (with country code, e.g., +8613800138000 or 13800138000)
    * @param code - Verification code to send
    * @throws Error if phone number is invalid or SMS fails to send
    */
   async sendVerificationCode(phone: string, code: string): Promise<void> {
      // Validate phone number format
      if (!validatePhoneNumber(phone)) {
         logger.error(`Invalid phone number format: ${phone}`);
         throw new Error(
            'Invalid phone number format. Please use international format (e.g., +8613800138000)'
         );
      }

      const normalizedPhone = normalizePhoneNumber(phone);

      // Validate configuration before attempting to send
      if (!this.validateConfig()) {
         throw new Error(
            'SMS service not configured. Please set up Tencent Cloud SMS credentials.'
         );
      }

      const config = getSmsConfig();

      try {
         const client = getSmsClient();

         const params = {
            PhoneNumberSet: [normalizedPhone],
            SmsSdkAppId: config.appId,
            SignName: config.signName,
            TemplateId: config.templateId,
            TemplateParamSet: [code, config.codeTimeoutMinutes],
         };

         logger.info(`Sending SMS to ${normalizedPhone}`, {
            appId: config.appId,
            signName: config.signName,
            templateId: config.templateId,
         });

         const response = await client.SendSms(params);

         // Check response status
         if (response.SendStatusSet && response.SendStatusSet.length > 0) {
            const status = response.SendStatusSet[0];

            if (!status) {
               logger.error(
                  `SMS response status undefined for ${normalizedPhone}`,
                  { response }
               );
               throw new Error('Invalid SMS response from provider');
            }

            if (status.Code === 'Ok') {
               logger.info(`SMS sent successfully to ${normalizedPhone}`, {
                  serialNo: status.SerialNo,
                  requestId: response.RequestId,
               });
            } else {
               logger.error(`SMS failed to send to ${normalizedPhone}`, {
                  code: status.Code,
                  message: status.Message,
                  requestId: response.RequestId,
               });
               throw new Error(
                  `Failed to send SMS: ${status.Message || 'Unknown error'}`
               );
            }
         } else {
            logger.error(`SMS response invalid for ${normalizedPhone}`, {
               response,
            });
            throw new Error('Invalid SMS response from provider');
         }
      } catch (error) {
         const smsError = error as SmsError;

         // Log detailed error information
         logger.error(`Failed to send SMS to ${normalizedPhone}`, {
            error: smsError.message,
            code: smsError.code,
            requestId: smsError.requestId,
         });

         // Provide user-friendly error messages based on error codes
         if (smsError.code === 'FailedOperation.ContainSensitiveWord') {
            throw new Error(
               'SMS content contains sensitive words. Please contact support.'
            );
         } else if (smsError.code === 'LimitExceeded.PhoneNumberDailyLimit') {
            throw new Error(
               'Daily SMS limit reached for this phone number. Please try again tomorrow.'
            );
         } else if (
            smsError.code === 'LimitExceeded.PhoneNumberThirtySecondLimit'
         ) {
            throw new Error(
               'Please wait at least 30 seconds before requesting another verification code.'
            );
         } else if (
            smsError.code === 'InvalidParameterValue.IncorrectPhoneNumber'
         ) {
            throw new Error(
               'Invalid phone number. Please check and try again.'
            );
         } else if (smsError.code?.startsWith('AuthFailure')) {
            throw new Error(
               'SMS service authentication failed. Please contact support.'
            );
         }

         // Generic error message for other cases
         throw new Error(
            'Failed to send verification code. Please try again later.'
         );
      }
   },

   /**
    * Validate SMS configuration
    */
   validateConfig(): boolean {
      const required = [
         'TENCENT_SMS_SECRET_ID',
         'TENCENT_SMS_SECRET_KEY',
         'TENCENT_SMS_APP_ID',
         'TENCENT_SMS_SIGN_NAME',
         'TENCENT_SMS_TEMPLATE_ID',
      ];

      const missing = required.filter((key) => !process.env[key]);

      if (missing.length > 0 && process.env.NODE_ENV !== 'development') {
         logger.warn(`Missing SMS configuration: ${missing.join(', ')}`);
         return false;
      }

      return true;
   },

   /**
    * Generate a random 6-digit verification code
    */
   generateCode(): string {
      return Math.floor(100000 + Math.random() * 900000).toString();
   },
};
