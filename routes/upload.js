// El comentario de abajo es para utilizar las funciones de flecha
/*jshint esversion: 6 */

var express = require('express');

var Usuario = require('../models/usuario');
var Medico = require('../models/medico');
var Hospital = require('../models/hospital');

var fileUpload = require('express-fileupload');
var fs = require('fs');

var app = express();

// default optional
app.use(fileUpload());

app.put('/:type/:id', (req, res, next) => {

    var type = req.params.type;
    var id = req.params.id;

    // type of collection
    var typesValid = ['hospitales', 'medicos', 'usuarios'];

    if (typesValid.indexOf(type) < 0) {
        return res.status(400).json({
            ok: false,
            messaje: 'Invalid collection  type',
            errors: { message: 'Invalid collection  type' }
        });
    }

    if (!req.files) {
        return res.status(400).json({
            ok: false,
            messaje: 'did not select anything',
            errors: { message: 'you must select an image' }
        });
    }

    // Get name of file
    var file = req.files.image;
    var nameCut = file.name.split('.');
    var extensionFile = nameCut[nameCut.length - 1];

    //Only these valid extensions
    var ExtensionsValid = ['png', 'jpg', 'gif', 'jpeg'];

    if (ExtensionsValid.indexOf(extensionFile) < 0) {
        return res.status(400).json({
            ok: false,
            messaje: 'Invalid extension',
            errors: { message: 'valid extensions are: ' + ExtensionsValid.join(', ') }
        });
    }

    // Custom filename
    var filename = `${id}-${ new Date().getMilliseconds() }.${extensionFile}`;

    //Move the temp file to a path
    var path = `./uploads/${type}/${filename}`;

    file.mv(path, err => {
        if (err) {
            return res.status(500).json({
                ok: false,
                messaje: 'error moving file',
                errors: err
            });
        }

        uploadByType(type, id, filename, res);

        // res.status(200).json({
        //     ok: true,
        //     mensaje: 'Moved file',
        //     extensionFile: extensionFile
        // });
    });
});

function uploadByType(type, id, filename, res) {
    if (type === 'usuarios') {

        Usuario.findById(id, (err, usuario) => {

            if (!usuario) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Not exist User.',
                    user: userUpdated
                });
            }
            var pathOld = './uploads/usuarios/' + usuario.img;

            // if it exists, delete the previous image
            if (fs.existsSync(pathOld)) {
                fs.unlinkSync(pathOld);
            }

            usuario.img = filename;

            usuario.save((err, userUpdated) => {
                userUpdated.password = ':)';
                return res.status(200).json({
                    ok: true,
                    mensaje: 'User image updated.',
                    user: userUpdated
                });
            });
        });
    }
    if (type === 'medicos') {
        Medico.findById(id, (err, medico) => {

            if (!medico) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Not exist Medico.',
                    user: userUpdated
                });
            }
            var pathOld = './uploads/medicos/' + medico.img;

            // if it exists, delete the previous image
            if (fs.existsSync(pathOld)) {
                fs.unlinkSync(pathOld);
            }
            medico.img = filename;

            medico.save((err, medicoUpdated) => {

                return res.status(200).json({
                    ok: true,
                    mensaje: 'Medico image updated.',
                    medico: medicoUpdated
                });
            });
        });
    }
    if (type === 'hospitales') {

        Hospital.findById(id, (err, hospital) => {

            if (!hospital) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Not exist Hospital.',
                    user: userUpdated
                });
            }
            var pathOld = './uploads/hospitales/' + hospital.img;

            // if it exists, delete the previous image
            if (fs.existsSync(pathOld)) {
                fs.unlinkSync(pathOld);
            }
            hospital.img = filename;

            hospital.save((err, hospitalUpdated) => {
                return res.status(200).json({
                    ok: true,
                    mensaje: 'Hospital image updated.',
                    medico: hospitalUpdated
                });
            });
        });
    }
}

module.exports = app;