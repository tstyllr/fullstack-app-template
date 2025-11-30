import cors from 'cors';
import type { Express } from 'express';

export default function (app: Express) {
   // Parse allowed origins from environment variable or use defaults
   const allowedOrigins = process.env.ALLOWED_ORIGINS
      ? process.env.ALLOWED_ORIGINS.split(',').map((origin) => origin.trim())
      : [
           'http://localhost:8081', // Expo web dev server (default)
           'http://localhost:19006', // Alternative Expo web port
           'exp://localhost:8081', // Expo Go on iOS
        ];

   const corsOptions = {
      origin: (
         origin: string | undefined,
         callback: (err: Error | null, allow?: boolean) => void
      ) => {
         // Allow requests with no origin (like mobile apps, Postman, curl)
         if (!origin) return callback(null, true);

         if (allowedOrigins.includes(origin)) {
            callback(null, true);
         } else {
            callback(new Error(`Origin ${origin} not allowed by CORS`));
         }
      },
      credentials: true, // Required for cookies/sessions
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      exposedHeaders: ['set-cookie'],
      optionsSuccessStatus: 200,
   };

   app.use(cors(corsOptions));
}
