const Hapi = require("@hapi/hapi");
const con = require("./connection");
const routes = require("./routes");
const PORT = process.env.PORT || 5000;

const init = async () => {
  const server = Hapi.server({
    port: PORT,
    host: "0.0.0.0",
    routes: {
      cors: {
        origin: ["*"],
      },
    },
  });

  con
    .authenticate()
    .then(() => {
      console.log("connected db");
    })
    .catch(() => {
      console.log("error connected db");
    });

  server.route(routes);
  await server.start();

  console.log(`Server berjalan pada ${server.info.uri}`);
};

init();
