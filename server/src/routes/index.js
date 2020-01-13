const impresionsController = require("../controllers/impresionsController");
const revenueController = require("../controllers/revenueController");
const visitsController = require("../controllers/visitsController");

exports.appRoute = (router) => {
  router.get("/impresions", impresionsController.getImpresionsController);
  router.get("/revenue", revenueController.getRevenueController);
  router.get("/visits", visitsController.getVisitsController);
};
