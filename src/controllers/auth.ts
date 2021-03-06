import fs from 'fs';
import { NextFunction, Request, Response } from 'express';
import { setEncryption, setDecryption } from '../middlewares/pbk';
import { users } from '../models/users';
import { HOST_ADDRESS } from '../config';
import { sessionOptions } from '../app';
import { SessionData } from '../types';
import template from '../template';

import { updatedUser } from '../services/users';


export function getRegisterUser (req: Request, res: Response) {
  const html = template.HTML('register', `
    <h1>회원가입</h1>
    <form action="/auth/user" method="post" enctype='application/json'>
      <p><input type="text" name="userName" placeholder="name" value="홍길동" /></p>
      <p><input type="text" name="userId" placeholder="id" value="ghdrlfehd" /></p>
      <p><input type="password" name="userPw" placeholder="password" value="123456" /></p>
      <input type="submit" value="회원가입">
    </form>
  `)
  res.send(html);
}

export function postRegisterUser (req: Request, res: Response) {
  const {userName, userId, userPw} = req.body;
  
  setEncryption(userPw, (result) => {
    if (result === null) res.redirect('/auth/user');
    else {
      updatedUser(0, result);
      res.redirect('/auth/login');
    }
  });
}
// fs.writeFile(`${__dirname}/users.txt`, JSON.stringify(users), (err) => {
//   if (err) console.log(err);
// });

export function getLoginUser (req: Request, res: Response) {
  const html = template.HTML('login', `
    <h1>로그인</h1>
    <form action="/auth/login" method="post" enctype='application/json'>
      <p><input type="text" name="userId" placeholder="id" value="ghdrlfehd" /></p>
      <p><input type="password" name="userPw" placeholder="password" value="123456" /></p>
      <input type="submit" value="로그인">
    </form>
    <br />
    <a href="${HOST_ADDRESS}/auth/user">회원가입 하기</a>
  `)
  res.send(html);
}

export function postLoginUser (req: Request, res: Response, next: NextFunction) {
  const {userId, userPw} = req.body;
  
  setDecryption(users, userId, userPw, (err, user) => {
    if (err === null) return res.redirect('/auth/user');
    if (user) {
      req.session.regenerate(function() {
        (req.session as SessionData).user = {id: userId, name: user.name};
        (req.session as SessionData).isLogined = true;
        res.redirect('/main');
      })
    } else {
      (req.session as SessionData).user = null;
      (req.session as SessionData).isLogined = false;
      res.redirect('/auth/login');
    }
  })
}

export function getLogout (req: Request, res: Response) {
  req.session.destroy(function(err) {
    if (err) {
      console.error(err);
      res.status(500).send('[Internal Server Error] Session destroy ')
    } else {
      res.clearCookie(sessionOptions.name);
      res.redirect('/');
    }
  });
}
