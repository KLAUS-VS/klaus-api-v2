'use strict';

const hapi = require('hapi');
const mongoose = require('mongoose');
const { configGet } = require('./lib/utils');
const DEBUG_ENABLED = process.env.DEBUG_ENABLED;

const server = hapi.server({
  port: 8080,
  debug: DEBUG_ENABLED ? {
    log: ['error'],
    request: ['error'],
  } : false,
  routes: {
    cors: {
      origin: ['*'],
      credentials: true,
    },
  },
});

mongoose.Promise = global.Promise;
mongoose.connect(configGet('db.mongo.host'))
  .catch(err => {
    console.log(err);
    process.exit(1);
  });

server.app.mongoose = mongoose;

const plugins = [
  require('inert'),
  require('./routes/tests'),
];

if (DEBUG_ENABLED) {
  plugins.unshift({
    plugin: require('good'),
    options: {
      reporters: {
        cons: [{
          module: 'good-squeeze',
          name: 'Squeeze',
          args: [{ log: '*', response: '*' }],
        }, {
          module: 'good-console',
        }, 'stdout'],
      },
    },
  });
}

const abort = err => {
  throw err;
};

const start = async () => {
  await server.register(plugins)
    .catch(abort);
  await server.start()
    .catch(abort);
  console.log(`Server running at: ${server.info.uri}`);
};

start();
