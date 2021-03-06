import express, {Request, Response, NextFunction} from 'express';
import session, { Session } from 'express-session';
import sessionFileStore from 'session-file-store';
import authRouter from './routes/auth';
import paperRouter from './routes/paper';
import paperPostRouter from './routes/paperPost';
import mainRouter from './routes/main';
import mypaperRouter from './routes/mypaper';
import { authRestrict } from './middlewares/login';
import { appController } from './controllers/app';

const app = express();
const FileStore = sessionFileStore(session);


export const sessionOptions = {
  name: 'my.connect.sid',
  secret: 'EOFKVNS49439W3JG',
  resave: false,
  saveUninitialized: true,
  cookie: {
    maxAge: 60 * 60 * 12 * 30
  },
  store: new FileStore()
};

app.use(session(sessionOptions));
app.use(express.json());
app.use(express.urlencoded({extended: false}));

// 메인
app.get('/', appController);

// 인증 라우터
app.use('/auth', authRouter);

// 메인
app.use('/main', authRestrict, mainRouter);

// 롤링 페이퍼 라우터
app.use('/paper', authRestrict, paperRouter);

// 롤링 페이퍼 작성 라우터
app.use('/paper', paperPostRouter);

// 에러 미들웨어
app.use(function (error: Error, req: Request, res: Response, next: NextFunction) {
  res.json({message: error.message});
})

app.listen(3000,() => {
  console.log('http://localhost:3000');
});
