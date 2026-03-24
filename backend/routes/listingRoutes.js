const express = require("express");
const Listing = require("../models/Listing");

const router = express.Router();

router.post("/test-listing", async (req, res) => {
  try {
    const listing = await Listing.create({
      title: req.body.title,
      description: req.body.description,
      imageSrc: req.body.imageSrc,
      category: req.body.category,
      roomCount: req.body.roomCount,
      bathroomCount: req.body.bathroomCount,
      guestCount: req.body.guestCount,
      locationValue: req.body.locationValue,
      userId: req.body.userId,
      price: req.body.price,
    });

    res.status(201).json(listing);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
