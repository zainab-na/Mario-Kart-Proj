console.log('STRIPE KEY:', process.env.STRIPE_SECRET_KEY);
const express = require("express");
const Stripe = require("stripe");

const router = express.Router();

const stripe = Stripe(
    process.env.STRIPE_SECRET_KEY
);

router.post(
    "/create-checkout-session",
    async (req, res) => {

        try {

            const {
    playerName,
    teamName,
    gameId
} = req.body;

const session =
await stripe.checkout.sessions.create({

                payment_method_types: ["card"],

                mode: "payment",

                metadata: {
    playerName,
    teamName,
    gameId
},

                line_items: [
                    {
                        price_data: {

                            currency: "usd",

                            product_data: {
                                name:
                                "Mario Kart Tournament Registration"
                            },

                            unit_amount: 1000
                        },

                        quantity: 1
                    }
                ],

                success_url: 'https://mario-kart-proj-production.up.railway.app/tournament.html',
cancel_url: 'https://mario-kart-proj-production.up.railway.app/tournament.html',
            });

            res.json({
                url: session.url
            });

        } catch (error) {

            console.error(error);

            res.status(500).json({
                error:
                "Stripe session creation failed"
            });

        }

    }
);

module.exports = router;