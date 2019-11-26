/*eslint no-process-env:0*/

// Development specific configuration
// ==================================
module.exports = {
    // MongoDB connection options
    mongo: {
        useMongoClient: true,
        uri: process.env.MONGODB_URI || 'mongodb://192.168.2.30:27017/articles'
    },

    // Seed database on startup
    seedDB: true,
};
