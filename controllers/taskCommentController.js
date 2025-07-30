const Task = require('../models/Task');

// POST /api/tasks/:taskId/comments - Add a comment to a task //* Ajouter un commentaire à une tâche
exports.addComment = async (req, res) => {
    const { taskId } = req.params;
    const { content } = req.body;

    try {
        const task = await Task.findById(taskId);
        if (!task) {
            return res.status(404).json({ message: 'Task not found.' });
        }

        task.comments.push({ content, createdBy: req.user._id });

        // Include audit information //* Inclure les informations d'audit
        task._auditUser = req.user._id;

        await task.save();

        res.status(201).json({
            message: 'Comment added successfully.',
            comment: task.comments.at(-1),
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

// PUT /api/tasks/:taskId/comments/:commentId - Update a comment //* Mettre à jour un commentaire
exports.updateComment = async (req, res) => {
    const { taskId, commentId } = req.params;
    const { content } = req.body;

    try {
        const task = await Task.findById(taskId);
        if (!task) {
            return res.status(404).json({ message: 'Task not found.' });
        }

        const comment = task.comments.id(commentId);
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found.' });
        }

        // Check if the user is authorized to update the comment //* Vérifier si l'utilisateur est autorisé à mettre à jour le commentaire
        const isOwner = comment.createdBy.equals(req.user._id);
        const hasPermission = req.user.permissions?.includes('task:update');

        if (!isOwner && !hasPermission) {
            return res.status(403).json({
                message: 'You are not authorized to update this comment.',
            });
        }

        comment.content = content;
        comment.updatedAt = new Date();
        comment.updatedBy = req.user._id; // Assuming you want to track who updated the comment //* Mettre à jour qui a modifié le commentaire

        // Include audit information //* Inclure les informations d'audit
        task._auditUser = req.user._id;

        await task.save();

        res.status(200).json({
            message: 'Comment updated successfully.',
            comment,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

// DELETE /api/tasks/:taskId/comments/:commentId - Delete a comment //* Supprimer un commentaire
exports.deleteComment = async (req, res) => {
    const { taskId, commentId } = req.params;

    try {
        const task = await Task.findById(taskId);
        if (!task) {
            return res.status(404).json({ message: 'Task not found.' });
        }

        const comment = task.comments.id(commentId);
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found.' });
        }

        // Check if the user is authorized to delete the comment //* Vérifier si l'utilisateur est autorisé à supprimer le commentaire
        const isOwner = comment.createdBy.equals(req.user._id);
        const hasPermission = req.user.permissions?.includes('task:update');

        if (!isOwner && !hasPermission) {
            return res.status(403).json({
                message: 'You are not authorized to update this comment.',
            });
        }

        comment.remove();

        // Include audit information //* Inclure les informations d'audit
        task._auditUser = req.user._id;

        await task.save();

        res.status(200).json({
            message: 'Comment deleted successfully.',
            commentId,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};
