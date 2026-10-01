const { ROLES, PERMISSIONS, ROLE_PERMISSIONS } = require('../models/user.mode');
const { ForbiddenError, AuthFailureError} = require('../core/error.response');

/**
 * Check Role - use Admin
 * @example router.get('/', checkRole(ROLES.ADMIN), ...)
 */
const checkRole = (...allowedRoles) =>{
    return (req, res, next) =>{
        const user = req.user
        if(!user) throw new AuthFailureError('Authentication required');

        if(!allowedRoles.includes(user.user_role))
            throw new ForbiddenError(`Required Role: ${allowedRoles.join(' | ')}`)
        next()
    }
}

/**
 * Check Permission
 * @example router.delete('/', checkPermission(PerMission.DELETE_ANY_USER),...)
 */
const checkPermission = (...requiredPerMissions) =>{
    return (req, res, next) => {
         const user = req.user
        if(!user) throw new AuthFailureError('Authentication required');
    }
}