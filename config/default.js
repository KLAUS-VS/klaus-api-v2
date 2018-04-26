'use strict';

module.exports = {
  uri: 'http://localhost:8080',
  db: {
    mongo: {
      host: process.env.MONGO_HOST || 'mongodb://localhost/klaus',
    },
  },
};
