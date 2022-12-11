import { Document } from 'mongoose';

export default interface User extends Document {
    email: string;
    name: string;
    password: string;
    role: string;
    refreshTokens: string[];
    isValidPassword(password: string): Promise<Error | boolean>;
    pushRefreshToken(refreshToken: string): Promise<Error | string>;
}

export interface UserResponse {
    name: string;
    email: string;
    role: string;
}
