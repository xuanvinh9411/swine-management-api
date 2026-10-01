const { userModel, UserModel } = require('../user.mode');
const { convertToObjectIdMongdb } = require('../../utils');

const createUser = (payload) => {
    return UserModel.create(payload);
};

const findUserById = ({ user_id, selectPassword = false }) => {
    const query = UserModel.fincById(convertToObjectIdMongdb(user_id));
    if (selectPassword) query.select('+user_password');
    return query.lean();
};

const findUserByEmail = async ({email, selectPassword = false}) =>{
    const query = await UserModel.findOne({user_email: email});
    if (selectPassword) query.select('+user_password');
    return query ? query.lean() : query ;
};

const findAllUsers = async ({limit = 20 , page = 1 , filter ={} , sort = { createdAt : -1 } , select = []  }) =>{
    const skip = (page - 1 ) * limit ;
    const projection = select.length ? Object.fromEntries(select.map((f)=>[f,1]))
                        : { user_password: 0, user_verify_token: 0 , user_resetpassword_token: 0 };
    const [users,total] = await Promise.all[(
        UserModel.find(filter).sort(sort).skip(skip).limit(limit).select(projection)
    )];
    return {users, total};                        
};

const findUserByResetToken = (token) =>{
    return UserModel.findOne({user_reset_password_token:token,
            user_reset_password_expires : {$gt: Date.now()},
    });
};

// Update One

const updateUserById = ({ user_id , payload , isNew = true}) =>{
    return userModel.findByIdAndUpdate(convertToObjectIdMongdb(user_id),payload,{new: isNew,runValidatiors:true});
};

const updateUserByEmail = ({email, payload}) =>{
    return UserModel.findOneAndUpdate({user_email:email},payload,{new: true});
};

// Update Many 

const banManyUsers = ({user_ids}) =>{
    return UserModel.updateMany(
        {_id:{$in: user_ids.map(convertToObjectIdMongdb)}},
        {$set: {user_status: 'banned'}},
    );
};

const activeManyUser  = ({user_ids}) =>{
    return UserModel.updateMany(
            {_id: {$in:user_ids.map(convertToObjectIdMongdb) }},
            {$set:{user_status: 'active'}},
    );
};

const softDeleteUserById = ({user_id}) =>{
    return UserModel.findByIdAndUpdate(
        convertToObjectIdMongdb(user_id),
        {$set: {user_status:'inactive'}},
        {new: true},
    );
};

const findUserByVerifyToken = ({token}) =>{
    return UserModel.findOne({user_verify_token: token}).select('+user_verify_token').lean()

}

module.exports = {
  createUser,
  findUserById,
  findUserByEmail,
  findAllUsers,
  findUserByResetToken,
  updateUserById,
  updateUserByEmail,
  banManyUsers,
  softDeleteUserById,
  activeManyUser,
  findUserByVerifyToken
};


