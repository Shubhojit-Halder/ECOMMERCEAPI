const mongoose = require("mongoose");
const OrderSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    products: [
      {
        _id: {
          type: String,
        },
        size:{
          type:String,
        },
        color:{
          type:String,
        },
        quantity: {
          type: Number,
          default: 1,
        },
        price:{
          type:Number
        }
      },
    ],
    amount: { type: Number, required: true },
    address: { type: Object, require: true },
    status: { type: String, default: "pending" },
    phone:{type:String,required:true},
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", OrderSchema);
