const Order = require("../models/OrderModel");
const {
  verifyAndAuthorization,
  verifyAdmin,
  verifyToken,
} = require("./verifyToken");

const router = require("express").Router();

//CREATE
router.post("/", verifyAndAuthorization, async (req, res) => {
  const newOrder = new Order(req.body);
  try {
    const savedOrder = await newOrder.save();
    res.status(200).send(savedOrder);
  } catch (error) {
    res.status(500).send(error);
  }
});

//UPDATE order
router.put("/:id", verifyAdmin, async (req, res) => {
  try {
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      {
        $set: req.body,
      },
      { new: true }
    );
    res.status(200).json(updatedOrder);
  } catch (error) {
    res.status(500).json(err);
  }
});

//DELETE
router.delete("/:id", verifyAdmin, async (req, res) => {
  try {
    await Order.findByIdAndDelete(req.params.id);
    res.status(200).json("Order has been deleted");
  } catch (error) {
    res.status(500).json(error);
  }
});

//GET User Order
router.get("/find/:userId", verifyAndAuthorization, async (req, res) => {
  try {
    const order = await Order.find({ userId: req.params.userId });
    res.status(200).json(order);
  } catch (error) {
    res.status(501).json(error);
  }
});

//Get single order 
router.post("/:id",verifyAndAuthorization,async(req,res)=>{
  try {
    const order = await Order.findById(req.params.id);
    res.status(200).json(order);
  } catch (error) {
    res.status(500).json(error);
  }
})

//GET ALL
router.post("/get/all", verifyAdmin, async (req, res) => {
  try {
    const orders = await Order.find();
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json(error);
  }
});


//Get MONTHLY INCOME
router.post("/monthly/income",verifyAdmin, async (req, res) => {
  const date = new Date();
  const lastMonth = new Date(date.setMonth(date.getMonth() - 1));
  const lastTolastMonth = new Date(lastMonth.setMonth(lastMonth.getMonth() - 1));
  try {
    const income = await Order.aggregate([
      { $match: { createdAt: { $gte: lastTolastMonth } } },
      {
        $project: {
          month: { $month: "$createdAt" },
          sales:"$amount",
        },
      },
      {
        $group: {
          _id: "$month",
          total: { $sum: "$sales" },
        },
      },
    ]);
    res.status(200).send(income);
  } catch (error) {
    res.status(502).json(error);
  }
});

module.exports = router;
