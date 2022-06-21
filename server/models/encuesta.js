var mongoose = require("mongoose");

var EncuestaSchema = mongoose.Schema({
  activa: {
    type: Boolean,
    default: false,
  },
  limite: {
    type: String,
    required: true,
  },
  extraInfo: {
    type: String,
    required: true,
  },
  nombre: {
    type: String,
    required: true,
  },
  opciones: [
    {
      nombre: String,
      imagen: String,
      link: String,
    },
  ],
  veedores: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Usuario",
    },
  ],
  habilitados: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Usuario",
    },
  ],
  votos: [
    {
      opcion: String,
      usuario: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Usuario",
      },
    },
  ],
});

var Encuesta = mongoose.model("Encuesta", EncuestaSchema);
module.exports = { Encuesta };
