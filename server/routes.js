/**
 * Main application routes
 */

 import errors from './components/errors';
 import path from 'path';

 export default function(app) {
    // Insert routes below
    app.post('/auth/sa-token', require('./api/sa-auth/authToken'));
    app.post('/auth/token', require('./auth'));
    app.use('/api/app-client', require('./api/appClient'));
    app.use('/api/superadmin', require('./api/sa-auth/auth'));
    app.use('/api/users', require('./api/users'));
    // All undefined asset or api routes should return a 404
    app.route('/:url(api|auth|components|app|bower_components|assets)/*')
    .get(errors[404]);

    // All other routes should redirect to the app.html
    app.route('/*')
    .get((req, res) => {
        res.sendFile(path.resolve(`${app.get('appPath')}/app.html`));
    });
}
