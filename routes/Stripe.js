//run in cmd-> stripe listen --forward-to localhost:5000/api/checkout/webhook
// This is your test secret API key.
const Order = require("../models/OrderModel");
const stripe = require("stripe")(
  "sk_test_51NL9zRSCTLZQuHdTjrw0lxdqvTxPgxiqSOXI19KEpqQNfmd7ELvrlTZ83ZQz80CPYXjxTKG4gQTwDpNsaIrPFlXV00bKcnvvl8"
);
const router = require("express").Router();
const express = require("express");
router.post("/payment", async (req, res) => {
  console.log(req.body.userId);
  const customer = await stripe.customers.create({
    metadata: {
      cart: JSON.stringify(req.body.productData),
    },
    description: req.body.userId,
  });
  const line_items = req.body.products.map((item) => {
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
            amount: 25000,
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
    customer: customer.id,
    mode: "payment",
    success_url: "http://localhost:5173/successful",
    cancel_url: "https://localhost:5173/cart",
  });
  res.send({ url: session.url });
});

// Creating a order after successful completion
const createOrder = async (customer, data) => {
  // const Items = JSON.parse(customer.metadata.cart);
  const newOrder = new Order({
    userId: customer.description,
    products: [...JSON.parse(customer.metadata.cart)],
    amount: data.amount_total,
    address: data.customer_details.address,
    phone:data.customer_details.phone
  });
  try{
    const savedOrder = await newOrder.save();
    console.log(savedOrder);
  }catch(error){
    console.log(error);
  }
};
// This is your Stripe CLI webhook secret for testing your endpoint locally.
const endpointSecret = 0;
// "whsec_c5839d6eba648e31b3f136a2abed6e22c45b93735eae143105132137a5ee3d2b";

router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  (req, res) => {
    const sig = req.headers["stripe-signature"];

    let data;
    let eventType;
    if (endpointSecret) {
      var event;
      try {
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
        console.log("webhook verified");
      } catch (err) {
        console.log("webhook verification failed");
        res.status(400).send(`Webhook Error: ${err.message}`);
        return;
      }
      data = event.data.object;
      eventType = event.type;
    } else {
      data = req.body.data.object;
      eventType = req.body.type;
    }

    // Handle the event
    if (eventType === "checkout.session.completed") {
      stripe.customers
        .retrieve(data.customer)
        .then((customer) => {
          console.log(customer);
          console.log("data:", data);
          createOrder(customer,data);
        })
        .catch((err) => console.log(err.message));
    }
    // switch (event.type) {
    //   case "payment_intent.succeeded":
    //     const paymentIntentSucceeded = event.data.object;
    //     // Then define and call a function to handle the event payment_intent.succeeded
    //     break;
    //   // ... handle other event types
    //   default:
    //     console.log(`Unhandled event type ${event.type}`);
    // }

    // Return a 200 res to acknowledge receipt of the event
    res.send().end();
  }
);

module.exports = router;
// app.listen(4242, () => console.log('Running on port 4242'));
