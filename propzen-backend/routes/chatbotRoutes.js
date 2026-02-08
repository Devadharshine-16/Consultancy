const express = require("express");
const Property = require("../models/Property");
const router = express.Router();

/**
 * Chatbot Query Parser
 * Converts natural language input into MongoDB query filters
 */
function parseChatbotQuery(userInput) {
  const input = userInput.toLowerCase().trim();
  const query = {};
  const filters = {
    location: null,
    budget: null,
    bhk: null,
    propertyType: null,
    purpose: null
  };

  // Common city names (can be extended)
  const cities = [
    "coimbatore", "chennai", "bangalore", "mumbai", "delhi", "pune", 
    "hyderabad", "kolkata", "ahmedabad", "jaipur", "lucknow", "kanpur",
    "nagpur", "indore", "thane", "bhopal", "visakhapatnam", "patna",
    "vadodara", "ghaziabad", "ludhiana", "agra", "nashik", "faridabad"
  ];

  // Extract location
  for (const city of cities) {
    if (input.includes(city)) {
      filters.location = city;
      break;
    }
  }

  // Extract area/neighborhood (look for "in [area]" pattern)
  const inMatch = input.match(/in\s+([a-z\s]+?)(?:\s|$|,|under|below|above|over|less|more|bhk|1|2|3|4|5)/i);
  if (inMatch && !filters.location) {
    const area = inMatch[1].trim();
    if (area && area.length > 2) {
      filters.location = area;
    }
  }

  // Extract budget keywords - improved patterns
  const budgetPatterns = [
    // Match "under 20000", "below 15000", "less than 20000", etc.
    /(?:under|below|less than|upto|max|maximum|within)\s*(?:rs\.?|₹|rupees?|of)?\s*(\d+[,\d]*)/i,
    // Match "above 20000", "over 15000", "more than 20000", etc.
    /(?:above|over|more than|min|minimum|from|at least)\s*(?:rs\.?|₹|rupees?|of)?\s*(\d+[,\d]*)/i,
    // Match "between 10000 and 20000", "range 10k to 20k", etc.
    /(?:between|range)\s*(?:rs\.?|₹|rupees?)?\s*(\d+[,\d]*)\s*(?:and|to|-)\s*(\d+[,\d]*)/i,
    // Match "2 lakh", "5 lac", "10 thousand", "20k", etc.
    /(?:rs\.?|₹|rupees?)?\s*(\d+[,\d]*)\s*(?:lakh|lac|thousand|k)/i,
    // Match standalone numbers that might be prices (if no other context)
    /(?:price|cost|budget|rs\.?|₹|rupees?)\s*(?:is|of|at)?\s*(\d+[,\d]*)/i
  ];

  for (const pattern of budgetPatterns) {
    const match = input.match(pattern);
    if (match) {
      if (pattern.source.includes("between") || pattern.source.includes("range")) {
        const min = parseInt(match[1].replace(/,/g, ""));
        const max = parseInt(match[2].replace(/,/g, ""));
        filters.budget = { min, max };
      } else if (pattern.source.includes("above") || pattern.source.includes("over") || 
                 pattern.source.includes("min") || pattern.source.includes("at least")) {
        const min = parseInt(match[1].replace(/,/g, ""));
        // Handle lakh/lac conversion
        if (input.includes("lakh") || input.includes("lac")) {
          filters.budget = { min: min * 100000 };
        } else if (input.includes("thousand") || input.includes("k")) {
          filters.budget = { min: min * 1000 };
        } else {
          filters.budget = { min };
        }
      } else {
        const max = parseInt(match[1].replace(/,/g, ""));
        // Handle lakh/lac conversion
        if (input.includes("lakh") || input.includes("lac")) {
          filters.budget = { max: max * 100000 };
        } else if (input.includes("thousand") || input.includes("k")) {
          filters.budget = { max: max * 1000 };
        } else {
          filters.budget = { max };
        }
      }
      break;
    }
  }
  
  // Fallback: if input contains just a number and budget-related words, treat as max budget
  if (!filters.budget && /(?:under|below|less|upto|max|price|cost|budget)/i.test(input)) {
    const numberMatch = input.match(/(\d+[,\d]*)/);
    if (numberMatch) {
      const amount = parseInt(numberMatch[1].replace(/,/g, ""));
      if (amount > 0 && amount < 100000000) { // Reasonable price range
        filters.budget = { max: amount };
      }
    }
  }

  // Extract BHK
  const bhkPattern = /(\d+)\s*bhk/i;
  const bhkMatch = input.match(bhkPattern);
  if (bhkMatch) {
    const bhkNum = parseInt(bhkMatch[1]);
    if (bhkNum >= 1 && bhkNum <= 5) {
      filters.bhk = `${bhkNum}BHK`;
    } else if (bhkNum > 5) {
      filters.bhk = "5BHK+";
    }
  }

  // Check for studio
  if (input.includes("studio")) {
    filters.bhk = "Studio";
  }

  // Extract property type
  const propertyTypes = {
    "apartment": "Apartment",
    "house": "House",
    "individual house": "Individual House",
    "villa": "Villa",
    "plot": "Plot",
    "land": "Land",
    "commercial": "Commercial"
  };

  for (const [keyword, type] of Object.entries(propertyTypes)) {
    if (input.includes(keyword)) {
      filters.propertyType = type;
      break;
    }
  }

  // Extract purpose (rent/sale)
  if (input.includes("rent") || input.includes("rental") || input.includes("for rent")) {
    filters.purpose = "Rent";
  } else if (input.includes("sale") || input.includes("buy") || input.includes("purchase")) {
    filters.purpose = "Sale";
  }

  // Build MongoDB query
  if (filters.location) {
    query.$or = [
      { "location.city": { $regex: filters.location, $options: "i" } },
      { "location.area": { $regex: filters.location, $options: "i" } },
      { "location.address": { $regex: filters.location, $options: "i" } }
    ];
  }

  if (filters.budget) {
    if (filters.budget.min && filters.budget.max) {
      query.price = { $gte: filters.budget.min, $lte: filters.budget.max };
    } else if (filters.budget.min) {
      query.price = { $gte: filters.budget.min };
    } else if (filters.budget.max) {
      query.price = { $lte: filters.budget.max };
    }
  }

  if (filters.bhk) {
    query.bhkType = filters.bhk;
  }

  if (filters.propertyType) {
    query.propertyType = filters.propertyType;
  }

  if (filters.purpose) {
    query.purpose = filters.purpose;
  }

  return { query, filters };
}

