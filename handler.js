const con = require("./connection");
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const { Storage } = require("@google-cloud/storage");

// const bcrypt = require("bcrypt");

//Registrasi
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

//Login
const login = async function (request, h) {
  try {
    const { email, password } = request.payload;
    const [result] = await con.query('SELECT userid, nama From users WHERE email = "' + email + '" and password = "' + password + '" ');
    if (result.length > 0) {
      let userid = result[0].userid;
      let nama = result[0].nama;
      const accessToken = jwt.sign(userid, process.env.KEY);
      const response = h.response({
        status: "success",
        message: "berhasil melakukan login",
        data: {
          userid: userid,
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

//Post profil user
const postProfil = async function (request, h) {
  try {
    const { userid, nama, email, notelepon, password, foto } = request.payload;
    let [update, metadata] = [];
    if (request.payload.hasOwnProperty("foto")) {
      const gc = new Storage({
        keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
        projectId: "temantani-388216",
      });

      const temantaniBucket = gc.bucket("temantani-bucket");
      let ext = foto.hapi.filename.split(".").pop();
      let namafoto = userid + "_" + nama + "." + ext;

      const blob = await foto.pipe(
        temantaniBucket.file("profile/" + namafoto).createWriteStream({
          resumable: false,
        })
      );

      [update, metadata] = await con.query('UPDATE users SET nama="' + nama + '",email="' + email + '",notelepon="' + notelepon + '",password="' + password + '",foto="' + namafoto + '" WHERE userid=' + userid + "");
    } else {
      [update, metadata] = await con.query('UPDATE users SET nama="' + nama + '",email="' + email + '",notelepon="' + notelepon + '",password="' + password + '" WHERE userid=' + userid + "");
    }

    if (metadata !== 1) {
      const response = h.response({
        status: "success",
        message: "berhasil mengupdate profile",
      });
      response.code(201);
      return response;
    } else {
      const response = h.response({
        status: "error",
        message: "gagal mengupdate profile, terdapat masalah dengan server",
      });
      response.code(500);
      return response;
    }
  } catch (error) {
    console.log(error);
    const response = h.response({
      status: "error",
      message: "maaf terdapat masalah dengan koneksi",
    });
    response.code(500);
    return response;
  }
};

//Tambah barang
const uploadProduk = async function (request, h) {
  try {
    const { gambarbarang, namabarang, harga, kategori, deskripsi } = request.payload;
    let [metadata] = [];
    if (request.payload.hasOwnProperty("gambarbarang")) {
      console.log("123");
      const gc = new Storage({
        keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
        projectId: "temantani-388216",
      });

      const temantaniBucket = gc.bucket("temantani-bucket");
      let ext = gambarbarang.hapi.filename.split(".").pop();
      let namagambar = namabarang + "." + ext;

      const blob = await gambarbarang.pipe(
        temantaniBucket.file("barang/" + namagambar).createWriteStream({
          resumable: false,
        })
      );

      console.log("456");
      const [resInsert, metadata] = await con.query('INSERT INTO `produk`(`gambarbarang`, `namabarang`, `harga`, `kategori`, `deskripsi`) VALUES ("' + namagambar + '","' + namabarang + '","' + harga + '","' + kategori + '","' + deskripsi + '")');
    }
    if (metadata !== 1) {
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

//View All barang
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

//Tampil barang By Kategori
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
  postProfil,
};
