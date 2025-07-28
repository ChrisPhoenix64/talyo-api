const Task = require('../models/Task');

module.exports = async (req, res, next) => {
    const { taskId } = req.params;
    const { userId } = req.user._id;

    try {
        // Check if the task exists and if the user has access to it //* Vérifier si la tâche existe et si l'utilisateur y a accès
        const task = await Task.findById(taskId).populate({
            path: 'project',
            populate: {
                path: 'teams',
                select: 'members',
                populate: { path: 'members.user', select: '_id' },
            },
        });

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        // Check if the user is part of the project team //* Vérifier si l'utilisateur fait partie de l'équipe du projet
        const project = task.project;

        if (!project) {
            return res
                .status(404)
                .json({ message: 'Parent project not found' });
        }

        // Check if the user is a direct member of the project or part of a team in the project //* Vérifier si l'utilisateur est un membre direct du projet ou fait partie d'une équipe dans le projet
        const isDirectMember = project.members.some(
            (member) => member.user._id.toString() === userId.toString()
        );

        // If the user is not a direct member, check if they are part of any team in the project //* Si l'utilisateur n'est pas un membre direct, vérifier s'il fait partie d'une équipe dans le projet
        const isTeamMember = project.teams.some((team) =>
            team.members.some(
                (member) => member.user._id.toString() === userId.toString()
            )
        );

        if (!isDirectMember && !isTeamMember) {
            return res
                .status(403)
                .json({
                    message: 'Forbidden: You do not have access to this task',
                });
        }

        // Attach the task to the request object for further use //* Attacher la tâche à l'objet de requête pour une utilisation ultérieure
        req.task = task;
        next();
    } catch (error) {
        console.error('Error in canAccessTaskMiddleware:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
