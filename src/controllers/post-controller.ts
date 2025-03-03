import userModule from '../prisma/prisma-client';
import { Request, Response } from 'express';

const { prisma } = userModule;

const PostController = {
  createPost: async (req: Request, res: Response) => {
    const { content } = req.body;

    const authorId = req.user?.userId;

    if (!authorId) {
      res.status(400).json({ error: 'Необходима авторизация' });
      return;
    }

    if (!content) {
      res.status(400).json({ error: 'Контент поста обязателен' });
      return;
    }

    try {
      const post = await prisma.post.create({
        data: {
          content,
          authorId,
        },
      });
      res.json(post);
    } catch (error) {
      console.error('Create post failed');

      res.status(500).json({ error: 'Произошла ошибка при создании поста' });
    }
  },
  getAllPost: async (req: Request, res: Response) => {
    const userId = req.user?.userId;

    try {
      const posts = await prisma.post.findMany({
        include: {
          likes: true,
          author: true,
          comments: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      const postWithLikeInfo = posts.map((post) => ({
        ...post,
        likedByUser: post.likes.some((like) => like.userId === userId),
      }));

      res.json(postWithLikeInfo);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Произошла ошибка при получении постов' });
    }
  },
  getPostById: async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user?.userId;

    try {
      const post = await prisma.post.findUnique({
        where: { id },
        include: {
          likes: true,
          author: true,
          comments: {
            include: {
              user: true,
            },
          },
        },
      });

      if (!post) {
        res.status(404).json({ error: 'Пост не найден' });
        return;
      }

      const postWithLikeInfo = {
        ...post,
        likedByUser: post.likes.some((like) => like.userId === userId),
      };
      res.json(postWithLikeInfo);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Произошла ошибка при получении поста' });
    }
  },
  deletePost: async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user?.userId;

    const post = await prisma.post.findUnique({
      where: { id },
    });

    if (!post) {
      res.status(404).json({ error: 'Пост не найден' });
      return;
    }

    if (post.authorId !== userId) {
      res.status(403).json({ error: 'Нет доступа' });
      return;
    }

    try {
      const transaction = await prisma.$transaction([
        prisma.comment.deleteMany({ where: { postId: id } }),
        prisma.like.deleteMany({ where: { postId: id } }),
        prisma.post.delete({ where: { id } }),
      ]);

      res.json(transaction);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Произошла ошибка при удалении поста' });
    }
  },
};

export default PostController;
