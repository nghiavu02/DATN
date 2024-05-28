const userRouter = require("./user");
const productRouter = require("./product");
const productCategoryRouter = require("./productCategory");
const couponRouter = require("./coupon");
const orderRouter = require("./order");
const insertRouter = require("./insert");
const roleRouter = require("./role");
const { notFound, errHandler } = require("../middlewares/errHandler");

const initRoutes = (app) => {
  app.use("/api/user", userRouter);
  app.use("/api/product", productRouter);
  app.use("/api/productcategory", productCategoryRouter);
  app.use("/api/coupon", couponRouter);
  app.use("/api/order", orderRouter);
  app.use("/api/insert", insertRouter);
  app.use("/api/role", roleRouter);
  app.use(notFound);
  app.use(errHandler);
};

module.exports = initRoutes;
