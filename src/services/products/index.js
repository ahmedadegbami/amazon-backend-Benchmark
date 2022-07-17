import express from "express";
import createError from "http-errors";
import q2m from "query-to-mongo";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import ProductModel from "./models.js";

const productRouter = express.Router();

const cloudinaryUploader = multer({
  storage: new CloudinaryStorage({
    cloudinary,
    params: {
      folder: "strive/amazon"
    }
  }),
  fileFilter: (req, file, multerNext) => {
    if (file.mimetype !== "image/jpeg") {
      multerNext(createError(400, "Only jpeg allowed!"));
    } else {
      multerNext(null, true);
    }
  },
  limits: { fileSize: 1 * 1024 * 1024 } // file size
}).single("imageUrl");

//END POINT TO POST PRODUCTS
productRouter.post("/", async (req, res, next) => {
  try {
    const product = await ProductModel.create(req.body);
    res.json(product);
  } catch (err) {
    next(err);
  }
});

//END POINT TO GET PRODUCTS

productRouter.get("/", async (req, res, next) => {
  try {
    const mongoQuery = q2m(req.query);
    const total = await ProductModel.countDocuments(mongoQuery.criteria);

    const product = await ProductModel.find(
      mongoQuery.criteria,
      mongoQuery.options.fields
    )
      .skip(mongoQuery.options.skip)
      .limit(mongoQuery.options.limit)
      .sort(mongoQuery.options.sort)
      .populate({
        path: "reviews",
        select: "comment rate"
      });
    res.send({
      links: mongoQuery.links(process.env.MY_ENDPOINT, total),
      total,
      totalPages: Math.ceil(total / mongoQuery.options.limit),
      product
    });
  } catch (error) {
    next(error);
  }
});

//END POINT TO GET PRODUCT BY ID

productRouter.get("/:productId", async (req, res, next) => {
  try {
    const product = await ProductModel.findById(req.params.productId).populate({
      path: "reviews",
      select: "comment rate"
    });
    if (product) {
      res.send(product);
    } else {
      next(
        createError(
          404,
          `Product with the id ${req.params.productId} not found`
        )
      );
    }
  } catch (error) {
    next(error);
  }
});

// END POINT TO UPDATE PRODUCT BY ID
productRouter.put("/:productId", async (req, res, next) => {
  try {
    const modifyProduct = await ProductModel.findByIdAndUpdate(
      req.params.productId,
      req.body,
      { new: true, runValidators: true }
    );
    if (modifyProduct) {
      res.send(modifyProduct);
    } else {
      next(
        createError(
          404,
          `Product with the id ${req.params.productId} not found`
        )
      );
    }
  } catch (error) {
    next(error);
  }
});

// END POINT TO DELETE PRODUCT BY ID
productRouter.delete("/:productId", async (req, res, next) => {
  try {
    const deletedProduct = await ProductModel.findByIdAndDelete(
      req.params.productId
    );
    if (deletedProduct) {
      res.status(204).send();
    } else {
      next(
        createError(
          404,
          `Product with the id ${req.params.productId} not found`
        )
      );
    }
  } catch (error) {
    next(error);
  }
});

// END POINT TO UPLOAD IMAGE TO PRODUCT

productRouter.post(
  "/:productId/imageUrl",
  cloudinaryUploader,
  async (req, res, next) => {
    try {
      const product = await ProductModel.findByIdAndUpdate(
        req.params.productId,
        { imageUrl: req.file.path },
        { new: true, runValidators: true }
      );
      res.send(product);
    } catch (error) {
      next(error);
    }
  }
);

//// We need only one end point "get" for reviews
productRouter.get("/:productId/reviews", async (req, res, next) => {
  // get reviews for all product
  try {
    const product = await ProductModel.findById(req.params.productId).populate({
      path: "reviews",
      select: "comment rate"
    });
    if (product) {
      res.send(product.reviews);
    } else {
      next(
        createError(
          404,
          `Product with the id ${req.params.productId} not found`
        )
      );
    }
  } catch (error) {
    next(error);
  }
});

productRouter.get("/:productId/", async (req, res, next) => {
  try {
    const product = await ProductModel.findById(req.params.productId).populate({
      path: "reviews",
      select: "comment rate"
    });
    if (product) {
      res.send(product);
    } else {
      next(
        createError(
          404,
          `Product with the id ${req.params.productId} not found`
        )
      );
    }
  } catch (error) {
    next(error);
  }
});

export default productRouter;
