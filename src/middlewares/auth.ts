import jwt from 'jsonwebtoken';
import { NextFunction, Request, Response } from 'express';
import { User } from '../interfaces/models';

const authentificateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'] as string;

  const token = authHeader && authHeader?.split(' ')[1];

  if (!token) {
    res.status(401).json({ error: 'Unauthorized' });
  }

  const secretKey = process.env.SECRET_KEY;
  if (!secretKey) {
    throw new Error('Secret key is not defined');
  }

  jwt.verify(token, secretKey, (err, user) => {
    if (err) {
      res.status(403).json({ error: 'Forbidden' });
    }

    req.user = user as User;
    next();
  });
};

export default authentificateToken;
