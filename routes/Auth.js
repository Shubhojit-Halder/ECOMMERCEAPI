const router = require("express").Router();
const User = require("../models/UserModel");
const CryptoJs = require("crypto-js");
const jwt = require("jsonwebtoken");
//REGISTER USER
router.post("/register", async (req, res) => {
  const newUser = new User({
    username: req.body.username,
    email: req.body.email,
    fullname:req.body.fullname,
    mobile:req.body.mobile,
    password: CryptoJs.AES.encrypt(
      req.body.password,
      process.env.PASS_KEY
    ).toString(),
  });
  try {
    const savedUser = await newUser.save();
    res.status(201).send(savedUser);
  } catch (error) {
    res.status(500).send(error);
  }
});

//LOGIN
router.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ username: req.body.username });
    if (!user) return res.status(401).json("wrong credentials");
    const hashedPassword = CryptoJs.AES.decrypt(
      user.password,
      process.env.PASS_KEY
    );
    const OG_password = hashedPassword.toString(CryptoJs.enc.Utf8);

    if (OG_password !== req.body.password)
      return res.status(401).json("wrong credentials");

    const accessToken = jwt.sign(
      {
        id: user._id,
        isAdmin: user.isAdmin,
      },
      process.env.JWT_PASSKEY,
      { expiresIn: "3d" }
    );

    const { password, ...others } = user._doc; //destructuring the user data received from db
    res.status(201).json({...others,accessToken});//JWT Token is inserted in the db;
  } catch (error) {
    res.status(500).json(error);
  }
});
module.exports = router;
