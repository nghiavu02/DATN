const router = require("express").Router();
const ctrls = require("../controllers/order");
const { verifyAccessToken, isAdmin } = require("../middlewares/verifyToken");

router.get(
  "/count/:year",
  verifyAccessToken,
  isAdmin,
  ctrls.getOrderCountByYear
);
router.get(
  "/revenue/:year",
  verifyAccessToken,
  isAdmin,
  ctrls.getTotalRevenueByYear
);
router.post("/", verifyAccessToken, ctrls.createOrder);
router.put("/status/:oid", verifyAccessToken, isAdmin, ctrls.updateStatus);
router.delete("/:oid", verifyAccessToken, isAdmin, ctrls.deleteOrder);
router.get("/admin", verifyAccessToken, isAdmin, ctrls.getOrders);
router.get("/", verifyAccessToken, ctrls.getUserOrders);
module.exports = router;