/**
 * Format property response for chatbot
 */
function formatPropertyResponse(properties, filters) {
  if (properties.length === 0) {
    let message = "Sorry, I couldn't find any properties";
    if (filters.location) message += ` in ${filters.location}`;
    if (filters.budget) {
      if (filters.budget.max) message += ` under ₹${filters.budget.max.toLocaleString()}`;
      if (filters.budget.min) message += ` above ₹${filters.budget.min.toLocaleString()}`;
    }
    if (filters.bhk) message += ` with ${filters.bhk}`;
    message += ". Try adjusting your search criteria.";
    return message;
  }

  let response = `I found ${properties.length} propert${properties.length === 1 ? "y" : "ies"}:\n\n`;
  
  properties.slice(0, 5).forEach((prop, index) => {
    response += `${index + 1}. **${prop.title}**\n`;
    response += `   📍 Location: ${prop.location?.area || prop.location?.city || "N/A"}, ${prop.location?.city || ""}\n`;
    response += `   💰 Price: ₹${prop.price.toLocaleString()}\n`;
    response += `   🏠 Type: ${prop.propertyType} (${prop.bhkType || "N/A"})\n`;
    if (prop.purpose) response += `   📋 Purpose: ${prop.purpose}\n`;
    response += `\n`;
  });

  if (properties.length > 5) {
    response += `\n...and ${properties.length - 5} more properties. Use the filters to see all results.`;
  }

  return response;
}

