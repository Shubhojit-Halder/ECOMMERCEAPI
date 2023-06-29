const Product = require("../models/ProductModel");
const { verifyAndAuthorization, verifyAdmin } = require("./verifyToken");

const router = require("express").Router();

//CREATE
router.post("/", verifyAdmin, async (req, res) => {
  const newProduct = new Product(req.body);
  try {
    const savedProduct = await newProduct.save();
    res.status(200).send(savedProduct);
  } catch (error) {
    res.status(500).send(err);
  }
});

//UPDATE Product
router.put("/:id", verifyAdmin, async (req, res) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      {
        $set: req.body,
      },
      { new: true }
    );
    res.status(200).json(updatedProduct);
  } catch (error) {
    res.status(500).json(err);
  }
});

//DELETE
router.delete("/:id", verifyAdmin, async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.status(200).json("Product has been deleted");
  } catch (error) {
    res.status(500).json(error);
  }
});

//GET Product
router.get("/find/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    res.status(200).json(product);
  } catch (error) {
    res.status(501).json(error);
  }
});

//GET ALL PRODUCTS
router.get("/", async (req, res) => {
  const latest = req.query.new;
  const category = req.query.category;
  try {
    let products;
    if (latest) {
      products = await Product.find()
        .sort({
          createdAt: -1,
        })
        .limit(8);
    } else if (category) {
      products = await Product.find({
        categories:{
            $in:[category]
        }
      });
    } else {
      products = await Product.find();
    }

    res.status(200).json(products);
  } catch (error) {
    res.status(501).json(error);
  }
});

module.exports = router;
