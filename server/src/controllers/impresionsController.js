const impresionsModel = require("../models/impresionsModel");

exports.getImpresionsController = (req, res) => {
  const impresions = impresionsModel.getImpresions();
  res.json({ data: impresions });
};
