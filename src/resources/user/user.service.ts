import UserModel from '@/resources/user/user.model';
import token from '@/utils/token';
import {
    Token,
    AccessTokenAndRefreshToken,
} from '@/utils/interfaces/token.interface';
import jwt from 'jsonwebtoken';

class UserService {
    private user = UserModel;

    /**
     * Register a new user
     */
    public async register(
        name: string,
        email: string,
        password: string,
        role: string
    ): Promise<AccessTokenAndRefreshToken | Error> {
        try {
            const user = await this.user.create({
                name,
                email,
                password,
                role,
            });

            const accessToken = token.createAccessToken(user);
            const refreshToken = token.createRefreshToken(user);

            await user.pushRefreshToken(refreshToken);

            return {
                accessToken,
                refreshToken,
            };
        } catch (error: any) {
            throw new Error(error);
        }
    }

    /**
     * Attempt to login a user
     */
    public async login(
        email: string,
        password: string
    ): Promise<AccessTokenAndRefreshToken | Error> {
        try {
            const user = await this.user.findOne({ email });

            if (!user) {
                throw new Error('Unable to find user with that Email address');
            }

            if (await user.isValidPassword(password)) {
                const accessToken = token.createAccessToken(user);
                const refreshToken = token.createRefreshToken(user);

                await user.pushRefreshToken(refreshToken);

                return {
                    accessToken,
                    refreshToken,
                };
            } else {
                throw new Error('Wrong credentials given');
            }
        } catch (error) {
            throw new Error('Unable to login user');
        }
    }

    public async requestNewAccessToken(
        refreshToken: string
    ): Promise<string | Error> {
        try {
            let accessToken = '';
            const payload = await token.verifyRefreshToken(refreshToken);
            if (!(payload instanceof jwt.JsonWebTokenError)) {
                const user = await this.user.findOne({
                    _id: payload.id,
                    refreshTokens: refreshToken,
                });

                if (user) {
                    accessToken = token.createAccessToken(user);
                } else {
                    throw new Error('Invalid refresh token provided 2');
                }
            }
            return accessToken;
        } catch (error) {
            throw new Error('Invalid refresh token provided');
        }
    }
}

export default UserService;
