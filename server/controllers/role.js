const Role = require("../models/role");
const asyncHandler = require("express-async-handler");

const create = asyncHandler(async (req, res) => {
  const response = await Role.create(req.body);
  return res.status(200).json({
    success: true,
    createdBrand: response ? response : "Cannot create new brand",
  });
});

module.exports = {
  create,
};
