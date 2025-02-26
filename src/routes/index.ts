import express from 'express';
import multer from 'multer';
import { UserController } from '../controllers';
import authentificateToken from '../middlewares/auth';

const router = express.Router();

const storage = multer.diskStorage({
  destination: 'uploads',
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

// Route User
router.post('/register', UserController.register);
router.post('/login', UserController.login);
router.get('/users/:id', authentificateToken, UserController.getUserById);
router.put('/users/:id', authentificateToken, UserController.updateUser);
router.get('/current', authentificateToken, UserController.current);

//Routes Post

// router.post('/post', au)

export default router;
