const UserService = require('../services/user.service')
const { SuccessReponse, CREATED } = require('../core/success.response');

class UserController {
    // Auth

    register = async (req, res, next) => {
        new CREATED({
            message: 'Registratrion successful, please verify your email',
            metadata: await UserService.register(req.body),
        })
    }

    verifyemail = async (req, res, next) => {
        new SuccessReponse({
            message: 'VerifyEmaiil success!',
            metadata: await UserService.verifyEmail({ token: req.params.token })
        })
    }

    getOwnProfile = async (req, res, next) => {
        new SuccessReponse({
            message: 'Get Profile success',
            metadata: await UserService.getProfile({ user_id: req.user._id })
        })
    }

    updateOwnProfile = async (req, res, next) => {
        new SuccessReponse({
            message: 'Profile Update',
            metadata: await UserService.updateOwnProfile({
                user_id: req.user._id,
                payload: req.body
            })
        })
    }

    changePassword = async (req, res, next) => {
        new SuccessReponse({
            message: 'Password changed successfully',
            metadata: await UserService.changePassword({
                user_id: req.user._id,
                current_password: req.body.current_password,
                new_password: req.body.new_password
            })
        })
    }

    forgotPassword = async (req, res, next) => {
        new SuccessReponse({
            message: 'Reset password email sent',
            metadata: await UserService.forgotPassword({
                email: req.body.email
            })
        })
    }

    resetPassword = async (req, res, next) => {
        new SuccessReponse({
            message: 'Password reset successfully',
            metadata: await UserService.resetPassword({
                token: req.params.token,
                new_password: req.body.new_password
            })
        })
    }

    deleteOwnAccount = async (req, res, next) => {
        new SuccessReponse({
            message: 'Account Delete',
            metadata: await UserService.deleteOWnAccount({
                user_id: req.user._id,
                password: req.body.password
            })
        })
    }

}

module.exports = new  UserController()