const express = require("express");
const router = express.Router();
const { Product } = require("../models/Product");
const { Category } = require("../models/Category");
const mongoose = require("mongoose");
const multer = require("multer");

const File_Type_Map = {
  "image/png": "png",
  "image/jpeg": "jpeg",
  "image/jpg": "jpg",
};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const isValid = File_Type_Map[file.mimetype];
    let uploadError = new Error('Invalid Type Image')

    if(isValid){
      uploadError = null;
    }
    cb(uploadError, "public/uploads");

  },
  filename: function (req, file, cb) {
    const filename = file.originalname.replace(" ", "-");
    const extension = File_Type_Map[file.mimetype];
    cb(null, `${filename}-${Date.now()}.${extension}`);

  },
});

const uploadOptions = multer({ storage: storage });

router.get("/", async (req, res) => {
  const productList = await Product.find().populate("category"); //.select('name image -_id)
  res.send(productList);
});

router.get("/categories", async (req, res) => {
  let filter = {};
  if (req.query.categories) {
    filter = { category: { $in: req.query.categories.split(",") } };
  }
  try {
    const productList = await Product.find(filter).populate("category");
    //console.warn(productList);
    if (productList.length > 0) {
      res.send(productList);
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const productList = await Product.findById(req.params.id);
    if (productList) res.send(productList);
    else res.status(404).json({ message: "Product not found" });
  } catch (error) {
    res.status(404).json({ message: "Product not found" });
  }
});

router.post("/", uploadOptions.single("image"), async (req, res) => {
  const category = await Category.findById(req.body.category);
  if (!category) {
    return res.status(404).json({ message: "Category not found" });
  }

  const file = req.file;
  if (!file) {
    return res.status(404).json({ message: "Image not found" });
  }

  const filename = req.file.fieldname;
  const basePath = `${req.protocol}://${req.get("host")}/public/upload/`;
  let product = new Product({
    name: req.body.name,
    description: req.body.description,
    image: `${basePath}${filename}`, //https://localhost:4500/public/upload//image-2322
    //images: req.body.images,
    brand: req.body.brand,
    price: req.body.price,
    category: req.body.category,
    countInStock: req.body.countInStock,
    rating: req.body.rating,
    numReviews: req.body.numReviews,
    isFeatured: req.body.isFeatured,
  });
  product = await product.save();

  if (!product) return res.status(404).send("Try Again");
  else res.send(product);
});

router.put("/:id", async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(404).json({ message: " Inavalid Product ID" });
  }
  try {
    const category = await Category.findById(req.body.category);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    let productList = await Product.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        description: req.body.description,
        image: req.body.image,
        //images: req.body.images,
        brand: req.body.brand,
        price: req.body.price,
        category: req.body.category,
        countInStock: req.body.countInStock,
        rating: req.body.rating,
        numReviews: req.body.numReviews,
        isFeatured: req.body.isFeatured,
      },
      { new: true },
    );
    if (productList) res.send(productList);
    else res.status(404).json({ message: "Product not found" });
  } catch (error) {
    res.status(404).json({ message: "Product not found" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const result = await Product.findOneAndDelete({ _id: req.params.id });

    if (result) {
      // console.log('product deleted successfully:', result);
      res.status(200).json({ message: "Product deleted successfully" });
    } else {
      // console.log('Product not found.');
      res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    //console.error('Error deleting Product:', error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/get/count", async (req, res) => {
  try {
    const productListCount = await Product.countDocuments();
    res.json({ Count: productListCount });
  } catch (error) {
    console.error("Error getting product count:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/get/featured/:id", async (req, res) => {
  const count = req.params.id ? req.params.id : 0;
  try {
    const products = await Product.find({ isFeatured: true }).limit(+count);
    res.json({ products });
  } catch (error) {
    console.error("Error getting product :", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.put("/galery/images/:id",uploadOptions.array('images',5), async(req,res)=>{
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(404).json({ message: " Inavalid Product ID" });
  }
  const files= req.files;
  let paths= []
  const basePath = `${req.protocol}://${req.get("host")}/public/uploads/`;
  if(files){
    files.map(file=>{
      paths.push(`${basePath}${file.filename}`)
    })
  }
  try {
    const productList = await Product.findByIdAndUpdate(
      req.params.id,
      {
        images: paths,
      },
      { new: true },
    );
    if (productList) res.send(productList);
    else res.status(404).json({ message: "Order not found" });
  }
  catch(error){}
      
  

})

module.exports = router;
