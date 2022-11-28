//
// const request = require('supertest');
// const jwt = require('jsonwebtoken');
// const app = require('../src/app');
// import 'dotenv/config';

// const prefixURL = '/users';

// describe('Authentication Tests', () => {
//     test('Not successful login 1', async () => {
//         const response = await request(app).post(`${prefixURL}/login`);

//         expect(response.statusCode).toBe(400);
//     });
// });

import { describe, expect, test } from '@jest/globals';
const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../src/app');

require('module-alias-jest/register');

describe('sum module', () => {
    test('adds 1 + 2 to equal 3', () => {
        expect(1 + 2).toBe(3);
    });
});
