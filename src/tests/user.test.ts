import { describe, expect, test } from '@jest/globals';
import request from 'supertest';
import UserModel from '@/resources/user/user.model';
import App from '../app';
import UserController from '@/resources/user/user.controller';
import UserRoles from '@/utils/UserRoles';

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
const testName = 'Nikos Karetatos';
const testEmail = 'n.karetatos@wind.gr';
const testPassword = 'MyPassword123';

const adminName = 'Apostolos Kapetanios';
const adminEmail = 'ap.kapetanios@wind.gr';
const adminPassword = 'MyAdminPassword123';

let simpleUserRefreshToken = '';
let simpleUserAccessToken = '';

let adminRefreshToken = '';
let adminAccessToken = '';

const user = UserModel;

describe('User Tests', () => {
    const app = new App([new UserController()], Number(5555)).express;

    // Delete Everything in DB from users collection
    beforeAll(async () => {
        // Delete Everything from User collection
        await user.deleteMany();

        // Create the first Admin Account in DB
        await user.create({
            name: adminName,
            email: adminEmail,
            password: adminPassword,
            role: UserRoles.Admin,
        });
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

    test(
        'Successful login attempt with Admin User: ' + `${prefixURL}/login`,
        async () => {
            const response = await request(app)
                .post(`${prefixURL}/login`)
                .set({ 'Content-Type': 'application/json' })
                .send({
                    email: adminEmail,
                    password: adminPassword,
                });
            adminAccessToken = response.body.accessToken;
            adminRefreshToken = response.body.refreshToken;
            expect(response.body).toHaveProperty('accessToken');
            expect(response.body).toHaveProperty('refreshToken');
            expect(response.body.accessToken).not.toEqual(
                response.body.refreshToken
            );
            expect(response.statusCode).toBe(200);
        }
    );
    test(
        'Registration of a simple User (running this as an admin) ' +
            `${prefixURL}/register`,
        async () => {
            const response = await request(app)
                .post(`${prefixURL}/register`)
                .set({ 'Content-Type': 'application/json' })
                .set({ Authorization: `Bearer ${adminAccessToken}` })
                .send({
                    name: testName,
                    email: testEmail,
                    password: testPassword,
                });
            expect(response.statusCode).toBe(201);
        }
    );

    test(
        'Registration of a 2nd simple User (running this as an admin) ' +
            `${prefixURL}/register`,
        async () => {
            const response = await request(app)
                .post(`${prefixURL}/register`)
                .set({ 'Content-Type': 'application/json' })
                .set({ Authorization: `Bearer ${adminAccessToken}` })
                .send({
                    name: 'Whatever Name 1',
                    email: 'whateveremail1@wind.gr',
                    password: 'whateverpassword1',
                });
            expect(response.statusCode).toBe(201);
        }
    );

    test(
        'Successful login attempt with a Simple User: ' + `${prefixURL}/login`,
        async () => {
            const response = await request(app)
                .post(`${prefixURL}/login`)
                .set({ 'Content-Type': 'application/json' })
                .send({
                    email: testEmail,
                    password: testPassword,
                });
            simpleUserAccessToken = response.body.accessToken;
            simpleUserRefreshToken = response.body.refreshToken;
            expect(response.body).toHaveProperty('accessToken');
            expect(response.body).toHaveProperty('refreshToken');
            expect(response.body.accessToken).not.toEqual(
                response.body.refreshToken
            );
            expect(response.statusCode).toBe(200);
        }
    );

    test('Validate Access Token of Admin: ' + `${prefixURL}/me`, async () => {
        const response = await request(app)
            .get(`${prefixURL}/me`)
            .set({ Authorization: `Bearer ${adminAccessToken}` });

        expect(response.statusCode).toBe(200);
    });

    test(
        'Validate Access Token of Simple User: ' + `${prefixURL}/me`,
        async () => {
            const response = await request(app)
                .get(`${prefixURL}/me`)
                .set({ Authorization: `Bearer ${simpleUserAccessToken}` });

            expect(response.statusCode).toBe(200);
        }
    );

    test('Validate a Faulty Access Token: ' + `${prefixURL}/me`, async () => {
        const response = await request(app)
            .get(`${prefixURL}/me`)
            .set({ Authorization: `Bearer ${simpleUserAccessToken}ABCD` });

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
                    refreshToken: simpleUserRefreshToken,
                });

            simpleUserAccessToken = response.body.accessToken;
            expect(response.body).toHaveProperty('accessToken');
            expect(response.statusCode).toBe(200);
        }
    );

    test('Validate new Access Token: ' + `${prefixURL}/me`, async () => {
        const response = await request(app)
            .get(`${prefixURL}/me`)
            .set({ Authorization: `Bearer ${simpleUserAccessToken}` });

        expect(response.statusCode).toBe(200);
    });

    test(
        'Deny Access Token refresh action with a faulty Refresh Token: ' +
            `${prefixURL}/refresh_access_token`,
        async () => {
            const faultyRefreshToken = `${simpleUserRefreshToken}ABCD`;
            const response = await request(app)
                .post(`${prefixURL}/refresh_access_token`)
                .set({ 'Content-Type': 'application/json' })
                .send({
                    refreshToken: faultyRefreshToken,
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
                .set({ Authorization: `Bearer ${simpleUserAccessToken}` });

            // Remove the specific access token from DB
            const check = await user.updateOne(
                { _id: responseForUserDetails.body.user._id },
                {
                    $pullAll: {
                        refreshTokens: [simpleUserRefreshToken],
                    },
                }
            );

            const response = await request(app)
                .post(`${prefixURL}/refresh_access_token`)
                .set({ 'Content-Type': 'application/json' })
                .send({
                    refreshToken: simpleUserRefreshToken,
                });

            expect(response.body.message).toEqual(
                'Invalid refresh token provided'
            );
            expect(response.statusCode).toBe(400);
        }
    );

    test(
        'Registration of a new Admin User (running this as an admin) ' +
            `${prefixURL}/register_admin_user`,
        async () => {
            const response = await request(app)
                .post(`${prefixURL}/register_admin_user`)
                .set({ 'Content-Type': 'application/json' })
                .set({ Authorization: `Bearer ${adminAccessToken}` })
                .send({
                    name: 'New Admin Name',
                    email: 'NewAdminEmail@wind.gr',
                    password: 'NewAdminPassword123',
                });
            expect(response.statusCode).toBe(201);
        }
    );
});
