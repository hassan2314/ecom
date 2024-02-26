const express = require("express");
const router = express.Router();
const { Category } = require("../models/Category");

router.get("/", async (req, res) => {
  const categoryList = await Category.find();
  res.send(categoryList);
});

router.get("/:id", async (req, res) => {
  try {
    const categoryList = await Category.findById(req.params.id);
    if (categoryList) res.send(categoryList);
    else res.status(404).json({ message: "Category not found" });
  } catch (error) {
    res.status(404).json({ message: "Category not found" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const categoryList = await Category.findByIdAndUpdate(
      req.params.id,
      { name: req.body.name },
      { new: true },
    );
    if (categoryList) res.send(categoryList);
    else res.status(404).json({ message: "Category not found" });
  } catch (error) {
    res.status(404).json({ message: "Category not found" });
  }
});

router.post("/", async (req, res) => {
  let category = new Category({
    name: req.body.name,
  });
  category = await category.save();

  if (!category) return res.status(404).send("Try Again");
  else res.send(category);
});

router.delete("/:id", async (req, res) => {
  try {
    const result = await Category.findOneAndDelete({ _id: req.params.id });

    if (result) {
      // console.log('Category deleted successfully:', result);
      res.status(200).json({ message: "Category deleted successfully" });
    } else {
      // console.log('Category not found.');
      res.status(404).json({ message: "Category not found" });
    }
  } catch (error) {
    //console.error('Error deleting category:', error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
