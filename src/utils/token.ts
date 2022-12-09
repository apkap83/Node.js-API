import jwt from 'jsonwebtoken';
import User from '@/resources/user/user.interface';
import { Token } from '@/utils/interfaces/token.interface';

export const createAccessToken = (user: User): string => {
    return jwt.sign(
        { id: user._id },
        process.env.JWT_ACCESS_TOKEN_SECRET as jwt.Secret,
        {
            expiresIn: process.env.JWT_ACCESS_TOKEN_TIMEOUT,
        }
    );
};

export const createRefreshToken = (user: User): string => {
    return jwt.sign(
        { id: user._id },
        process.env.JWT_REFRESH_TOKEN_SECRET as jwt.Secret,
        {
            expiresIn: process.env.JWT_REFRESH_TOKEN_TIMEOUT,
        }
    );
};

export const verifyAccessToken = async (
    token: string
): Promise<jwt.VerifyErrors | Token> => {
    return new Promise((resolve, reject) => {
        jwt.verify(
            token,
            process.env.JWT_ACCESS_TOKEN_SECRET as jwt.Secret,
            (err, payload) => {
                if (err) return reject(err);

                resolve(payload as Token);
            }
        );
    });
};

export const verifyRefreshToken = async (
    token: string
): Promise<jwt.VerifyErrors | Token> => {
    return new Promise((resolve, reject) => {
        jwt.verify(
            token,
            process.env.JWT_REFRESH_TOKEN_SECRET as jwt.Secret,
            (err, payload) => {
                if (err) return reject(err);

                resolve(payload as Token);
            }
        );
    });
};

export default {
    createAccessToken,
    createRefreshToken,
    verifyAccessToken,
    verifyRefreshToken,
};
