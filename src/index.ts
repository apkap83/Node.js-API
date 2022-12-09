import 'module-alias/register';
import App from './app';
import validateEnv from '@/utils/validateEnv';
import PostController from '@/resources/post/post.controller';
import UserController from '@/resources/user/user.controller';

import dotenv from 'dotenv';
import path from 'path';

// Load Correct Environment based on ENVIRONMENT variable
dotenv.config({
    path: path.resolve(__dirname, `../config/${process.env.ENVIRONMENT}.env`),
});

//
validateEnv();

const app = new App([new PostController(), new UserController()], Number(4444));

app.listen();
