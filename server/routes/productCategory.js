const router = require("express").Router();
const ctrls = require("../controllers/productCategory");
const { verifyAccessToken, isAdmin } = require("../middlewares/verifyToken");
const uploader = require("../config/cloudinary.config");
router.post(
  "/",
  [verifyAccessToken, isAdmin],
  uploader.fields([{ name: "image", maxCount: 1 }]),
  ctrls.createCategory
);
router.get("/", ctrls.getCategories);
router.put("/:pcid", [verifyAccessToken, isAdmin], ctrls.updateCategory);
router.delete("/:pcid", [verifyAccessToken, isAdmin], ctrls.deleteCategory);

module.exports = router;
