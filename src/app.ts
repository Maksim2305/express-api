import createError from 'http-errors';
import express, { NextFunction, Response, Request } from 'express';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import fs from 'fs';
import cors from 'cors';
import routes from './routes';

const app = express();

app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.set('view engine', 'jade');

app.use('/uploads', express.static('uploads'));

app.use('/api', routes);

if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// catch 404 and forward to error handler
app.use(function (req, res, next: NextFunction) {
  next(createError(404));
});

// error handler

app.use(function (err: any, req: Request, res: Response, next: NextFunction) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

export default app;
