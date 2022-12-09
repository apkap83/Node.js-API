import { Schema } from 'mongoose';

interface Token extends Object {
    id: Schema.Types.ObjectId;
    expiresIn: number;
}

interface AccessTokenAndRefreshToken {
    accessToken: string;
    refreshToken: string;
}

export { Token, AccessTokenAndRefreshToken };
