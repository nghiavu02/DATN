const Order = require("../models/order");
const User = require("../models/user");
const Coupon = require("../models/coupon");
const asyncHandler = require("express-async-handler");
const { v4: uuidv4 } = require("uuid");
const shortid = require("shortid");
const createOrder = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  let idOrder = "DH" + shortid.generate();
  const { products, total, address, status } = req.body;
  if (address) {
    await User.findByIdAndUpdate(_id, { address, cart: [] });
  }
  const data = { products, total, orderBy: _id, idOrder };
  if (status) data.status = status;
  const rs = await Order.create(data);
  return res.status(200).json({
    success: rs ? true : false,
    rs: rs ? rs : "Something went wrong",
  });
});

const updateStatus = asyncHandler(async (req, res) => {
  const { oid } = req.params;
  const { status } = req.body;
  if (!status) throw new Error("Missing status");
  const response = await Order.findByIdAndUpdate(
    oid,
    { status },
    { new: true }
  );

  return res.status(200).json({
    success: response ? true : false,
    response: response ? response : "Something went wrong",
  });
});

const getUserOrders = asyncHandler(async (req, res) => {
  const queries = { ...req.query };
  const { _id } = req.user;

  const excludeFields = ["limit", "sort", "page", "fields"];
  excludeFields.forEach((el) => delete queries[el]);

  let queryString = JSON.stringify(queries);
  queryString = queryString.replace(
    /\b(gte|gt|lt|lte)\b/g,
    (matchedEl) => `$${matchedEl}`
  );
  const formatedQueries = JSON.parse(queryString);

  const qr = { ...formatedQueries, orderBy: _id };
  let queryCommand = Order.find(qr);

  // Sorting
  if (req.query.sort) {
    const sortBy = req.query.sort.split(",").join(" ");
    queryCommand = queryCommand.sort(sortBy);
  }

  // Fields limiting
  if (req.query.fields) {
    const fields = req.query.fields.split(",").join(" ");
    queryCommand = queryCommand.select(fields);
  }

  // Pagination
  // limit: số object lấy về 1 lần gọi api
  // skip: bỏ phần tử
  const page = +req.query.page || 1;
  const limit = +req.query.limit || process.env.LIMIT_PRODUCTS;
  const skip = (page - 1) * limit;
  queryCommand.skip(skip).limit(limit);

  queryCommand
    .then(async (response) => {
      const counts = await Order.find(qr).countDocuments();

      return res.status(200).json({
        success: response ? true : false,
        counts,
        orders: response ? response : "Cannot get orders",
      });
    })
    .catch((err) => {
      if (err) throw new Error(err.message);
    });
});

const getOrders = asyncHandler(async (req, res) => {
  const queries = { ...req.query };

  const excludeFields = ["limit", "sort", "page", "fields"];
  excludeFields.forEach((el) => delete queries[el]);

  let queryString = JSON.stringify(queries);
  queryString = queryString.replace(
    /\b(gte|gt|lt|lte)\b/g,
    (matchedEl) => `$${matchedEl}`
  );
  const formatedQueries = JSON.parse(queryString);
  if (queries?.name)
    formatedQueries.name = { $regex: queries.name, $options: "i" };
  if (req.query.q) {
    delete formatedQueries.q;
    // const objectId = Types.ObjectId(req.query.q);
    formatedQueries["$or"] = [
      { status: { $regex: req.query.q, $options: "i" } },
      { idOrder: { $regex: req.query.q, $options: "i" } },
      { "orderBy.firstname": { $regex: req.query.q, $options: "i" } },
      { "orderBy.lastname": { $regex: req.query.q, $options: "i" } },
    ];
  }
  const qr = { ...formatedQueries };
  // console.log(qr);
  let queryCommand = Order.find(qr).populate("orderBy");

  // Sorting
  if (req.query.sort) {
    const sortBy = req.query.sort.split(",").join(" ");
    queryCommand = queryCommand.sort(sortBy);
  }

  // Fields limiting
  if (req.query.fields) {
    const fields = req.query.fields.split(",").join(" ");
    queryCommand = queryCommand.select(fields);
  }

  // Pagination
  // limit: số object lấy về 1 lần gọi api
  // skip: bỏ phần tử
  const page = +req.query.page || 1;
  const limit = +req.query.limit || process.env.LIMIT_PRODUCTS;
  const skip = (page - 1) * limit;
  queryCommand.skip(skip).limit(limit);

  // Execute query
  // Số lượng sp thỏa mãn đk !== số lượng sp trả về một lần api

  queryCommand
    .then(async (response) => {
      const counts = await Order.find(qr).countDocuments();
      return res.status(200).json({
        success: response ? true : false,
        counts,
        orders: response ? response : "Cannot get orders",
      });
    })
    .catch((err) => {
      if (err) throw err;
    });
});

const getOrderCountByYear = asyncHandler(async (req, res) => {
  const year = req.params.year; // Năm cần thống kê

  // Group và tính tổng số đơn hàng theo năm
  const result = await Order.aggregate([
    {
      $match: {
        createdAt: {
          $gte: new Date(`${year}-01-01`),
          $lt: new Date(`${Number(year) + 1}-01-01`),
        },
      },
    },
    {
      $group: {
        _id: null,
        count: { $sum: 1 },
      },
    },
  ]);

  const orderCount = result.length > 0 ? result[0].count : 0;

  res.json({ orderCount });
});
const getPa = (req, res) => {
  const year = req.params.year;
  return res.json({ year });
};
const getTotalRevenueByYear = asyncHandler(async (req, res) => {
  const year = req.params.year; // Năm cần thống kê

  // Group và tính tổng số tiền theo năm
  const result = await Order.aggregate([
    {
      $match: {
        createdAt: {
          $gte: new Date(`${year}-01-01`),
          $lt: new Date(`${Number(year) + 1}-01-01`),
        },
      },
    },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: "$total" },
      },
    },
  ]);

  const totalRevenue = result.length > 0 ? result[0].totalRevenue : 0;

  res.json({ totalRevenue });
});
const deleteOrder = asyncHandler(async (req, res) => {
  const { oid } = req.params;
  const response = await Order.findByIdAndDelete(oid);
  return res.status(200).json({
    success: response ? true : false,
    mes: response ? `Order deleted` : "No order delete",
  });
});

module.exports = {
  createOrder,
  updateStatus,
  getUserOrders,
  getOrders,
  getOrderCountByYear,
  getPa,
  getTotalRevenueByYear,
  deleteOrder,
};
