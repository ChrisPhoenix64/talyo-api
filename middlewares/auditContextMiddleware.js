const { AsyncLocalStorage } = require('async_hooks');
const asyncLocalStorage = new AsyncLocalStorage();

exports.auditContext = (req, res, next) => {
    asyncLocalStorage.run(new Map(), () => {
        // Stocke l'ID de l'utilisateur dans le contexte
        asyncLocalStorage.getStore().set('user', req.user.id);
        next();
    });
};

exports.getCurrentUserId = () => {
    const store = asyncLocalStorage.getStore();
    return store ? store.get('user') : null;
};
