
const {register} = require("./handler");
const routes = [
    {
      method: 'POST',
      path: '/register',
      handler: register,
    }
];

module.exports = routes;