'use strict';

const mongoose = require('mongoose');
const { Schema } = mongoose;

const DOCUMENT_NAME = 'User';
const COLLECTION_NAME = 'users';


const ROLES = {
    USER: 'user',
    MODERATOR: 'moderator',
    ADMIN: 'admin',
    SUPPER_ADMIN: 'supper_admin'
};

const PERMISSIONS = {
    // Profile
    READ_OWN_PROFILE: 'read:own_profile',
    UPDATE_OWN_PROFILE: 'update:own_profile',
    DELETE_OWN_PROFILE: 'delete:own_profile',

    //Usser management (admin)
    READ_ANY_USER: 'read:any_user',
    UPDATE_ANY_USER: 'update:any_user',
    DELETE_ANY_USER: 'delete:any_user',
    BAN_USER: 'ban:user',

    //Role Management (supper_admin)
    MANAGE_ROLES: 'manage:roles',
    MANAGE_ADMIN: 'manage:admins',

};

const ROLE_PERMISSIONS = {
    [ROLES.USER]: [
        PERMISSIONS.READ_OWN_PROFILE,
        PERMISSIONS.UPDATE_OWN_PROFILE,
        PERMISSIONS.DELETE_OWN_PROFILE,
    ],
    [ROLES.MODERATOR]: [
        PERMISSIONS.READ_ANY_USER,
        PERMISSIONS.UPDATE_ANY_USER,
        PERMISSIONS.DELETE_ANY_USER,
        PERMISSIONS.BAN_USER,
    ],
    [ROLES.ADMIN]: [
        PERMISSIONS.READ_OWN_PROFILE,
        PERMISSIONS.UPDATE_OWN_PROFILE,
        PERMISSIONS.UPDATE_ANY_USER,
        PERMISSIONS.DELETE_ANY_USER,
        PERMISSIONS.BAN_USER,
    ],
    [ROLES.ADMIN]: Object.values(PERMISSIONS)

};
const STATUS = ['active', 'inactive', 'banned', 'pending_verify']
// Schema

const userSchema = new mongoose.Schema({
    user_name: {
        type: String,
        required: true,
        trim: true,
        minlength: 5,
        maxlength: 100,
    },
    user_email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    user_password: {
        type: String,
        required: true,
        select: false,
    },
    user_avatar: {
        type: String,
        default: '',
    },
    user_phone: {
        type: String,
        default: '',
    },
    user_date_of_birth: {
        type: Date,
    },
    user_role: {
        type: String,
        enum: Object.values(ROLES),
        default: ROLES.USER,
    },
    user_permissions: {
        type: [String],
        default: [],
    },
    user_status: {
        type: String,
        enum: STATUS,
        default: 'pending_verify',
    },
    user_is_verified: {
        type: Boolean,
        default: false,
    },
    user_verify_token: {
        type: String,
        select: false,
    },
    user_reset_password_token: {
        type: String,
        select: false,
    },
    user_reset_password_expires: {
        type: Date,
        select: false,
    },
    user_last_login: {
        tyde: Date,
    },
    user_login_count: {
        type: Number,
        default: 0,
    },
    user_address: {
        street: String,
        city: String,
        country: String,
    },
    user_metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: {},
    },
}, {
    timestamps: true,
    collection: COLLECTION_NAME,
},
);

userSchema.index({ user_email: 1 });
userSchema.index({ user_role: 1 });
userSchema.index({ user_status: 1 });

userSchema.methods.getAllPermissions = function () {
    const rolePermission = ROLE_PERMISSIONS[this.user_role] || [];
    return [...new Set([...rolePermission, ...this.user_permision])];
};

userSchema.methods.hasPerMission = function (permission) {
    return this.getAllPermissions.includes(permission);
};
userSchema.methods.hasRole = function (...roles) {
    return roles.includes(this.user_role);
};
userSchema.methods.toJSON = function () {
    const obj = this.toObject();
    delete obj.user_password;
    delete obj.user_verify_token;
    delete obj.user_reset_password_token;
    delete obj.user_reset_password_expires;
    return obj;
};

module.exports = {
    ROLES,
    PERMISSIONS,
    ROLE_PERMISSIONS,
    UserModel : mongoose.model(DOCUMENT_NAME,userSchema),
};

