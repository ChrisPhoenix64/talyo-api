const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes'); // Import authentication routes - Importer les routes d'authentification
const roleRoutes = require('./routes/roleRoutes'); // Import role routes - Importer les routes de rôle
const userRoutes = require('./routes/userRoutes'); // Import user routes - Importer les routes d'utilisateur
const projectRoutes = require('./routes/projectRoutes'); // Import project routes - Importer les routes de projet
const taskRoutes = require('./routes/taskRoutes'); // Import task routes - Importer les routes de tâche
const taskChecklistRoutes = require('./routes/taskChecklistRoutes'); // Import task checklist routes - Importer les routes de liste de contrôle de tâche
const taskCommentRoutes = require('./routes/taskCommentRoutes'); // Import task comment routes - Importer les routes de commentaire de tâche
const taskAttachmentRoutes = require('./routes/taskAttachmentRoutes'); // Import task attachment routes - Importer les routes de pièce jointe de tâche
const teamRoutes = require('./routes/teamRoutes'); // Import team routes - Importer les routes d'équipe

// Load environment variables from .env file - Charger les variables d'environnement depuis le fichier .env
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Test route - Route de test
app.get('/', (req, res) => {
    res.send('Hello World!');
});

// Authentication routes - Routes d'authentification
app.use('/api/auth', authRoutes);
// Role routes - Routes de rôle
app.use('/api/roles', roleRoutes);
// User routes - Routes d'utilisateur
app.use('/api/users', userRoutes);
// Project routes - Routes de projet
app.use('/api/projects', projectRoutes);
// Task routes - Routes de tâche
app.use('/api/tasks', taskRoutes);
// Task checklist routes - Routes de liste de contrôle de tâche
app.use('/api/tasks/:taskId/checklist', taskChecklistRoutes);
// Task comment routes - Routes de commentaire de tâche
app.use('/api/tasks/:taskId/comments', taskCommentRoutes);
// Task attachment routes - Routes de pièce jointe de tâche
app.use('/api/tasks/:taskId/attachments', taskAttachmentRoutes);
app.use('/uploads', express.static('uploads')); // Serve uploaded files - Servir les fichiers téléchargés
// Team routes - Routes d'équipe
app.use('/api/teams', teamRoutes);

// Connect to MongoDB - Connexion à MongoDB
mongoose
    .connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch((err) => {
        console.error('MongoDB connection error:', err);
    });

// Start the server - Démarrer le serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
