const express = require("express");
const Property = require("../models/Property");
const User = require("../models/User");
const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");

const router = express.Router();

/* ADD PROPERTY — with comprehensive validation */
router.post("/add", auth, role(["owner", "admin"]), async (req, res) => {
  try {
    const {
      title,
      propertyType,
      purpose,
      city,
      area,
      address,
      price,
      propertySize,
      propertySizeUnit,
      bhkType,
      bedrooms,
      bathrooms,
      furnishingStatus,
      floorNumber,
      totalFloors,
      availabilityStatus,
      availableFrom,
      ownershipType,
      amenities,
      description,
      images,
      ownershipProof
    } = req.body;

    // Validate required fields
    if (!title || !propertyType || !purpose || !city || !area || !address || !price || 
        propertySize === undefined || !bhkType || bedrooms === undefined || 
        bathrooms === undefined || !furnishingStatus || !ownershipType || !description) {
      return res.status(400).json({ 
        message: "All required fields must be provided" 
      });
    }

    // Validate property type
    const validPropertyTypes = ["Apartment", "Individual House", "Villa", "Plot", "House", "Land", "Commercial"];
    if (!validPropertyTypes.includes(propertyType)) {
      return res.status(400).json({ 
        message: "Invalid property type" 
      });
    }

    // Validate purpose
    if (!["Rent", "Sale"].includes(purpose)) {
      return res.status(400).json({ 
        message: "Invalid purpose. Must be 'Rent' or 'Sale'" 
      });
    }

    // Validate numeric fields
    if (price < 0 || propertySize < 0 || bedrooms < 0 || bathrooms < 0) {
      return res.status(400).json({ 
        message: "Price, size, and room counts must be positive" 
      });
    }

    // Validate floor numbers if provided
    if (floorNumber !== undefined && floorNumber < 0) {
      return res.status(400).json({ 
        message: "Floor number cannot be negative" 
      });
    }
    if (totalFloors !== undefined && totalFloors < 0) {
      return res.status(400).json({ 
        message: "Total floors cannot be negative" 
      });
    }

    // Validate availability status
    const validAvailabilityStatuses = ["Immediate", "From Date", "Available", "Sold", "Under Negotiation"];
    if (availabilityStatus && !validAvailabilityStatuses.includes(availabilityStatus)) {
      return res.status(400).json({ 
        message: "Invalid availability status" 
      });
    }

    // Validate availability date if status is "From Date"
    if (availabilityStatus === "From Date" && !availableFrom) {
      return res.status(400).json({ 
        message: "Available from date is required when availability status is 'From Date'" 
      });
    }

    // Validate ownership type
    if (!["Owner", "Builder", "Agent"].includes(ownershipType)) {
      return res.status(400).json({ 
        message: "Invalid ownership type" 
      });
    }

    // Validate furnishing status
    if (!["Furnished", "Semi-Furnished", "Unfurnished"].includes(furnishingStatus)) {
      return res.status(400).json({ 
        message: "Invalid furnishing status" 
      });
    }

    // Validate BHK type
    const validBhkTypes = ["1BHK", "2BHK", "3BHK", "4BHK", "5BHK+", "Studio"];
    if (!validBhkTypes.includes(bhkType)) {
      return res.status(400).json({ 
        message: "Invalid BHK type" 
      });
    }

    // Get user details for contact
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Create property with all details
    const property = new Property({
      title: title.trim(),
      propertyType,
      purpose,
      location: {
        city: city.trim(),
        area: area.trim(),
        address: address.trim()
      },
      price: Number(price),
      propertySize: {
        value: Number(propertySize),
        unit: propertySizeUnit || "sq.ft"
      },
      bhkType,
      bedrooms: Number(bedrooms),
      bathrooms: Number(bathrooms),
      furnishingStatus,
      floorNumber: floorNumber !== undefined && floorNumber !== "" ? Number(floorNumber) : undefined,
      totalFloors: totalFloors !== undefined && totalFloors !== "" ? Number(totalFloors) : undefined,
      availabilityStatus: availabilityStatus || "Immediate",
      availableFrom: availableFrom ? new Date(availableFrom) : undefined,
      ownershipType,
      amenities: amenities || {
        parking: false,
        waterSupply: false,
        powerBackup: false,
        lift: false
      },
      description: description.trim(),
      images: images || [],
      ownershipProof: ownershipProof || undefined,
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
    res.status(500).json({ message: "Error fetching properties" });
  }
});

/* GET PROPERTY BY ID */
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

/* GET OWNER'S PROPERTIES */
router.get("/owner/:ownerId", async (req, res) => {
  try {
    const properties = await Property.find({ owner: req.params.ownerId });
    res.json(properties);
  } catch (err) {
    res.status(500).json({ message: "Error fetching owner properties" });
  }
});

/* UPDATE PROPERTY */
router.put("/:id", auth, role(["owner", "admin"]), async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    // Check if user is owner or admin
    if (property.owner.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to update this property" });
    }

    const updatedProperty = await Property.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
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
    res.status(500).json({ 
      message: "Error deleting property",
      error: err.message 
    });
  }
});

module.exports = router;
