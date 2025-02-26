import userModule from '../prisma/prisma-client';
import { Request, Response } from 'express';

const { prisma } = userModule;

const PostController = {
  createPost: async (req: Request, res: Response) => {
    res.send('createPost');
  },
  getAllPost: async (req: Request, res: Response) => {
    res.send('getAllPost');
  },
  getPostById: async (req: Request, res: Response) => {
    res.send('getPostById');
  },
  deletePost: async (req: Request, res: Response) => {
    res.send('deletePost');
  },
};

export default PostController;
