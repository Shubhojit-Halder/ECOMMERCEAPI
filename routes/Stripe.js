// This is your test secret API key.
const stripe = require("stripe")(
  "sk_test_51NL9zRSCTLZQuHdTjrw0lxdqvTxPgxiqSOXI19KEpqQNfmd7ELvrlTZ83ZQz80CPYXjxTKG4gQTwDpNsaIrPFlXV00bKcnvvl8"
);
const router = require("express").Router();
router.post("/payment", async (req, res) => {
  const line_items = req.body.map((item) => {
    return {
      price_data: {
        currency: "inr",
        product_data: {
          name: `${item.brand}${item.desc}-${item.color}`,
          images: [item.img],
          metadata: { id: item._id },
        },
        unit_amount: item.price * 100,
      },
      quantity: item.quantity,
    };
  });
  const session = await stripe.checkout.sessions.create({
    shipping_address_collection: {
      allowed_countries: ["IN"],
    },
    shipping_options: [
      {
        shipping_rate_data: {
          type: "fixed_amount",
          fixed_amount: {
            amount: 0,
            currency: "inr",
          },
          display_name: "Free shipping",
          delivery_estimate: {
            minimum: {
              unit: "business_day",
              value: 5,
            },
            maximum: {
              unit: "business_day",
              value: 7,
            },
          },
        },
      },
      {
        shipping_rate_data: {
          type: "fixed_amount",
          fixed_amount: {
            amount: 1500,
            currency: "inr",
          },
          display_name: "Next day air",
          delivery_estimate: {
            minimum: {
              unit: "business_day",
              value: 1,
            },
            maximum: {
              unit: "business_day",
              value: 1,
            },
          },
        },
      },
    ],
    phone_number_collection: {
      enabled: true,
    },

    line_items,
    mode: "payment",
    success_url: "http://localhost:5173/success",
    cancel_url: "http://localhost:5173/cancel",
  });
  res.send({ url: session.url });
});

module.exports = router;
// app.listen(4242, () => console.log('Running on port 4242'));
