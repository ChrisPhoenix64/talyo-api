const Team = require('../models/Team');
const User = require('../models/User');

// GET /api/teams/:teamId/members - Get all team members //* Récupérer tous les membres de l'équipe
exports.getAllTeamMembers = async (req, res) => {
    try {
        const team = await Team.findById(req.params.teamId).populate(
            'members.user',
            'firstName lastName email role'
        );

        if (!team) {
            return res.status(404).json({ message: 'Team not found' });
        }

        res.json(team.members);
    } catch (error) {
        res.status(500).json({
            message: 'Server error',
            error: error.message,
        });
    }
};

// POST /api/teams/:teamId/members - Add a member to the team //* Ajouter un membre à l'équipe
exports.addTeamMember = async (req, res) => {
    const { userId } = req.body;
    try {
        const team = await Team.findById(req.params.teamId);
        if (!team) {
            return res.status(404).json({ message: 'Team not found' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const alreadyInTeam = team.members.find(
            (member) => member.user.toString() === userId
        );

        if (alreadyInTeam) {
            return res.status(400).json({
                message: 'User is already a member of the team',
            });
        }

        team.members.push({ user: userId, role: 'member' }); // Assuming role is 'member' by default //* Assumé que le rôle est 'membre' par défaut

        // Include audit information //* Inclure les informations d'audit
        team._auditUser = req.user._id; // Assuming req.user contains the authenticated user's info //* Supposons que req.user contienne les informations de l'utilisateur authentifié

        await team.save();

        res.status(201).json({
            message: 'Member added successfully',
            member: user,
        });
    } catch (error) {
        res.status(500).json({
            message: 'Server error',
            error: error.message,
        });
    }
};

// PUT /api/teams/:teamId/members/:userId - Update a member's role in the team //* Mettre à jour le rôle d'un membre de l'équipe
exports.updateTeamMemberRole = async (req, res) => {
    const { userId } = req.params;
    const { role } = req.body;

    try {
        const team = await Team.findById(req.params.teamId);
        if (!team) {
            return res.status(404).json({ message: 'Team not found' });
        }

        const member = team.members.find(
            (member) => member.user.toString() === userId
        );

        if (!member) {
            return res
                .status(404)
                .json({ message: 'User is not a member of the team' });
        }

        member.role = role; // Assuming member is an object with a role property //* Assumé que le membre est un objet avec une propriété de rôle

        // Include audit information //* Inclure les informations d'audit
        team._auditUser = req.user._id; // Assuming req.user contains the authenticated user's info //* Supposons que req.user contienne les informations de l'utilisateur authentifié

        await team.save();

        res.json({
            message: 'Member role updated successfully',
            team,
        });
    } catch (error) {
        res.status(500).json({
            message: 'Internal server error',
            error: error.message,
        });
    }
};

// DELETE /api/teams/:teamId/members/:userId - Remove a member from the team //* Supprimer un membre de l'équipe
exports.removeTeamMember = async (req, res) => {
    const { userId } = req.params;
    try {
        const team = await Team.findById(req.params.teamId);
        if (!team) {
            return res.status(404).json({ message: 'Team not found' });
        }

        const initialLength = team.members.length;
        team.members = team.members.filter(
            (member) => member.user.toString() !== userId
        );

        if (team.members.length === initialLength) {
            return res.status(404).json({
                message: 'User is not a member of the team',
            });
        }

        // Include audit information //* Inclure les informations d'audit
        team._auditUser = req.user._id; // Assuming req.user contains the authenticated user's info //* Supposons que req.user contienne les informations de l'utilisateur authentifié

        await team.save();

        res.json({ message: 'Member removed successfully' });
    } catch (error) {
        res.status(500).json({
            message: 'Server error',
            error: error.message,
        });
    }
};
