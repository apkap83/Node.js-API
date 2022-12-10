import { describe, expect, test } from '@jest/globals';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import UserModel from '@/resources/user/user.model';
import App from '../app';
import PostController from '@/resources/post/post.controller';
import UserController from '@/resources/user/user.controller';

import dotenv from 'dotenv';
import path from 'path';

// Load Correct Test Environment
dotenv.config({
    path: path.resolve(
        __dirname,
        `../../config/${process.env.ENVIRONMENT}.env`
    ),
});

const prefixURL = '/api/users';
const testName = 'Apostolos Kapetanios';
const testEmail = 'ap.kapetanios@wind.gr';
const testPassword = 'password123';
let refreshToken = '';
let accessToken = '';

const user = UserModel;

describe('Authentication Tests', () => {
    const app = new App(
        [new PostController(), new UserController()],
        Number(5555)
    ).express;

    // Delete Everything in DB!
    beforeAll(async () => {
        await user.deleteMany();
    });

    test(
        'Not successful login attempt 1: (no creds): ' + `${prefixURL}/login`,
        async () => {
            const response = await request(app).post(`${prefixURL}/login`);
            expect(response.statusCode).toBe(400);
        }
    );

    test(
        'Not successful login attempt 2: (wrong creds): ' +
            `${prefixURL}/login`,
        async () => {
            const response = await request(app)
                .post(`${prefixURL}/login`)
                .set({ 'Content-Type': 'application/json' })
                .send({
                    username: 'myUserName',
                    password: 'mypassword',
                });

            expect(response.statusCode).toBe(400);
        }
    );

    test('Registration attempt 1: ' + `${prefixURL}/register`, async () => {
        const response = await request(app)
            .post(`${prefixURL}/register`)
            .set({ 'Content-Type': 'application/json' })
            .send({
                name: testName,
                email: testEmail,
                password: testPassword,
            });
    });

    test('Successful login attempt 1: ' + `${prefixURL}/login`, async () => {
        const response = await request(app)
            .post(`${prefixURL}/login`)
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

    test('Validate Access Token: ' + `${prefixURL}/me`, async () => {
        const response = await request(app)
            .get(`${prefixURL}/me`)
            .set({ Authorization: `Bearer ${accessToken}` });

        expect(response.statusCode).toBe(200);
    });

    test('Validate Faulty Access Token: ' + `${prefixURL}/me`, async () => {
        const response = await request(app)
            .get(`${prefixURL}/me`)
            .set({ Authorization: `Bearer ${accessToken}ABCD` });

        expect(response.statusCode).toBe(401);
    });

    test(
        'Get Successfully Access Token with a Refresh Token: ' +
            `${prefixURL}/refresh_access_token`,
        async () => {
            const response = await request(app)
                .post(`${prefixURL}/refresh_access_token`)
                .set({ 'Content-Type': 'application/json' })
                .send({
                    refreshToken,
                });

            accessToken = response.body.accessToken;
            expect(response.body).toHaveProperty('accessToken');
            expect(response.statusCode).toBe(200);
        }
    );

    test('Validate new Access Token: ' + `${prefixURL}/me`, async () => {
        const response = await request(app)
            .get(`${prefixURL}/me`)
            .set({ Authorization: `Bearer ${accessToken}` });

        expect(response.statusCode).toBe(200);
    });

    test(
        'Deny Access Token refresh action with a faulty Refresh Token: ' +
            `${prefixURL}/refresh_access_token`,
        async () => {
            refreshToken = `${refreshToken}ABCD`;
            const response = await request(app)
                .post(`${prefixURL}/refresh_access_token`)
                .set({ 'Content-Type': 'application/json' })
                .send({
                    refreshToken,
                });

            expect(response.body.message).toEqual(
                'Invalid refresh token provided'
            );
            expect(response.statusCode).toBe(400);
        }
    );

    test(
        'Deny Access Token refresh action because of an already deleted Refresh Token: ' +
            `${prefixURL}/refresh_access_token`,
        async () => {
            const responseForUserDetails = await request(app)
                .get(`${prefixURL}/me`)
                .set({ Authorization: `Bearer ${accessToken}` });

            // Remove the specific access token from DB
            const check = await user.updateOne(
                { _id: responseForUserDetails.body.user._id },
                {
                    $pullAll: {
                        refreshTokens: [refreshToken],
                    },
                }
            );

            const response = await request(app)
                .post(`${prefixURL}/refresh_access_token`)
                .set({ 'Content-Type': 'application/json' })
                .send({
                    refreshToken,
                });

            expect(response.body.message).toEqual(
                'Invalid refresh token provided'
            );
            expect(response.statusCode).toBe(400);
        }
    );
});
