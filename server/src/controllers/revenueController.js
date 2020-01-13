const revenueModel = require("../models/revenueModel");

exports.getRevenueController = (req, res) => {
  const revenue = revenueModel.getRevenue();
  res.json({ data: revenue });
};
