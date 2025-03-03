import express from 'express';
import multer from 'multer';
import { CommentController, PostController, UserController } from '../controllers';
import authentificateToken from '../middlewares/auth';

const router = express.Router();

const storage = multer.diskStorage({
  destination: 'uploads',
  filename: function (_, file, cb) {
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
router.post('/posts', authentificateToken, PostController.createPost);
router.get('/posts', authentificateToken, PostController.getAllPost);
router.get('/posts/:id', authentificateToken, PostController.getPostById);
router.delete('/posts/:id', authentificateToken, PostController.deletePost);

//Routes Comment
router.post('/comments', authentificateToken, CommentController.createComment);
router.delete('/comments/:id', authentificateToken, CommentController.deleteComment);

export default router;
