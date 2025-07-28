const User = require('../models/User');
const Role = require('../models/Role');

const authorize = (permission) => {
    return async (req, res, next) => {
        try {
            const userId = req.user.id;
            const user = await User.findById(userId).populate('roles');

            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            const hasPermission = user.roles.some(
                (role) =>
                    role.permissions.includes('*') ||
                    role.permissions.includes(permission) ||
                    role.permissions.includes(`${permission}:*`)
            );

            if (!hasPermission) {
                return res
                    .status(403)
                    .json({
                        message:
                            'Forbidden: You do not have permission to perform this action.',
                    });
            }

            next(); // Proceed to the next middleware or route handler - Procèder à la prochaine middleware ou gestionnaire de route
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Internal server error' });
        }
    };
};

module.exports = authorize;
