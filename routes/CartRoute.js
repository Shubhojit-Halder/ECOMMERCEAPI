const Cart = require("../models/CartModel");
const { verifyAndAuthorization, verifyAdmin, verifyToken } = require("./verifyToken");

const router = require("express").Router();

//CREATE
router.post("/", verifyToken, async (req, res) => {
  const newCart = new Cart(req.body);
  try {
    const savedCart = await newCart.save();
    res.status(200).send(savedCart);
  } catch (error) {
    res.status(500).send(error);
  }
});

//UPDATE Product
router.put("/:id", verifyAndAuthorization, async (req, res) => {
  try {
    const updatedCart = await Cart.findByIdAndUpdate(
      req.params.id,
      {
        $set: req.body,
      },
      { new: true }
    );
    res.status(200).json(updatedCart);
  } catch (error) {
    res.status(500).json(err);
  }
});

//DELETE
router.delete("/:id", verifyAndAuthorization, async (req, res) => {
  try {
    await Cart.findByIdAndDelete(req.params.id);
    res.status(200).json("Product has been deleted");
  } catch (error) {
    res.status(500).json(error);
  }
});

//GET User Cart
router.post("/find/:id",verifyAndAuthorization, async (req, res) => {
  try {
    const cart = await Cart.findOne({userId: req.params.id});
    res.status(200).json(cart);
  } catch (error) {
    res.status(501).json(error);
    console.log("Whyyy!!!");
  }
});

//GET ALL 
router.get("/",verifyAdmin,async(req,res)=>{
    try {
        const carts = await Cart.find();
        res.status(200).json(carts);
    } catch (error) {
        res.status(500).json(error);
    }
})

module.exports = router;
