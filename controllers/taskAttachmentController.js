const Task = require('../models/Task');

// GET /api/tasks/:taskId/attachments - Get all attachments for a task //* Obtenir toutes les pièces jointes d'une tâche
exports.getAttachments = async (req, res) => {
    const { taskId } = req.params;

    try {
        const task = await Task.findById(taskId).populate(
            'attachments.uploadedBy',
            'username email'
        ); // Populate the user who uploaded the attachment //* Peupler l'utilisateur qui a téléchargé la pièce jointe
        if (!task) {
            return res.status(404).json({ message: 'Task not found.' });
        }

        res.status(200).json(task.attachments);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

// POST /api/tasks/:taskId/attachments - Upload an attachment to a task //* Télécharger une pièce jointe à une tâche
exports.uploadAttachment = async (req, res) => {
    const { taskId } = req.params;

    try {
        const task = await Task.findById(taskId);
        if (!task) {
            return res.status(404).json({ message: 'Task not found.' });
        }

        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded.' });
        }

        const attachment = {
            filename: req.file.filename,
            originalName: req.file.originalname,
            mimetype: req.file.mimetype,
            size: req.file.size,
            uploadedBy: req.user._id,
        };

        task.attachments.push(attachment);
        await task.save();

        res.status(201).json({
            message: 'Attachment uploaded successfully.',
            attachment,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

// DELETE /api/tasks/:taskId/attachments/:attachmentId - Delete an attachment from a task //* Supprimer une pièce jointe d'une tâche
exports.deleteAttachment = async (req, res) => {
    const { taskId, attachmentId } = req.params;

    try {
        const task = await Task.findById(taskId);
        if (!task) {
            return res.status(404).json({ message: 'Task not found.' });
        }

        const attachment = task.attachments.id(attachmentId);

        if (!attachment) {
            return res.status(404).json({ message: 'Attachment not found.' });
        }

        // Check if the user is authorized to delete the attachment //* Vérifier si l'utilisateur est autorisé à supprimer la pièce jointe
        const isOwner =
            attachment.uploadedBy.toString() === req.user._id.toString();
        const hasDeletePermission =
            req.user.permission?.includes('task:delete');

        if (!isOwner && !hasDeletePermission) {
            return res.status(403).json({
                message:
                    'You do not have permission to delete this attachment.',
            });
        }

        const filePath = path.join(
            __dirname,
            '..',
            'uploads',
            attachment.filename
        );

        // Delete the file from the server - Supprimer le fichier du serveur
        fs.unlink(filePath, (err) => {
            if (err) {
                console.error('Error deleting file:', err);
            }
        });

        attachment.remove(); // Remove the attachment from the task //* Supprimer la pièce jointe de la tâche
        await task.save();

        res.status(200).json({
            message: 'Attachment deleted successfully.',
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};
