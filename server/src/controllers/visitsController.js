const visitsModel = require("../models/visitsModel");

exports.getVisitsController = (req, res) => {
  const visits = visitsModel.getVisits();
  res.json({ data: visits });
};
