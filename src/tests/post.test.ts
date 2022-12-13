import { describe, expect, test } from '@jest/globals';
import request from 'supertest';
import UserModel from '@/resources/user/user.model';
import PostModel from '@/resources/post/post.model';
import App from '../app';
import PostController from '@/resources/post/post.controller';
import UserController from '@/resources/user/user.controller';
import mongoose from 'mongoose';

import dotenv from 'dotenv';
import path from 'path';

// Load Correct Test Environment
dotenv.config({
    path: path.resolve(
        __dirname,
        `../../config/${process.env.ENVIRONMENT}.env`
    ),
});

const userPrefixURL = '/api/users';
const postsPrefixURL = '/api/posts';
const testName = 'Nikos Karetatos';
const testEmail = 'n.karetatos@wind.gr';
const testPassword = 'MyPassword123';
let refreshToken = '';
let accessToken = '';

const user = UserModel;
const post = PostModel;

describe('Post Tests', () => {
    const app = new App(
        [new PostController(), new UserController()],
        Number(5555)
    ).express;

    // Delete Everything in DB from posts collection
    beforeAll(async () => {
        await post.deleteMany();
        await post.deleteMany();
    });

    // Close open db connection
    afterAll(() => mongoose.disconnect());

    test(
        'Unauthenticated HTTP POST a new Post message: ' + `${postsPrefixURL}`,
        async () => {
            const response = await request(app)
                .post(`${postsPrefixURL}`)
                .set({ 'Content-Type': 'application/json' })
                .send({
                    title: 'My New Title',
                    body: 'My New Body',
                });

            expect(response.body.error).toBe('Unauthorized');
            expect(response.statusCode).toBe(401);
        }
    );

    test(
        'Registration of a new user: ' + `${userPrefixURL}/register`,
        async () => {
            const response = await request(app)
                .post(`${userPrefixURL}/register`)
                .set({ 'Content-Type': 'application/json' })
                .send({
                    name: testName,
                    email: testEmail,
                    password: testPassword,
                });
        }
    );

    test('Successful login attempt: ' + `${userPrefixURL}/login`, async () => {
        const response = await request(app)
            .post(`${userPrefixURL}/login`)
            .set({ 'Content-Type': 'application/json' })
            .send({
                email: testEmail,
                password: testPassword,
            });
        accessToken = response.body.accessToken;
        refreshToken = response.body.refreshToken;
        expect(response.body).toHaveProperty('accessToken');
        expect(response.body).toHaveProperty('refreshToken');
        expect(response.body.accessToken).not.toEqual(
            response.body.refreshToken
        );
        expect(response.statusCode).toBe(200);
    });

    test(
        'Authenticated HTTP POST a new Post message: ' + `${postsPrefixURL}`,
        async () => {
            const response = await request(app)
                .post(`${postsPrefixURL}`)
                .set({ 'Content-Type': 'application/json' })
                .set({ Authorization: `Bearer ${accessToken}` })
                .send({
                    title: 'My New Title (authorized)',
                    body: 'My New Body (authorized)',
                });

            expect(response.statusCode).toBe(201);
        }
    );
});
