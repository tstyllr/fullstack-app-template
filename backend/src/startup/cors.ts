import cors from 'cors';
import type { Express } from 'express';

export default function (app: Express) {
   app.use(cors());
}
