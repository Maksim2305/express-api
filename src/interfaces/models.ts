declare module 'express' {
  interface Request {
    user?: User;
  }
}

export interface User {
  id: string;
  userId?: string;
  email: string;
  password: string;
  name?: string | null;
  avatarUrl?: string | null;
  dateOfBirth?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  bio?: string | null;
  location?: string | null;
  posts?: Post[];
  likes?: Like[];
  comments?: Comment[];
  followers?: Follows[];
  following?: Follows[];
}

export interface Follows {
  id: string;
  follower: User;
  followerId: string;
  following: User;
  followingId: string;
}

export interface Post {
  id: string;
  author: User;
  content: string;
  authorId: string;
  likes?: Like[];
  comments?: Comment[];
  createdAt: Date;
}

export interface Like {
  id: string;
  user: User;
  userId: string;
  post: Post;
  postId: string;
}

export interface Comment {
  id: string;
  content: string;
  user: User;
  userId: string;
  post: Post;
  postId: string;
}
