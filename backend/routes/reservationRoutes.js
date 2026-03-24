const express = require("express");
const Reservation = require("../models/Reservation");

const router = express.Router();

router.post("/test-reservation", async (req, res) => {
  try {
    const reservation = await Reservation.create({
      userId: req.body.userId,
      listingId: req.body.listingId,
      startDate: req.body.startDate,
      endDate: req.body.endDate,
      totalPrice: req.body.totalPrice,
    });

    res.status(201).json(reservation);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
