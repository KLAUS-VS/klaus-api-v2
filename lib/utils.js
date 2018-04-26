'use strict';

const config = require('config');

const configGet = p => config.util.cloneDeep(p ? config.get(p) : config);

module.exports = {
  configGet,
};
