const Team = require('../models/Team');
const User = require('../models/User');

// GET /api/teams - Get all teams - Récupérer toutes les équipes
exports.getAllTeams = async (req, res) => {
    try {
        const teams = await Team.find()
            .populate('members.user', 'firstName lastName email')
            .populate('createdBy', 'firstName lastName email');
        res.status(200).json(teams);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// GET /api/teams/:teamId - Get team by ID - Récupérer une équipe par ID
exports.getTeamById = async (req, res) => {
    const { teamId } = req.params;

    try {
        const team = await Team.findById(teamId)
            .populate('members.user', 'firstName lastName email')
            .populate('createdBy', 'firstName lastName email');

        if (!team) {
            return res.status(404).json({ message: 'Team not found' });
        }

        res.status(200).json(team);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// POST /api/teams - Create a new team - Créer une nouvelle équipe
exports.createTeam = async (req, res) => {
    const { name, description, members } = req.body;

    if (!name || !members || members.length === 0) {
        return res
            .status(400)
            .json({ message: 'Name and members are required.' });
    }

    try {
        const newTeam = new Team({
            name,
            description,
            members: members.map((member) => ({
                user: member.user,
                role: member.role || 'member',
            })),
            createdBy: req.user._id,
        });

        await newTeam.save();
        res.status(201).json(newTeam);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// PUT /api/teams/:teamId - Update a team - Mettre à jour une équipe
exports.updateTeam = async (req, res) => {
    const { teamId } = req.params;
    const { name, description, members } = req.body;

    try {
        const team = await Team.findByIdAndUpdate(
            teamId,
            {
                name,
                description,
                members: members.map((member) => ({
                    user: member.user,
                    role: member.role || 'member',
                })),
            },
            { new: true }
        )
            .populate('members.user', 'firstName lastName email')
            .populate('createdBy', 'firstName lastName email');

        if (!team) {
            return res.status(404).json({ message: 'Team not found' });
        }

        res.status(200).json(team);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// DELETE /api/teams/:teamId - Delete a team - Supprimer une équipe
exports.deleteTeam = async (req, res) => {
    const { teamId } = req.params;

    try {
        const team = await Team.findByIdAndDelete(teamId);
        if (!team) {
            return res.status(404).json({ message: 'Team not found' });
        }
        res.status(200).json({ message: 'Team deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
