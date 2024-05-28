const ProductCategory = require("../models/productCategory");
const asyncHandler = require("express-async-handler");

const createCategory = asyncHandler(async (req, res) => {
  const image = req?.files?.image[0]?.path;
  if (image) req.body.image = image;
  const response = await ProductCategory.create(req.body);

  return res.status(200).json({
    success: true,
    createdCategory: response ? response : "Cannot create new product-category",
  });
});

const getCategories = asyncHandler(async (req, res) => {
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
      { title: { $regex: req.query.q, $options: "i" } },
      // { _id: { $regex: req.query.q, $options: "i" } },
    ];
  }
  const qr = { ...formatedQueries };
  let queryCommand = ProductCategory.find(qr);

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
  const page = +req.query.page || 1;
  const limit = +req.query.limit || process.env.LIMIT_CATEGORIES;
  const skip = (page - 1) * limit;
  queryCommand.skip(skip).limit(limit);

  // Execute query
  queryCommand
    .then(async (response) => {
      const counts = await ProductCategory.find(qr).countDocuments();
      return res.status(200).json({
        success: response ? true : false,
        counts,
        categories: response ? response : "Cannot get categories",
      });
    })
    .catch((err) => {
      if (err) throw err;
    });
});

const updateCategory = asyncHandler(async (req, res) => {
  const { pcid } = req.params;
  const response = await ProductCategory.findByIdAndUpdate(pcid, req.body, {
    new: true,
  });

  return res.status(200).json({
    success: true,
    updatedCategory: response ? response : "Cannot update product-category",
  });
});

const deleteCategory = asyncHandler(async (req, res) => {
  const { pcid } = req.params;
  const response = await ProductCategory.findByIdAndDelete(pcid);

  return res.status(200).json({
    success: true,
    deletedCategory: response ? response : "Cannot delete product-category",
  });
});

module.exports = {
  createCategory,
  getCategories,
  updateCategory,
  deleteCategory,
};
