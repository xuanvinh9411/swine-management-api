const UserService = require('../services/user.service')
const { SuccessResponse, CREATED, OK } = require('../core/success.response');

class UserController {
    // Auth

    register = async (req, res, next) => {
        return new CREATED({
            message: 'Registratrion successful, please verify your email',
            metadata: await UserService.register(req.body),
        }).send(res)
    }

    verifyemail = async (req, res, next) => {
        new SuccessResponse({
            message: 'VerifyEmaiil success!',
            metadata: await UserService.verifyEmail({ token: req.params.token })
        }).send(res)
    }

    login = async (req, res, next) => {
        new OK({
            message: 'Login success',
            metadata: await UserService.login(req.body),
        }).send(res);
}

    getOwnProfile = async (req, res, next) => {
        new SuccessResponse({
            message: 'Get Profile success',
            metadata: await UserService.getProfile({ user_id: req.user._id })
        }).send(res)
    }

    updateOwnProfile = async (req, res, next) => {
        new SuccessResponse({
            message: 'Profile Update',
            metadata: await UserService.updateOwnProfile({
                user_id: req.user._id,
                payload: req.body
            })
        }).send(res)
    }

    changePassword = async (req, res, next) => {
        new SuccessResponse({
            message: 'Password changed successfully',
            metadata: await UserService.changePassword({
                user_id: req.user._id,
                current_password: req.body.current_password,
                new_password: req.body.new_password
            })
        }).send(res)
    }

    forgotPassword = async (req, res, next) => {
        new SuccessResponse({
            message: 'Reset password email sent',
            metadata: await UserService.forgotPassword({
                email: req.body.email
            })
        }).send(res)
    }

    resetPassword = async (req, res, next) => {
        new SuccessResponse({
            message: 'Password reset successfully',
            metadata: await UserService.resetPassword({
                token: req.params.token,
                new_password: req.body.new_password
            })
        }).send(res)
    }

    deleteOwnAccount = async (req, res, next) => {
        new SuccessResponse({
            message: 'Account Delete',
            metadata: await UserService.deleteOWnAccount({
                user_id: req.user._id,
                password: req.body.password
            })
        }).send(res)
    }

}

module.exports = new  UserController()