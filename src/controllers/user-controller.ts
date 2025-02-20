import bcrypt from 'bcryptjs';
import jdenticon from 'jdenticon';
import path from 'path';
import fs from 'fs';
import userModule from '../prisma/prisma-client';
import { NextFunction, Request, Response } from 'express';

const { prisma } = userModule;

interface RequestBody {
  email: string;
  password: string;
  name: string;
}

const UserController = {
  register: async (req: Request<{}, {}, RequestBody>, res: Response, next: NextFunction): Promise<void> => {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      res.status(400).json({ error: 'Все поля обязательны' });
      return;
    }

    try {
      const isExistUser = await prisma.user.findUnique({
        where: { email },
      });

      if (isExistUser) {
        res.status(400).json({ error: 'Пользователь с таким email уже существует' });
        return;
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const png = jdenticon.toPng(name, 200);
      const avatarName = `${name}_${Date.now()}.png`;
      const avatarPath = path.join(__dirname, '../uploads', avatarName);
      fs.writeFileSync(avatarPath, png);

      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          avatarUrl: `/uploads/${avatarPath}`,
        },
      });

      res.json(user);
    } catch (err) {
      console.error('Error in register', err);
      res.status(500).json({ error: 'Ошибка сервера' });
    }
  },

  login: async (req: any, res: any) => {
    res.send('User logged in successfully');
  },

  getUserById: async (req: any, res: any) => {
    res.send(`User ${req.params.id} retrieved successfully`);
  },

  updateUser: async (req: any, res: any) => {
    res.send(`User ${req.params.id} updated successfully`);
  },

  current: async (req: any, res: any) => {
    res.send('Current user retrieved successfully');
  },
};

export default UserController;
