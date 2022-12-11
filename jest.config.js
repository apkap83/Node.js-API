/** @type {import('jest').Config} */
const aliases = require('module-alias-jest/register');

const config = {
    verbose: true,
    moduleNameMapper: aliases.jest,
    preset: 'ts-jest',
    testEnvironment: 'node',
    testPathIgnorePatterns: ['.d.ts', '.js'],
};

module.exports = config;
