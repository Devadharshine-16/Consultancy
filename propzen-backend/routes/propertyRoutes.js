const express = require("express");
const Property = require("../models/Property");
const User = require("../models/User");
const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");

const router = express.Router();

/* ADD PROPERTY — supports both full and simplified (Owner Dashboard) format */
router.post("/add", auth, role(["owner", "admin"]), async (req, res) => {
  try {
    const {
      title,
      propertyType,
      city,
      area,
      address,
      location,
      price,
      propertySize,
      propertySizeUnit,
      bedrooms,
      bathrooms,
      availabilityStatus,
      description,
      images
    } = req.body;

    // Minimum required: title, price, description
    if (!title || !title.trim()) {
      return res.status(400).json({ message: "Property title is required" });
    }
    if (price === undefined || price === null || price === "") {
      return res.status(400).json({ message: "Price is required" });
    }
    const priceNum = Number(price);
    if (isNaN(priceNum) || priceNum < 0) {
      return res.status(400).json({ message: "Valid price is required" });
    }
    if (!description || !description.trim()) {
      return res.status(400).json({ message: "Description is required" });
    }

    // Normalize location input: support either location string or structured location object
    let locationCity = "";
    let locationArea = "";
    let locationAddress = "";

    if (typeof location === "string") {
      locationCity = location.trim();
      locationArea = location.trim();
      locationAddress = location.trim();
    } else if (location && typeof location === "object") {
      locationCity = (location.city || "").trim();
      locationArea = (location.area || "").trim();
      locationAddress = (location.address || "").trim();
    }

    const finalCity = (city && city.trim()) || locationCity || "Not specified";
    const finalArea = (area && area.trim()) || locationArea || "Not specified";
    const finalAddress = (address && address.trim()) || locationAddress || "Not specified";
    const finalPropertyType = propertyType && ["House", "Apartment", "Land", "Commercial"].includes(propertyType)
      ? propertyType
      : "House";
    const finalPropertySize = propertySize !== undefined && propertySize !== null
      ? Number(propertySize)
      : 0;
    const finalBedrooms = bedrooms !== undefined && bedrooms !== null ? Number(bedrooms) : 0;
    const finalBathrooms = bathrooms !== undefined && bathrooms !== null ? Number(bathrooms) : 0;

    if (finalPropertySize < 0 || finalBedrooms < 0 || finalBathrooms < 0) {
      return res.status(400).json({
        message: "Property size, bedrooms, and bathrooms must be 0 or positive"
      });
    }

    if (availabilityStatus &&
        !["Available", "Sold", "Under Negotiation"].includes(availabilityStatus)) {
      return res.status(400).json({ message: "Invalid availability status" });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const property = new Property({
      title: title.trim(),
      propertyType: finalPropertyType,
      location: {
        city: finalCity,
        area: finalArea,
        address: finalAddress
      },
      price: priceNum,
      propertySize: {
        value: finalPropertySize,
        unit: propertySizeUnit || "sq.ft"
      },
      bedrooms: finalBedrooms,
      bathrooms: finalBathrooms,
      availabilityStatus: availabilityStatus || "Available",
      description: description.trim(),
      images: Array.isArray(images) ? images : [],
      owner: req.user.id,
      contactDetails: {
        name: user.name,
        email: user.email,
        phone: user.phone || ""
      }
    });

    await property.save();

    const populatedProperty = await property.populate("owner");

    res.status(201).json({ 
      message: "Property added successfully! ✅",
      property: populatedProperty 
    });
  } catch (err) {
    console.error("Error adding property:", err);
    res.status(500).json({ 
      message: "Error adding property",
      error: err.message 
    });
  }
});

/* GET ALL PROPERTIES */
router.get("/", async (req, res) => {
  try {
    const properties = await Property.find().populate("owner", "name email");
    res.json(properties);
  } catch (err) {
    console.error("Error fetching all properties:", err);
    res.status(500).json({ message: "Error fetching properties" });
  }
});

/* GET OWNER'S PROPERTIES - /owner/me must come before /owner/:ownerId - optimized */
router.get("/owner/me", auth, role(["owner", "admin"]), async (req, res) => {
  try {
    const properties = await Property.find({ owner: req.user.id })
      .select("title propertyType location price propertySize bedrooms bathrooms availabilityStatus images createdAt")
      .lean()
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(properties);
  } catch (err) {
    res.status(500).json({ message: "Error fetching properties", error: err.message });
  }
});

/* GET PROPERTIES BY OWNER ID */
router.get("/owner/:ownerId", async (req, res) => {
  try {
    const properties = await Property.find({ owner: req.params.ownerId });
    res.json(properties);
  } catch (err) {
    res.status(500).json({ message: "Error fetching owner properties" });
  }
});

/* GET PROPERTY BY ID - must be last to avoid matching /owner/me etc */
router.get("/:id", async (req, res) => {
  try {
    const property = await Property.findById(req.params.id).populate("owner");
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }
    res.json(property);
  } catch (err) {
    res.status(500).json({ message: "Error fetching property" });
  }
});

/* UPDATE PROPERTY — supports simplified format (title, location, price, description, images) */
router.put("/:id", auth, role(["owner", "admin"]), async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    if (property.owner.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to update this property" });
    }

    let update = { ...req.body };
    delete update.owner; // prevent changing owner

    // Handle simplified format: location as string or structured object
    if (update.location) {
      if (typeof update.location === "string") {
        const loc = update.location.trim();
        update.location = {
          city: loc || property.location?.city || "Not specified",
          area: update.area || property.location?.area || "Not specified",
          address: loc || property.location?.address || "Not specified"
        };
      } else if (typeof update.location === "object") {
        update.location = {
          city: (update.location.city || property.location?.city || "Not specified").trim(),
          area: (update.location.area || property.location?.area || "Not specified").trim(),
          address: (update.location.address || property.location?.address || "Not specified").trim()
        };
      }
      delete update.area;
    }

    if (update.price !== undefined) update.price = Number(update.price);
    if (Array.isArray(update.images)) { /* keep as is */ }
    update.updatedAt = Date.now();

    const updatedProperty = await Property.findByIdAndUpdate(
      req.params.id,
      update,
      { new: true }
    ).populate("owner");

    res.json({ 
      message: "Property updated successfully",
      property: updatedProperty 
    });
  } catch (err) {
    res.status(500).json({ 
      message: "Error updating property",
      error: err.message 
    });
  }
});

/* DELETE PROPERTY */
router.delete("/:id", auth, role(["owner", "admin"]), async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    // Check if user is owner or admin
    if (property.owner.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to delete this property" });
    }

    await Property.findByIdAndDelete(req.params.id);
    res.json({ message: "Property deleted successfully" });
  } catch (err) {
    console.error("Error during property deletion:", err);
    res.status(500).json({ 
      message: "Error deleting property",
      error: err.message 
    });
  }
});

module.exports = router;
