const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const slugify = require('slugify');
const jwt = require('jsonwebtoken');

const {
    createUser,
    findUserById,
    findUserByEmail,
    findAllUsers,
    findUserByResetToken,
    updateUserById,
    updateUserByEmail,
    banManyUsers,
    softDeleteUserById,
    findUserByVerifyToken,
    findUserBySlug
} = require('../models/repositories/user.repo');

const { ROLES, PERMISSIONS, ROLE_PERMISSIONS } = require('../models/user.mode');

const { BadRequestError, NotFoundError, ForbiddenError, ConflictRquestError, AuthFailureError } = require('../core/error.response');

const { removeUndefinedObject, generateSlug } = require('../utils/index');

class UserService {

    static register = async ({ name, email, password }) => {
        const existed = await findUserByEmail({ email });
        if (existed) throw new ConflictRquestError('Email already registered');

        const hashed = await bcrypt.hash(password, 12);
        const slug = await this.generateSlugUser(name);
        const verifyToken = crypto.randomBytes(32).toString('hex');
        const payload = {
            user_name: name,
            user_email: email,
            user_password: hashed,
            user_slug: slug,
            user_verify_token: verifyToken,
            user_status: 'pending_verify',
        }
        const user = await createUser(payload);

        //  RODO: send email
        return { user, verifyToken };
    };

    static verifyEmail = async ({ token }) => {
        const user = await findUserByVerifyToken({ token });
        if (!user) throw new NotFoundError('User not found');

        await updateUserById({
            user_id: user._id,
            payload: {
                $set: { user_is_verified: true, user_status: 'active' },
                $unset: { user_verify_token: 1 }
            },
        })
        return { verified: true }
    }

    static login = async ({ email, password }) => {
        if (!email || !password) throw new BadRequestError('Email and password are require !');
        const user = await findUserByEmail({ email })
        if (!user) throw new Error('Email not found user !')

        const isMatch = bcrypt.compare(password, user.password)
        if (!isMatch) throw new AuthFailureError('password is not match!')

        if (user.user_status === 'pending_verify') throw new ForbiddenError('pls verify email !')

        const accessToken = jwt.sign({ user_id: user._id, role: user.user_role },
            process.env.JWT_ACCESS_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
        )
        await updateUserByEmail({
            email,
            payload: {
                $set: { user_last_login: new Date() },
                $inc: { user_login_count: 1 }
            }
        })

        const { user_password, ...safeUser } = user
        return { user: safeUser, accessToken }
    }

    static getProfile = async ({ user_id }) => {
        const user = await findUserById({ user_id });
        if (!user) throw new NotFoundError('User not found');
        return user;
    };

    static updateOwnProfile = async ({ user_id, payload }) => {
        const BLOCKED_FIELDS = ['user_role', 'user_status', 'user_permission', 'user_password'];
        BLOCKED_FIELDS.forEach(f => delete payload[f]);

        const clean = removeUndefinedObject(payload);
        if (!Object.keys(clean).length) throw new BadRequestError('No vaild fields to update');

        const update = await updateUserById({ user_id, payload: { $set: clean } });
        if (!update) throw new NotFoundError('User not found');
        return update;
    };

    static changePassword = async ({ user_id, current_password, new_password }) => {
        const user = await findUserById({ user_id });
        if (!user) throw new NotFoundError('User Not Found');

        const isMatch = await bcrypt.compare(current_password, user.password);
        if (!isMatch) throw new BadRequestError('Bad request change password')
        const hashed = await bcrypt.hash(new_password, 12);

        await updateUserById({
            user_id,
            payload: {
                $set: {
                    user_password: hashed,
                },
            },
        });
    };

    static forgotPassword = async ({ email }) => {
        const user = await findUserByEmail({ email });
        if (!user) throw new NotFoundError('Email Not Found');

        const resetToken = crypto.randomBytes(32).toString('hex');
        const expires = Date.now() + 15 * 60 * 1000;

        await updateUserById({
            user_id: user.user_id,
            payload: {
                $set: {
                    user_reset_password_token: resetToken,
                    user_reset_password: expires,
                },
            },
        });
        //send email reset
        return { resetToken };
    };

    static resetPassword = async ({ token, new_password }) => {
        const user = await findUserByResetToken({ token });
        if (!user) throw new NotFoundError('Email Not Found');

        const hashed = await bcrypt.hash(new_password, 12);
        await updateUserById({
            user_id: user._id,
            payload: {
                $set: { user_password: hashed },
                $unset: { user_reset_password_token: 1, user_reset_password_expires: 1 },
            },
        });
    };

    static deleteOWnAccount = async ({ user_id, password }) => {
        const user = await findUserById({ user_id });
        if (!user) throw new NotFoundError('User Not Found');

        const isMacth = await bcrypt.compare(password, user.user_password);
        if (!isMacth) throw new BadRequestError('Password is incorrect');
        await softDeleteUserById({ user_id })

        return { deleted: true }
    }


    /**
     * Generate unique slug từ name
     */
    static generateSlugUser = async (name) => {
        // Chuyển tiếng Việt → không dấu + lowercase + gạch ngang
        let slug = slugify(name, {
            lower: true,
            strict: true,   // bỏ ký tự đặc biệt
            locale: 'vi',   // hỗ trợ tiếng Việt
        });

        // Kiểm tra trùng trong DB
        const existed = await findUserBySlug({ slug });
        if (existed) {
            // Thêm random suffix nếu trùng
            const suffix = Math.random().toString(36).substring(2, 6); // vd: "x7k2"
            slug = `${slug}-${suffix}`;
        }

        return slug;
    };
};

module.exports = UserService