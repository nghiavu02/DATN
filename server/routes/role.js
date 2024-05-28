const router = require("express").Router();
const ctrls = require("../controllers/role");

router.post("/", ctrls.create);
module.exports = router;
