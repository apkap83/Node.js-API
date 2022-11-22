import 'dotenv/config';
import 'module-alias/register';
import App from './app';
import validateEnv from '@/utils/validateEnv';
import PostController from '@/resources/post/post.controller';

validateEnv();

const app = new App([new PostController()], Number(4444));

app.listen();
