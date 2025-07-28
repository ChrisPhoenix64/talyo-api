const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Role = require('../models/Role');

dotenv.config();

async function seedRoles() {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('✅ Connected to MongoDB');

        const roles = [
            {
                name: 'admin',
                permission: [
                    'project:create',
                    'project:read',
                    'project:update',
                    'project:delete',
                    'task:create',
                    'task:read',
                    'task:update',
                    'task:delete',
                    'user:read',
                    'user:create',
                    'user:update',
                    'user:delete',
                    'user:disable',
                    'user:role:update',
                    'role:create',
                    'role:read',
                    'role:update',
                    'role:delete',
                ],
            },
            {
                name: 'manager',
                permission: [
                    'project:create',
                    'project:read',
                    'project:update',
                    'task:create',
                    'task:read',
                    'task:update',
                    'user:read',
                ],
            },
            {
                name: 'member',
                permission: ['project:read', 'task:create', 'task:read'],
            },
            {
                name: 'superadmin',
                permission: ['*'], // All permissions
            },
        ];

        for (const roleData of roles) {
            const existingRole = await Role.findOne({ name: roleData.name });
            if (!existingRole) {
                const newRole = new Role(roleData);
                await newRole.save();
                console.log(`🟢 Role ${roleData.name} created successfully`);
            } else {
                console.log(`🟡 Role ${roleData.name} already exists`);
            }
        }
    } catch (err) {
        console.error('❌ Error seeding roles:', err);
    } finally {
        if (mongoose.connection.readyState) {
            await mongoose.disconnect();
            console.log('✅ Disconnected from MongoDB');
        }
    }
}

seedRoles()
    .then(() => console.log('✅ Role seeding completed'))
    .catch((err) => console.error('❌ Error during role seeding:', err));
