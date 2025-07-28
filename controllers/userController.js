const User = require('../models/User');
const Role = require('../models/Role');

// GET /api/users
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find().populate('roles', 'name');
        res.status(200).json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// GET /api/users/:userId
exports.getUserById = async (req, res) => {
    const { userId } = req.params;

    try {
        const user = await User.findById(userId).populate('roles', 'name');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// GET /api/users/:userId/permissions
exports.getUserPermissions = async (req, res) => {
    const { userId } = req.params;

    try {
        const user = await User.findById(userId).populate('roles', 'permissions');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const permissions = new Set();
        user.roles.forEach((role) => {
            if (role.permissions.includes('*')) {
                permissions.clear(); // If any role has all permissions, clear the set - Si un rôle a toutes les permissions, vider l'ensemble
                permissions.add('*'); // If any role has all permissions, return '*' - Si un rôle a toutes les permissions, retourner '*'
                return; // No need to check further - Pas besoin de vérifier plus loin
            }
            role.permissions.forEach((permission) => {
                permissions.add(permission);
            });
        });

        res.status(200).json(Array.from(permissions));
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// POST /api/users
exports.createUser = async (req, res) => {
    const { firstName, lastName, email, password, roles } = req.body;

    try {
        // Normalize roles to lowercase
        const normalizedRoles = roles.map((role) => role.toLowerCase());

        // Find the roles by their names
        const roleDocuments = await Role.find({
            name: { $in: normalizedRoles },
        });

        if (roleDocuments.length !== roles.length) {
            return res
                .status(400)
                .json({ message: 'One or more roles do not exist' });
        }

        // Create a new user
        const newUser = new User({
            firstName,
            lastName,
            email,
            password,
            roles: roleDocuments.map((role) => role._id),
        });

        await newUser.save();
        res.status(201).json({
            message: 'User created successfully',
            user: newUser,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// PUT /api/users/:userId
exports.updateUser = async (req, res) => {
    const { userId } = req.params;
    const { firstName, lastName, email } = req.body;

    try {
        // Find the user by ID
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update user fields
        user.firstName = firstName || user.firstName;
        user.lastName = lastName || user.lastName;
        user.email = email || user.email;

        await user.save();
        res.status(200).json({
            message: 'User updated successfully',
            user,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// PATCH /api/users/:userId/roles
exports.updateUserRoles = async (req, res) => {
    const { userId } = req.params;
    const { roles } = req.body;

    try {
        // Find the user by ID
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Find the roles by their names
        const normalizedRoles = roles.map((role) => role.toLowerCase());
        const roleDocuments = await Role.find({
            name: { $in: normalizedRoles },
        });
        if (roleDocuments.length !== roles.length) {
            return res
                .status(400)
                .json({ message: 'One or more roles do not exist' });
        }

        // Update the user's roles
        user.roles = roleDocuments.map((role) => role._id);
        await user.save();

        res.status(200).json({
            message: 'User roles updated successfully',
            user,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// DELETE /api/users/:userId
exports.desativateUser = async (req, res) => {
    const { userId } = req.params;

    try {
        // Find the user by ID
        const user = await User.findByIdAndUpdate(
            req.params.userId,
            { isActive: false },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({
            message: 'User deactivated successfully',
            user,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// DELETE /api/users/:userId/roles/:roleId
exports.removeUserRole = async (req, res) => {
    const { userId, roleId } = req.params;

    try {
        // Find the user by ID
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Remove the role from the user's roles
        user.roles = user.roles.filter((role) => role.toString() !== roleId);
        await user.save();

        res.status(200).json({
            message: 'Role removed from user successfully',
            user,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// DELETE /api/users/:userId
exports.deleteUser = async (req, res) => {
    const { userId } = req.params;

    try {
        // Find the user by ID and delete
        const user = await User.findByIdAndDelete(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({
            message: 'User deleted successfully',
            user,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
