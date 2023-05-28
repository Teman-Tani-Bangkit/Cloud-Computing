const { register, login, uploadProduk, tampilkanProduk, tampilkanKategori } = require("./handler");
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
];

module.exports = routes;
