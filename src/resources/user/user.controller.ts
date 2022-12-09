import { Router, Request, Response, NextFunction } from 'express';
import Controller from '@/utils/interfaces/controller.interface';
import HttpException from '@/utils/exceptions/http.exception';
import validationMiddleware from '@/middleware/validation.middleware';
import validate from '@/resources/user/user.validation';
import UserService from '@/resources/user/user.service';
import authenticated from '@/middleware/authenticated.middleware';

class UserController implements Controller {
    public path = '/users';
    public router = Router();
    private UserService = new UserService();

    constructor() {
        this.initialiseRoutes();
    }

    private initialiseRoutes(): void {
        this.router.post(
            `${this.path}/register`,
            validationMiddleware(validate.register),
            this.register
        );

        this.router.post(
            `${this.path}/login`,
            validationMiddleware(validate.login),
            this.login
        );

        this.router.post(
            `${this.path}/refresh_access_token`,
            validationMiddleware(validate.refreshAccessToken),
            this.refreshAccessToken
        );

        this.router.get(`${this.path}/me`, authenticated, this.getUser);
    }

    private register = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<Response | void> => {
        try {
            const { name, email, password } = req.body;

            const bothTokens = await this.UserService.register(
                name,
                email,
                password,
                'user'
            );

            res.status(201).json(bothTokens);
        } catch (error: any) {
            next(new HttpException(400, error.message));
        }
    };

    private login = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<Response | void> => {
        try {
            const { email, password } = req.body;

            const bothTokens = await this.UserService.login(email, password);

            res.status(200).json(bothTokens);
        } catch (error: any) {
            next(new HttpException(400, error.message));
        }
    };

    private refreshAccessToken = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<Response | void> => {
        try {
            const { refreshToken } = req.body;

            const accessToken = await this.UserService.requestNewAccessToken(
                refreshToken
            );

            res.status(200).json({ accessToken });
        } catch (error: any) {
            next(new HttpException(400, error.message));
        }
    };

    private getUser = (
        req: Request,
        res: Response,
        next: NextFunction
    ): Response | void => {
        if (!req.user) {
            return next(new HttpException(404, 'Not logged in user'));
        }

        res.status(200).json({ user: req.user });
    };
}

export default UserController;
