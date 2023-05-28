const con = require("./connection");
const jwt = require("jsonwebtoken");
const Joi = require("joi");

// const bcrypt = require("bcrypt");

const register = async function (request, h) {
  try {
    const { nama, email, notelepon, password } = request.payload;
    const [result] = await con.query('SELECT * From users WHERE email = "' + email + '" ');
    if (result.length === 0) {
      const [resInsert, metadata] = await con.query('INSERT INTO `users`(`nama`, `email`, `notelepon`, `password`) VALUES ("' + nama + '","' + email + '","' + notelepon + '","' + password + '")');
      console.log(metadata);
      if (metadata === 1) {
        const response = h.response({
          status: "success",
          message: "berhasil membuat akun",
        });
        response.code(201);
        return response;
      } else {
        const response = h.response({
          status: "error",
          message: "terjadi kesalahan dengan server",
        });
        response.code(500);
        return response;
      }
    } else {
      const response = h.response({
        status: "error",
        message: "email sudah terdaftar",
      });
      response.code(500);
      return response;
    }
  } catch (error) {
    console.log(error);
    const response = h.response({
      status: "success",
      message: "terdapat masalah dengan koneksi",
    });
    response.code(500);
    return response;
  }
};

const login = async function (request, h) {
  try {
    const { email, password } = request.payload;
    const [result] = await con.query('SELECT id_user,nama From users WHERE email = "' + email + '" and password = "' + password + '" ');
    if (result.length > 0) {
      let id_user = result[0].id_user;
      let nama = result[0].nama;
      const accessToken = jwt.sign(id_user, process.env.KEY);
      const response = h.response({
        status: "success",
        message: "berhasil melakukan login",
        data: {
          userid: id_user,
          nama: nama,
          token: accessToken,
        },
      });
      response.code(201);
      return response;
    } else {
      const response = h.response({
        status: "error",
        message: "gagal untuk login, silahkan periksa kembali email atau password anda",
      });
      response.code(500);
      return response;
    }
  } catch (error) {
    console.log(error);
    const response = h.response({
      status: "success",
      message: "maaf terdapat masalah dengan koneksi",
    });
    response.code(500);
    return response;
  }
};

const uploadProduk = async function (request, h) {
  try {
    const { gambarBarang, namaBarang, harga, kategori, deskripsi } = request.payload;

    // Validasi input menggunakan Joi
    const schema = Joi.object({
      gambarBarang: Joi.string().required(),
      namaBarang: Joi.string().required(),
      harga: Joi.number().required(),
      kategori: Joi.string().valid("tanaman", "alat tani").required(),
      deskripsi: Joi.string().required(),
    });

    const { error } = schema.validate(request.payload);

    if (error) {
      const response = h.response({
        status: "error",
        message: error.details[0].message,
      });
      response.code(400);
      return response;
    }

    const [resInsert, metadata] = await con.query('INSERT INTO `produk`(`gambarBarang`, `namaBarang`, `harga`, `kategori`, `deskripsi`) VALUES ("' + gambarBarang + '","' + namaBarang + '","' + harga + '","' + kategori + '","' + deskripsi + '")');

    if (metadata === 1) {
      const response = h.response({
        status: "success",
        message: "Produk berhasil ditambahkan",
      });
      response.code(201);
      return response;
    } else {
      const response = h.response({
        status: "error",
        message: "Terjadi kesalahan dengan server",
      });
      response.code(500);
      return response;
    }
  } catch (error) {
    console.log(error);
    const response = h.response({
      status: "error",
      message: "Terjadi masalah dengan koneksi",
    });
    response.code(500);
    return response;
  }
};

const tampilkanProduk = async function (request, h) {
  try {
    const [result] = await con.query("SELECT * FROM produk");
    if (result.length > 0) {
      const response = h.response({
        status: "success",
        message: "Data produk berhasil ditemukan",
        data: result,
      });
      response.code(200);
      return response;
    } else {
      const response = h.response({
        status: "success",
        message: "Tidak ada data produk yang ditemukan",
        data: [],
      });
      response.code(200);
      return response;
    }
  } catch (error) {
    console.log(error);
    const response = h.response({
      status: "error",
      message: "Terjadi masalah dengan koneksi",
    });
    response.code(500);
    return response;
  }
};

const tampilkanKategori = async function (request, h) {
  try {
    const { kategori } = request.query;
    const [result] = await con.query('SELECT * FROM produk WHERE kategori = "' + kategori + '"');
    if (result.length > 0) {
      const response = h.response({
        status: "success",
        message: "Data produk berhasil ditemukan",
        data: result,
      });
      response.code(200);
      return response;
    } else {
      const response = h.response({
        status: "success",
        message: "Tidak ada data produk yang ditemukan",
        data: [],
      });
      response.code(200);
      return response;
    }
  } catch (error) {
    console.log(error);
    const response = h.response({
      status: "error",
      message: "Terjadi masalah dengan koneksi",
    });
    response.code(500);
    return response;
  }
};

module.exports = {
  register,
  login,
  uploadProduk,
  tampilkanProduk,
  tampilkanKategori,
};
