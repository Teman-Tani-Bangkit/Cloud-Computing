const con = require("./connection");
const jwt = require("jsonwebtoken");
const { Storage } = require("@google-cloud/storage");
const axios = require("axios");
const path = require("path");
const pathKey = path.resolve("serviceaccountkey.json");

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

const verifauth = async function (request, reply) {
  const { key } = request.headers;
  let valid = false;
  if (key == null) return reply.response(401);
  jwt.verify(key, process.env.KEY, (err, isValid) => {
    if (isValid) {
      // return reply.continue;
      valid = true;
    }
  });
  if (valid) return reply.continue;
  else return reply.response(403);
};

//Post profil user
const postProfil = async function (request, h) {
  try {
    const { userid, nama, email, notelepon, password, foto } = request.payload;
    let [update, metadata] = [];
    if (request.payload.hasOwnProperty("foto")) {
      const gc = new Storage({
        keyFilename: pathKey,
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

// userProfil
const userProfil = async function (request, h) {
  try {
    const { userid } = request.params;
    const [userData] = await con.query('SELECT * FROM users WHERE userid = "' + userid + '"');
    if (userData.length === 0) {
      const response = h.response({
        status: "error",
        message: "Data pengguna tidak ditemukan",
        data: null,
      });
      response.code(404);
      return response;
    }

    const [barangData] = await con.query('SELECT * FROM produks WHERE userid = "' + userid + '"');

    const response = h.response({
      status: "success",
      message: "Data profil pengguna berhasil ditemukan",
      data: {
        user: userData[0],
        barang: barangData,
      },
    });
    response.code(200);
    return response;
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

//Tambah barang
const uploadProduk = async function (request, h) {
  try {
    const { userid, gambarbarang, namabarang, harga, kategori, deskripsi } = request.payload;
    let [metadata] = [];
    if (request.payload.hasOwnProperty("gambarbarang")) {
      const gc = new Storage({
        keyFilename: pathKey,
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

      const [resInsert, metadata] = await con.query('INSERT INTO `produks`(`userid`, `gambarbarang`, `namabarang`, `harga`, `kategori`, `deskripsi`) VALUES ("' + userid + '","' + namagambar + '","' + namabarang + '","' + harga + '","' + kategori + '","' + deskripsi + '")');
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

// detailProduk
const detailProduk = async function (request, h) {
  try {
    const { idbarang } = request.params;
    const [result] = await con.query('SELECT users.nama AS nama, users.foto AS foto, users.notelepon AS notelepon, produks.* FROM produks INNER JOIN users ON produks.userid = users.userid WHERE produks.idbarang = "' + idbarang + '"');
    if (result.length > 0) {
      const response = h.response({
        status: "success",
        message: "Detail produk berhasil ditemukan",
        data: result[0],
      });
      response.code(200);
      return response;
    } else {
      const response = h.response({
        status: "success",
        message: "Tidak ada detail produk yang ditemukan",
        data: null,
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

//View All barang
const tampilkanProduk = async function (request, h) {
  try {
    const { namabarang } = request.query;
    var result;
    if (namabarang != null) {
      [result] = await con.query('SELECT * FROM produks WHERE namabarang LIKE "%' + namabarang + '%"');
    } else {
      [result] = await con.query("SELECT * FROM produks");
    }

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
    console.log(request.params);
    const { kategori } = request.params;
    const [result] = await con.query('SELECT * FROM produks WHERE kategori = "' + kategori + '"');
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

const penyakit = async function (request, h) {
  try {
    const { tanaman, gambar } = request.payload;
    var request = require("request");

    const gc = new Storage({
      keyFilename: pathKey,
      projectId: "temantani-388216",
    });

    const temantaniBucket = gc.bucket("temantani-bucket");
    let ext = gambar.hapi.filename.split(".").pop();
    let namagambar = tanaman + "." + ext;

    const blob = await gambar.pipe(
      temantaniBucket.file("tanaman/" + namagambar).createWriteStream({
        resumable: false,
      })
    );
    url = "https://ml-disease-xmyrxrwica-et.a.run.app";

    link = "https://storage.googleapis.com/temantani-bucket/tanaman/" + namagambar;

    const requestData = {
      plant: tanaman,
      link: link,
    };

    const response = await axios.post("https://ml-disease-xmyrxrwica-et.a.run.app", requestData);
    const result = response.data;

    const namapenyakit = tanaman + "_" + result["result"];
    const [data] = await con.query('SELECT * FROM disease WHERE nama ="' + namapenyakit + '"');

    return data[0];
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

const rekomendasi = async function (request, h) {
  try {
    const { n, p, k, temperature, humidity, ph, rainfall } = request.payload;

    const requestBody = {
      n: n,
      p: p,
      k: k,
      temperature: temperature,
      humidity: humidity,
      ph: ph,
      rainfall: rainfall,
    };

    const response = await axios.post("https://ml-recommendation-xmyrxrwica-et.a.run.app/", requestBody);
    const result = response.data;

    return result;
  } catch (error) {
    console.log(error);
    const response = h
      .response({
        status: "error",
        message: "Terjadi masalah dengan koneksi",
      })
      .code(500);
    return response;
  }
};

module.exports = {
  register,
  login,
  verifauth,
  uploadProduk,
  detailProduk,
  tampilkanProduk,
  tampilkanKategori,
  postProfil,
  userProfil,
  penyakit,
  rekomendasi,
};