/**
 * POST /api/chatbot/query
 * Handle chatbot queries
 */
router.post("/query", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        response: "Please provide a valid search query. For example: 'Show me houses in Coimbatore under 20000'"
      });
    }

    // Handle greeting messages
    const greetingPatterns = [
      /^(hi|hello|hey|greetings|good morning|good afternoon|good evening)/i,
      /^(help|what can you do|how can you help)/i
    ];

    for (const pattern of greetingPatterns) {
      if (pattern.test(message.trim())) {
        return res.json({
          success: true,
          response: `Hello! I'm your property search assistant. I can help you find properties by:\n\n` +
            `📍 **Location** - e.g., "houses in Coimbatore"\n` +
            `💰 **Budget** - e.g., "under 20000" or "below 2 lakh"\n` +
            `🏠 **BHK** - e.g., "2BHK apartments"\n` +
            `🏘️ **Property Type** - e.g., "villas" or "apartments"\n` +
            `📋 **Purpose** - e.g., "for rent" or "for sale"\n\n` +
            `You can combine multiple criteria. Try: "Show me 2BHK apartments in Coimbatore under 30000"`,
          properties: []
        });
      }
    }

    // Handle owner details request
    if (message.toLowerCase().includes("owner") && message.toLowerCase().includes("detail")) {
      const propertyIdMatch = message.match(/([a-f0-9]{24})/i);
      if (propertyIdMatch) {
        const property = await Property.findById(propertyIdMatch[0]).populate("owner", "name email phone");
        if (property && property.owner) {
          return res.json({
            success: true,
            response: `**Owner Details for ${property.title}:**\n\n` +
              `👤 Name: ${property.owner.name}\n` +
              `📧 Email: ${property.owner.email}\n` +
              `📞 Phone: ${property.contactDetails?.phone || property.owner.phone || "Not provided"}\n`,
            properties: []
          });
        }
      }
    }

    // Parse the query
    const { query, filters } = parseChatbotQuery(message);
    
    console.log("Parsed query:", JSON.stringify(query, null, 2));
    console.log("Parsed filters:", JSON.stringify(filters, null, 2));

    // If no filters found, provide helpful response
    if (Object.keys(query).length === 0) {
      return res.json({
        success: true,
        response: "I couldn't understand your query. Please try:\n\n" +
          "• 'Show me houses in [city]'\n" +
          "• 'Properties under ₹[amount]'\n" +
          "• '[X]BHK apartments'\n" +
          "• 'Villas for rent in [location]'\n\n" +
          "You can combine multiple criteria!",
        properties: []
      });
    }

    // Execute query
    console.log("Executing MongoDB query:", JSON.stringify(query, null, 2));
    const properties = await Property.find(query)
      .populate("owner", "name email")
      .sort({ createdAt: -1 })
      .limit(10);
    
    console.log(`Found ${properties.length} properties`);

    // Format response
    const response = formatPropertyResponse(properties, filters);

    res.json({
      success: true,
      response,
      properties: properties.map(p => ({
        _id: p._id,
        title: p.title,
        location: p.location,
        price: p.price,
        propertyType: p.propertyType,
        bhkType: p.bhkType,
        purpose: p.purpose,
        description: p.description,
        images: p.images,
        owner: p.owner,
        contactDetails: p.contactDetails
      })),
      filters
    });
  } catch (error) {
    console.error("Chatbot error:", error);
    console.error("Error stack:", error.stack);
    console.error("Error message:", error.message);
    res.status(500).json({
      success: false,
      response: `Sorry, I encountered an error: ${error.message}. Please try again or use the filters.`,
      properties: []
    });
  }
});

module.exports = router;
