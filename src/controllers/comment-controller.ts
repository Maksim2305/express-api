import userModule from '../prisma/prisma-client';
import { Request, Response } from 'express';

const { prisma } = userModule;

const CommentController = {
  createComment: async (req: Request, res: Response) => {
    const { postId, content } = req.body;
    const userId = req.user?.userId;

    if (!postId || !content) {
      res.status(400).json({ error: 'Все поля обязательны' });
      return;
    }

    if (!userId) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    try {
      const comment = await prisma.comment.create({
        data: {
          content,
          postId,
          userId,
        },
      });
      res.json(comment);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: 'Ошибка сервера' });
    }
  },
  deleteComment: async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    try {
      const comment = await prisma.comment.findUnique({
        where: { id },
      });
      if (!comment) {
        res.status(404).json({ error: 'Комментарий не найден' });
        return;
      }
      if (comment.userId !== userId) {
        res.status(403).json({ error: 'Нет доступа' });
        return;
      }
      await prisma.comment.delete({ where: { id } });
      res.json(comment);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: 'Ошибка сервера' });
    }
  },
};

export default CommentController;
