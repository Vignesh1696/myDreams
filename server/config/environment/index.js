/*eslint no-process-env:0*/

import path from 'path';
import _ from 'lodash';
var baseUrl = process.env.DOMAIN;

/*function requiredProcessEnv(name) {
  if(!process.env[name]) {
    throw new Error('You must set the ' + name + ' environment variable');
  }
  return process.env[name];
}*/

// All configurations will extend these options
// ============================================
var all = {
    env: process.env.NODE_ENV,

    // Root path of server
    root: path.normalize(`${__dirname}/../../..`),

    // dev client port
    clientPort: process.env.CLIENT_PORT || 3000,
    baseUrl: process.env.DOMAIN,
    // Server port
    port: process.env.PORT || 9000,

    // Server IP
    ip: process.env.IP || '0.0.0.0',

    // Should we populate the DB with sample data?
    seedDB: false,

    // Secret for session, you will want to change this and make it an environment variable
    secrets: {
        session: 'yoman-secret'
    },
    auth: {
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        url: baseUrl + "/auth/token",
        verifyUrl: baseUrl + "/auth/token/verify",
        saUrl: baseUrl + "/auth/sa-token"
    },
    secrets: {
        session: 'staffing-api-secret',
        globalAccessToken: process.env.GLOBAL_ACCESS_TOKEN_SECRET || "global-access-token-secret",
        accessToken: process.env.ACCESS_TOKEN_SECRET || "accessToken",
        refreshToken: process.env.REFRESH_TOKEN_SECRET || "refreshToken",
        refTokenKey: process.env.REFRESH_TOKEN_KEY_SECRET || "refreshTokenKey"
    },

    token: {
        expiresInMinutes: process.env.TOKEN_EXPIRES_IN_MIN || 2
    },
    // MongoDB connection options
    mongo: {
        options: {
            db: {
                safe: true
            }
        }
    }
};

// Export the config object based on the NODE_ENV
// ==============================================
module.exports = _.merge(
    all,
    require('./shared').default,
    require(`./${process.env.NODE_ENV}.js`) || {});
