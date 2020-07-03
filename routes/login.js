// El comentario de abajo es para utilizar las funciones de flecha
/*jshint esversion: 6 */

var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var SEED = require('../config/config').SEED;

var app = express();
var Usuario = require('../models/usuario');

var { OAuth2Client } = require('google-auth-library');

const GOOGLE_CLIENT_ID = require('../config/config').GOOGLE_CLIENT_ID;
const GOOGLE_SECRET = require('../config/config').GOOGLE_SECRET;



//============================================
// Google Autentication
//============================================

app.post('/google', (req, res) => {

    var token = req.body.token || 'xxx';

    const client = new OAuth2Client(GOOGLE_CLIENT_ID, GOOGLE_SECRET, '');

    client.verifyIdToken({
            idToken: token,
            audience: GOOGLE_CLIENT_ID
        },
        //of, if multiple clients access the backend:
        //[client_od_1, client_id_2],
        function(e, login) {

            if (e) {
                return res.status(400).json({
                    ok: true,
                    mensaje: 'Ok',
                    errors: e
                });
            }

            var payload = login.getPayload();
            var userid = payload.sub;

            Usuario.findOne({ email: payload.email }, (err, usuario) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'User not found - Login',
                        errors: err
                    });
                }

                if (usuario) {
                    if (usuario.google === false) {
                        return res.status(400).json({
                            ok: false,
                            mensaje: 'You must use normal authentication'
                        });
                    } else {
                        usuario.password = ':)';
                        var token = jwt.sign({ usuario: usuario }, SEED, { expiresIn: 14400 }); // 4horas 

                        res.status(200).json({
                            ok: true,
                            usuario: usuario,
                            token: token,
                            id: usuario._id
                        });
                    }
                } else { //Si el usuario no existe por correo
                    var newUser = new Usuario();

                    newUser.nombre = payload.name;
                    newUser.email = payload.email;
                    newUser.password = ':)';
                    newUser.img = payload.picture;
                    newUser.google = true;

                    newUser.save((err, usuarioDb) => {
                        if (err) {
                            return res.status(500).json({
                                ok: false,
                                mensaje: 'error creating user - Google',
                                errors: err
                            });
                        }
                        var token = jwt.sign({ usuario: usuarioDb }, SEED, { expiresIn: 14400 }); // 4horas 

                        res.status(200).json({
                            ok: true,
                            usuario: usuarioDb,
                            token: token,
                            id: usuarioDb._id
                        });

                    });
                }
            });
        });
});

//============================================
// Normal Autentication
//============================================

app.post('/', (req, res) => {

    var body = req.body;

    Usuario.findOne({ email: body.email }, (err, usuarioDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuario',
                errors: err
            });
        }

        if (!usuarioDB) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas - email',
                errors: err
            });
        }

        if (!bcrypt.compareSync(body.password, usuarioDB.password)) {

            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas - password',
                errors: err
            });
        }

        // Crear un token!!!
        usuarioDB.password = ':)';
        var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 }); // 4horas 

        res.status(200).json({
            ok: true,
            usuario: usuarioDB,
            token: token,
            id: usuarioDB._id
        });
    });
});



module.exports = app;