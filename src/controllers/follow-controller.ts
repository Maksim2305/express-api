import userModule from '../prisma/prisma-client';
import { Request, Response } from 'express';

const { prisma } = userModule;

const FollowController = {
  followUser: async (req: Request, res: Response) => {
    const { followingId } = req.body;
    const userId = req.user?.userId;

    if (followingId === userId) {
      res.status(400).json({ error: 'Нельзя подписаться на самого себя' });
      return;
    }

    if (!userId) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    try {
      const followingUser = await prisma.user.findUnique({
        where: { id: followingId },
      });

      if (!followingUser) {
        res.status(404).json({ error: 'Пользователь для подписки не найден' });
        return;
      }

      const isExistSubscription = await prisma.follows.findFirst({
        where: {
          AND: [{ followerId: userId }, { followingId }],
        },
      });

      if (isExistSubscription) {
        res.status(400).json({ error: 'Вы уже подписаны на этого пользователя' });
        return;
      }

      await prisma.follows.create({
        data: {
          follower: { connect: { id: userId } },
          following: { connect: { id: followingId } },
        },
      });

      res.status(201).json({ message: 'Подписка успешно создана' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Ошибка сервера' });
    }
  },
  unfollowUser: async (req: Request, res: Response) => {
    const { followingId } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    try {
      const follows = await prisma.follows.findFirst({
        where: {
          AND: [{ followerId: userId }, { followingId }],
        },
      });

      if (!follows) {
        res.status(404).json({ error: 'Подписка не найдена' });
        return;
      }

      await prisma.follows.delete({ where: { id: follows.id } });
      res.status(200).json({ message: 'Вы успешно отписались' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Ошибка сервера' });
    }
  },
};

export default FollowController;
