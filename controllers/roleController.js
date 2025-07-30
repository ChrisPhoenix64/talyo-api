const Role = require('../models/Role');

const { roleSchema } = require('../validators/roleValidator');

// GET /api/roles - Get all roles - Récupérer tous les rôles
exports.getAllRoles = async (req, res) => {
    try {
        const roles = await Role.find();
        res.status(200).json(roles);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// GET /api/roles/:roleId - Get role by ID - Récupérer un rôle par ID
exports.getRoleById = async (req, res) => {
    const { roleId } = req.params;

    try {
        const role = await Role.findById(roleId);
        if (!role) {
            return res.status(404).json({ message: 'Role not found' });
        }

        res.status(200).json(role);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// POST /api/roles - Create a new role - Créer un nouveau rôle
exports.createRole = async (req, res) => {
    const { error } = roleSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }
    
    const { name, permissions } = req.body;

    if (!name || !permissions || !Array.isArray(permissions)) {
        return res
            .status(400)
            .json({ message: 'Name and permissions are required.' });
    }

    try {
        const existingRole = await Role.findOne({ name });
        if (existingRole) {
            return res
                .status(400)
                .json({ message: 'Role with this name already exists.' });
        }

        const newRole = new Role({ name, permissions });

        // Include audit information //* Inclure les informations d'audit
        newRole._auditUser = req.user._id;

        await newRole.save();
        res.status(201).json(newRole);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// PUT /api/roles/:roleId - Update a role - Mettre à jour un rôle
exports.updateRole = async (req, res) => {
    const { error } = roleSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }
    
    const { roleId } = req.params;
    const { name, permissions } = req.body;

    try {
        const role = await Role.findByIdAndUpdate(
            roleId,
            { name, permissions },
            { new: true }
        );

        if (!role) {
            return res.status(404).json({ message: 'Role not found' });
        }

        if (name) {
            role.name = name;
        }

        if (permissions && Array.isArray(permissions)) {
            role.permissions = permissions;
        }

        // Include audit information //* Inclure les informations d'audit
        role._auditUser = req.user._id;

        res.status(200).json({ message: 'Role updated', role });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// DELETE /api/roles/:roleId - Delete a role - Supprimer un rôle
exports.deleteRole = async (req, res) => {
    const { roleId } = req.params;

    try {
        const query = Role.findByIdAndDelete(roleId);
        
        // Include audit information //* Inclure les informations d'audit
        query._auditUser = req.user._id;

        const role = await query.exec();

        if (!role) {
            return res.status(404).json({ message: 'Role not found' });
        }

        const protectedRoles = ['admin', 'superadmin'];

        if (protectedRoles.includes(role.name.toLowerCase())) {
            return res.status(403).json({
                message: `Role "${role.name}" cannot be deleted`,
            });
        }

        res.status(200).json({ message: 'Role deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
