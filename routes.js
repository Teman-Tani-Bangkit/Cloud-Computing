const { register, login, uploadProduk, tampilkanProduk, tampilkanKategori, postProfil, verifauth } = require("./handler");
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
      ext: {
        onPreAuth: { method: verifauth }
      },
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
    config: {
      ext: {
          onPreAuth: { method: verifauth }
      }
    },
    method: "GET",
    path: "/tampilkanProduk",
    handler: tampilkanProduk,
  },
  {
    config: {
      ext: {
          onPreAuth: { method: verifauth }
      }
    },
    method: "GET",
    path: "/tampilkanKategori",
    handler: tampilkanKategori,
    
  },
  {
    method: "PUT",
    path: "/postProfil",
    handler: postProfil,
    options: {
      ext: {
        onPreAuth: { method: verifauth }
      },
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
