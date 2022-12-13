import { Schema, model } from 'mongoose';
import bcrypt from 'bcrypt';
import User from '@/resources/user/user.interface';

const UserSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        password: {
            type: String,
        },
        role: {
            type: String,
            required: true,
        },
        refreshTokens: [
            {
                type: String,
            },
        ],
    },
    {
        timestamps: true,
    }
);

UserSchema.pre<User>('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }
    const hash = await bcrypt.hash(this.password, 10);
    this.password = hash;
    next();
});

UserSchema.methods.isValidPassword = async function (
    password: string
): Promise<Error | boolean> {
    return await bcrypt.compare(password, this.password);
};

UserSchema.methods.pushRefreshToken = async function (
    refreshToken: string
): Promise<void> {
    const numberOfRefreshTokensSaved =
        process.env.JWT_NUMBER_OF_REFRESH_TOKENS_SAVED;

    if (numberOfRefreshTokensSaved != undefined) {
        if (!this.refreshTokens.includes(refreshToken)) {
            await this.refreshTokens.push(refreshToken);
        }

        // Remove first element in order to keep only the last X refresh tokens
        if (this.refreshTokens.length > numberOfRefreshTokensSaved) {
            await this.refreshTokens.shift();
        }
        this.save();
    }
};

export default model<User>('User', UserSchema);
