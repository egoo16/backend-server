// El comentario de abajo es para utilizar las funciones de flecha
/*jshint esversion: 6 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var hospitalSchema = new Schema({
    nombre: { type: String, required: [true, 'El nombre es necesario'] },
    img: { type: String, required: false },
    usuario: { type: Schema.Types.ObjectId, ref: 'Usuario' }
}, { collection: 'hospitales' });

module.exports = mongoose.model('Hospital', hospitalSchema);