'use strict';

const register = async server => {
  server.route({
    method: 'GET',
    path: '/tests/',
    handler: () => {
      return { message: 'Hello Klaus' };
    },
  });
};

module.exports = {
  register,
  name: 'route-tests',
};
