const bcrypt = require('bcryptjs');
const crypto = require('crypto');


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
} = require('../models/repositories/user.repo');

const {ROLES, PERMISSIONS, ROLE_PERMISSIONS }= require('../models/user.mode');

const {BadRequestError, NotFoundError , ForbiddenError, ConflictRquestError} = require('../core/error.response');

const { removeUndefinedObject, generateSlug } = require('../utils/index');

class UserService {

    static register = async({name,email,password}) =>{
        const existed = await findUserByEmail({email});
        if(existed) throw new ConflictRquestError('Email already registered');

        const hashed = await bcrypt.hash(password,12);
        const slug = await generateSlug(name);
        const verifyToken = crypto.randomBytes(32).toString('hex');

        const user = await createUser({
            user_name: name,
            user_email : email,
            user_password: hashed,
            user_slug: slug,
            user_verify_token: verifyToken,
            user_status : 'pending_verify',
        });
        return {user,verifyToken};
    };
}