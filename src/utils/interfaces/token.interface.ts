import { Schema } from 'mongoose';

interface Token extends Object {
    id: Schema.Types.ObjectId;
    name: string;
    role: string;
    exp: number;
}

interface AccessTokenAndRefreshToken {
    accessToken: string;
    refreshToken: string;
}

export { Token, AccessTokenAndRefreshToken };
