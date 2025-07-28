const multer = require('multer');
const path = require('path');

// Repository destination for uploaded files - Dossier de destination des fichiers téléchargés
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../uploads')); // Create 'uploads' directory if it doesn't exist - Créer le répertoire 'uploads' s'il n'existe pas
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`); // Use fieldname to differentiate files - Utiliser le nom du champ pour différencier les fichiers
    },
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // Limit file size to 10MB - Limiter la taille du fichier à 10 Mo
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|pdf/; // Allowed file types - Types de fichiers autorisés
        const ext = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (ext && mimetype) {
            return cb(null, true);
        }
        cb(new Error('File type not allowed. Only images and PDFs are accepted.'));
    },
});

module.exports = upload; // Middleware to handle single file upload - Middleware pour gérer le téléchargement d'un seul fichier
