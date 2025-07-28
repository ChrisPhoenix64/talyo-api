const Project = require('../models/Project');

module.exports = async (req, res, next) => {
    const { projectId } = req.params;
    const userId = req.user._id;

    try {
        const project = await Project.findById(projectId).populate({
            path: 'teams',
            select: 'members',
            populate: { path: 'members.user members.role', select: '_id role' },
        });

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        // Owner check //* Vérification du propriétaire
        // If the user is the owner of the project, they have full access //* Si l'utilisateur est le propriétaire du projet, il a un accès complet
        if (project.createdBy.toString() === userId.toString()) {
            req.project = project; // Attach project to request for further use //* Attacher le projet à la requête pour une utilisation ultérieure
            req.accessLevel = 'owner'; // Set access level to owner //* Définir le niveau d'accès à propriétaire
            return next();
        }

        // Team leaders check //* Vérification des chefs d'équipe
        // If the user is a team leader, they have access to the project //* Si l'utilisateur est un chef d'équipe, il a accès au projet
        const isTeamLeader = project.teams.some((team) =>
            team.members.some(
                (member) =>
                    member.user._id.toString() === userId.toString() &&
                    member.role === 'leader'
            )
        );

        if (isTeamLeader) {
            req.project = project; // Attach project to request for further use //* Attacher le projet
            req.accessLevel = 'leader'; // Set access level to team leader //* Définir le niveau d'accès à chef d'équipe
            return next();
        }

        // Member check //* Vérification des membres
        // If the user is a direct member or a member of a team in the project, they have access //* Si l'utilisateur est un membre direct ou un membre d'une équipe dans le projet, il a accès
        const isDirectMember = project.members.some(
            (memberId) => memberId.toString() === userId.toString()
        );

        const isTeamMember = project.teams.some((team) =>
            team.members.some(
                (member) => member.user._id.toString() === userId.toString()
            )
        );

        if (isDirectMember || isTeamMember) {
            req.project = project; // Attach project to request for further use //* Attacher le projet à la requête pour une utilisation ultérieure
            req.accessLevel = 'member'; // Set access level to member //* Définir le niveau d'accès à membre
            return next();
        }

        return res.status(403).json({
            message: 'Access denied: not a project member or team member',
        });

        // Attach project to request for further use //* Attacher le projet à la requête pour une utilisation ultérieure
        req.project = project;
        next();
    } catch (error) {
        console.error('Error in canAccessProjectMiddleware:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
