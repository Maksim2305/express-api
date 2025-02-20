import express from 'express';
import multer from 'multer';

const router = express.Router();

import { UserController } from '../controllers';

const storage = multer.diskStorage({
  destination: 'uploads',
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

router.post('/register', UserController.register);
router.post('/login', UserController.login);
router.get('/users/:id', UserController.getUserById);
router.put('/users/:id', UserController.updateUser);
router.get('/current', UserController.current);

export default router;
