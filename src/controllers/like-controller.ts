import userModule from '../prisma/prisma-client';
import { Request, Response } from 'express';

const { prisma } = userModule;

const LikeController = {
  likePost: async (req: Request, res: Response) => {
    const { postId } = req.body;
    const userId = req.user?.userId;

    if (!postId) {
      res.status(400).json({ error: 'Пост обязателен' });
      return;
    }

    if (!userId) {
      res.status(403).json({ error: 'Необходима авторизация' });
      return;
    }

    try {
      const isExistLike = await prisma.like.findFirst({
        where: {
          userId,
          postId,
        },
      });

      if (isExistLike) {
        res.status(400).json({ error: 'Вы уже лайкнули этот пост' });
        return;
      }

      const like = await prisma.like.create({
        data: {
          userId,
          postId,
        },
      });
      res.json(like);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Произошла ошибка' });
    }
  },
  unLikePost: async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user?.userId;

    if (!id) {
      res.status(400).json({ error: 'Лайк обязателен' });
      return;
    }

    if (!userId) {
      res.status(403).json({ error: 'Необходима авторизация' });
      return;
    }

    try {
      const isExistLike = await prisma.like.findFirst({
        where: {
          userId,
          postId: id,
        },
      });

      if (!isExistLike) {
        res.status(400).json({ error: 'Нельзя поставить дизлайк' });
        return;
      }

      const like = await prisma.like.deleteMany({
        where: {
          userId,
          postId: id,
        },
      });
      res.json(like);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Произошла ошибка' });
    }
  },
};

export default LikeController;
