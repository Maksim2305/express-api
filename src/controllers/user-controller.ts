import bcrypt from 'bcryptjs';
import jdenticon from 'jdenticon';
import path from 'path';
import fs from 'fs';
import userModule from '../prisma/prisma-client';
import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { User } from '../interfaces/models';
dotenv.config();

const { prisma } = userModule;

interface RequestBody {
  email: string;
  password: string;
  name: string;
  dateOfBirth?: string;
  bio?: string;
  location?: string;
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

  login: async (req: Request<{}, {}, Pick<User, 'email' | 'password'>>, res: Response): Promise<void> => {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Все поля обязательны' });
      return;
    }

    try {
      const user = await prisma.user.findUnique({ where: { email } });

      if (!user) {
        res.status(400).json({ error: 'Неверный логин или пароль' });
        return;
      }

      const isValid = await bcrypt.compare(password, user.password);

      if (!isValid) {
        res.status(400).json({ error: 'Неверный логин или пароль' });
        return;
      }

      const secretKey = process.env.SECRET_KEY;
      if (!secretKey) {
        throw new Error(`SECRET_KEY не определен`);
      }

      const token = jwt.sign({ userId: user.id }, secretKey);
      res.json({ token });
    } catch (err) {
      console.error('Error in login', err);
      res.status(500).json({ error: 'Ошибка сервера' });
    }
  },

  getUserById: async (req: Request<{ id: string }, {}, RequestBody>, res: Response): Promise<void> => {
    const { id } = req.params;
    const userId = req.user && req.user.userId;
    try {
      const user = await prisma.user.findUnique({
        where: { id },
        include: {
          followers: true,
          following: true,
        },
      });

      if (!user) {
        res.status(404).json({ error: 'Пользователь не найден' });
        return;
      }

      const isFollowing = await prisma.user.findFirst({
        where: {
          following: {
            some: {
              followerId: userId,
              followingId: id,
            },
          },
        },
      });

      res.json({ ...user, isFollowing: Boolean(isFollowing) });
    } catch (error) {
      console.error('Error in getUserById', error);
      res.status(500).json({ error: 'Ошибка сервера' });
    }
  },

  updateUser: async (req: Request<{ id: string }, {}, RequestBody>, res: Response): Promise<void> => {
    const { id } = req.params;
    const userId = req.user && req.user.userId;
    const { email, name, dateOfBirth, bio, location } = req.body;

    let filePath: string | null = null;

    if (req.file && req.file.path) {
      filePath = req.file.path;
    }
    if (id !== userId) {
      res.status(403).json({ error: 'Доступ запрещен' });
      return;
    }

    try {
      if (email) {
        const isExistUser = await prisma.user.findFirst({
          where: { email },
        });

        if (isExistUser && isExistUser.id !== id) {
          res.status(400).json({ error: 'Пользователь с таким email уже существует' });
          return;
        }
      }

      const user = await prisma.user.update({
        where: { id },
        data: {
          email: email || undefined,
          name: name || undefined,
          dateOfBirth: dateOfBirth || undefined,
          bio: bio || undefined,
          location: location || undefined,
          avatarUrl: filePath ? `/${filePath}` : undefined,
        },
      });

      res.json(user);
    } catch (error) {
      console.error('Error in updateUser', error);
      res.status(500).json({ error: 'Ошибка сервера' });
    }
  },

  current: async (req: Request<{ id: string }, {}, RequestBody>, res: Response) => {
    try {
      const userId = req.user && req.user.userId;

      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          followers: {
            include: {
              follower: true,
            },
          },
          following: {
            include: {
              following: true,
            },
          },
        },
      });

      if (!user) {
        res.status(404).json({ error: 'Пользователь не найден' });
        return;
      }

      res.json(user);
    } catch (err) {
      console.error('Error in current', err);
      res.status(500).json({ error: 'Ошибка сервера' });
    }
  },
};

export default UserController;
