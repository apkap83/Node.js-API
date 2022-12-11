import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '@/utils/token';
import UserModel from '@/resources/user/user.model';
import { Token } from '@/utils/interfaces/token.interface';
import HttpException from '@/utils/exceptions/http.exception';
import jwt from 'jsonwebtoken';
import UserRoles from '@/utils/UserRoles';

async function authenticatedAdminMiddleware(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<Response | void> {
    const bearer = req.headers.authorization;

    if (!bearer || !bearer.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const accessToken = bearer.split('Bearer ')[1].trim();

    try {
        const payload: Token | jwt.JsonWebTokenError = await verifyAccessToken(
            accessToken
        );

        if (payload instanceof jwt.JsonWebTokenError) {
            return next(new HttpException(401, 'Unauthorized'));
        }
        if (payload.role !== UserRoles.Admin) {
            return next(new HttpException(403, 'Forbidden = Not Admin!'));
        }

        const user = await UserModel.findById(payload.id)
            .select('-password')
            .select('-refreshTokens')
            .select('-createdAt')
            .select('-updatedAt')
            .select('-__v')
            .exec();

        if (!user) {
            return next(new HttpException(401, 'Unauthorized'));
        }

        req.user = user;

        return next();
    } catch (error) {
        return next(new HttpException(401, 'Unauthorized'));
    }
}

export default authenticatedAdminMiddleware;
