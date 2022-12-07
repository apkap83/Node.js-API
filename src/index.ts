import 'dotenv/config';
import 'module-alias/register';
import App from './app';
import validateEnv from '@/utils/validateEnv';
import PostController from '@/resources/post/post.controller';
import UserController from '@/resources/user/user.controller';

validateEnv();

// const app = new App([new PostController(), new UserController()], Number(4444));

const app2 = new App(
    [new PostController(), new UserController()],
    Number(43535)
);

// app.listen();
app2.listen();
