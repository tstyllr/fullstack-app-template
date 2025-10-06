import type { Response } from 'express';
import type { AuthRequest } from '../types/auth.js';
import { userRepository } from '../repositories/user.repository.js';

export const userController = {
   async getCurrentUser(req: AuthRequest, res: Response) {
      if (!req.user) {
         return res.status(401).json({ error: 'Unauthorized' });
      }

      try {
         const user = await userRepository.getUserById(req.user.id);
         if (!user) {
            return res.status(404).json({ error: 'User not found' });
         }

         res.json({
            id: user.id,
            phone: user.phone,
            name: user.name,
            isAdmin: user.isAdmin,
         });
      } catch (error) {
         res.status(500).json({ error: 'Internal server error' });
      }
   },

   async getAllUsers(req: AuthRequest, res: Response) {
      try {
         const users = await userRepository.getAllUsers();
         res.json(users);
      } catch (error) {
         res.status(500).json({ error: 'Internal server error' });
      }
   },
};
