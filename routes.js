const { register, login, uploadProduk, tampilkanProduk, tampilkanKategori, postProfil } = require("./handler");
const routes = [
  {
    method: "POST",
    path: "/register",
    handler: register,
  },
  {
    method: "POST",
    path: "/login",
    handler: login,
  },
  {
    method: "POST",
    path: "/uploadProduk",
    options: {
      payload: {
        parse: true,
        multipart: {
          output: "stream",
        },
        maxBytes: 1000 * 1000 * 5,
      },
    },
    handler: uploadProduk,
  },
  {
    method: "GET",
    path: "/tampilkanProduk",
    handler: tampilkanProduk,
  },
  {
    method: "GET",
    path: "/tampilkanKategori",
    handler: tampilkanKategori,
  },
  {
    method: "POST",
    path: "/postProfil",
    handler: postProfil,
    options: {
      payload: {
        parse: true,
        multipart: {
          output: "stream",
        },
        maxBytes: 1000 * 1000 * 5,
      },
    },
  },
];

module.exports = routes;
