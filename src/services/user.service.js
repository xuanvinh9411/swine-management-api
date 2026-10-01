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
  findUserByVerifyToken, 
} = require('../models/repositories/user.repo');

const {ROLES, PERMISSIONS, ROLE_PERMISSIONS }= require('../models/user.mode');

const {BadRequestError, NotFoundError , ForbiddenError, ConflictRquestError} = require('../core/error.response');

const { removeUndefinedObject, generateSlug } = require('../utils/index');

class UserService {

    static register = async({name,email,password}) =>{
        const existed = await findUserByEmail({email});
        console.log(`existed`,existed)
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

        //  RODO: send email
        return {user,verifyToken};
    };

    static verifyEmail = async({token}) =>{
        const user = await findUserByVerifyToken({token});
         if(!user) throw new NotFoundError('User not found');  

         await updateUserById({
                    user_id: user._id,
                    payload: {
                        $set: {user_is_verified : true, user_status: 'active'},
                        $unset: {user_verify_token : 1}
                    },
                })
          return {verified : true}
    }
    static getProfile = async ({user_id}) =>{
      const user = await findUserById({user_id}); 
      if(!user) throw new NotFoundError('User not found'); 
      return user;  
    };

    static updateOwnProfile = async({user_id,payload}) => {
        const BLOCKED_FIELDS =  ['user_role','user_status' , 'user_permission' , 'user_password'];
        BLOCKED_FIELDS.forEach(f => delete payload[f]);

        const clean = removeUndefinedObject(payload);
        if(!Object.keys(clean).length) throw new BadRequestError('No vaild fields to update');

        const update = await updateUserById({user_id, payload:{$set : clean}});
        if(!update) throw new NotFoundError('User not found');
        return update;
    };

    static changePassword = async({user_id, current_password, new_password}) =>{
        const user = await findUserById({user_id});
        if(!user) throw new NotFoundError('User Not Found');

        const isMatch = await bcrypt.compare(current_password,user.password);
        if(!isMatch) throw new BadRequestError('Bad request change password')
        const hashed = await bcrypt.hash(new_password,12);
        
        await updateUserById({user_id,
            payload : {
                $set: {
                    user_password : hashed,
                },
            },
        });
    };

    static forgotPassword = async({email}) =>{
        const user = await findUserByEmail({email});
        if(!user) throw new NotFoundError('Email Not Found');

        const resetToken = crypto.randomBytes(32).toString('hex');
        const expires = Date.now() + 15 *  60 * 1000;

        await updateUserById({
            user_id: user.user_id,
            payload:{
                $set: {
                    user_reset_password_token: resetToken,
                    user_reset_password: expires, 
                },
            },
        });
        //send email reset
        return {resetToken};
    };

    static resetPassword = async ({token, new_password}) =>{
        const user = await findUserByResetToken({token});
         if(!user) throw new NotFoundError('Email Not Found');

         const hashed = await bcrypt.hash(new_password,12);
         await updateUserById({
            user_id : user._id,
            payload : {
                $set:  {user_password : hashed},
                $unset:{user_reset_password_token:1,user_reset_password_expires: 1},
            },
        });
    };

    static deleteOWnAccount = async({user_id,password}) =>{
         const user = await findUserById({user_id});
        if(!user) throw new NotFoundError('User Not Found');
        
        const isMacth = await bcrypt.compare(password,user.user_password);
        if(!isMacth) throw new BadRequestError('Password is incorrect');
        await softDeleteUserById({user_id}) 
        
        return {deleted : true}
    }
        
};

module.exports = UserService