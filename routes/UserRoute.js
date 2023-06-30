const User = require("../models/UserModel");
const { verifyAndAuthorization, verifyAdmin } = require("./verifyToken");

const router = require("express").Router();

//UPDATE USER DETAILS
router.put("/:id", verifyAndAuthorization, async (req, res) => {
  if (req.body.password) {
    //re-encrypting password if password is changed
    req.body.password = CryptoJs.AES.encrypt(
      req.body.password,
      process.env.PASS_KEY
    ).toString();
  }

  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      {
        $set: req.body,
      },
      { new: true }
    );
    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json(err);
  }
});

//DELETE USER
router.delete("/:id", verifyAndAuthorization, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json("User has been deleted");
  } catch (error) {
    res.status(500).json(error);
  }
});

//GET USER
router.post("/find/:id", verifyAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    res.status(200).json(user);
  } catch (error) {
    res.status(501).json(error);
  }
});

//GET ALL USERS
router.post("/", verifyAdmin, async (req, res) => {
  try {
    const query = req.query.new;
    const users = query
      ? await User.find().sort({ _id: -1 }).limit(5) //limited latest users will be fetched is query is true
      : await User.find(); //all users are fetched
    res.status(200).json(users);
  } catch (error) {
    res.status(501).json(error);
  }
});

//GET USER STATS
router.post("/stats", verifyAdmin, async (req, res) => {
  const date = new Date();
  const lastYear = new Date(date.setFullYear(date.getFullYear() - 1));
  try {
    const data = await User.aggregate([
      { $match: { createdAt: { $gte: lastYear } } },
      {
        $project: {
          month: { $month: "$createdAt" },
        },
      },
      {
        $group: {
          _id: "$month",
          total: { $sum: 1 },
        },
      },
    ]);
    res.status(200).json(data);
  } catch (error) {
    res.status(501).json(error);
  }
});

module.exports = router;
