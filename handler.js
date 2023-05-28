const con = require("./connection");
const bcrypt = require("bcrypt");
// const moment = require("moment");
// const jwt = require("jsonwebtoken");

const register = async function (request, h) {
  try {
    const { email,no_hp, name, password } = request.payload;
    // cek email sudah ada di db atau tidak
    const [result] = await con.query('SELECT * From users WHERE email = "' + email + '" ');
    if (result.length === 0) {
      const hashedPassword = await bcrypt.hash(password, 10);
      const [resInsert, metadata] = await con.query('INSERT INTO `users`(`name`, `password`, `email`) VALUES ("' + name + '","' + hashedPassword + '","' + email + '")');
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
        message: "akun sudah terdaftar",
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
const login = async function(request,h){
    try {
        const { email, password } = request.payload;
        const [result,error] = await con.query('SELECT id_user,name From users WHERE email = "'+email+'" and password = "'+password+'" ');
        if(result.length >0){
                let id_user = (result[0].id_user);
                let name = (result[0].name);
                const accessToken = jwt.sign(id_user,process.env.KEY);
                // console.log(accessToken);
                const response = h.response({
                    status: 'success',
                    message: 'berhasil melakukan login',
                    data: {
                        userid: id_user,
                        name: name,
                        token: accessToken
                    }
                  });
                response.code(201);
                return response
            }
            else{
                const response = h.response({
                    status: 'error',
                    message: 'gagal untuk login, silahkan periksa kembali email atau password anda',
                  });
                response.code(500);
                return response
            }
    } catch (error) {
        console.log(error);
        const response = h.response({
            status: 'success',
            message: 'maaf terdapat masalah dengan koneksi',
          });
        response.code(500);
        return response
    }
}


module.exports = {login, register};