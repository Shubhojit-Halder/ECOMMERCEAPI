const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const userRoute = require("./routes/UserRoute");
const authRoute = require("./routes/Auth");
const productRoute = require("./routes/ProductRoute");
const cartRoute = require("./routes/CartRoute");
const orderRoute = require("./routes/OrderRoute");
const stripeRoute = require("./routes/Stripe");
const cors = require("cors");
const bodyParser = require("body-parser");
dotenv.config();

const port = process.env.PORT || 5000;
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log("db is succesfully connected");
  })
  .catch((err) => {
    console.log(err);
  });

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.json());
app.use("/api/auth", authRoute);
app.use("/api/user", userRoute);
app.use("/api/product", productRoute);
app.use("/api/cart", cartRoute);
app.use("/api/order", orderRoute);
app.use("/api/checkout", stripeRoute);
app.listen(port, () => {
  console.log(`Server is running in port ${port}`);
});
