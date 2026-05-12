const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
require("dotenv").config();

const { createClient } = require("@supabase/supabase-js");

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Configure multer for file uploads (memory storage for Supabase)
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only .png, .jpg and .jpeg format allowed!'));
  }
});

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Helper function to upload image to Supabase Storage
async function uploadImageToSupabase(file, itemId) {
  const fileExt = file.originalname.split('.').pop();
  const fileName = `${itemId}-${Date.now()}.${fileExt}`;
  const filePath = `item-images/${fileName}`;

  const { data, error } = await supabase.storage
    .from('items_bucket')
    .upload(filePath, file.buffer, {
      contentType: file.mimetype,
      cacheControl: '3600'
    });

  if (error) throw error;

  const { data: { publicUrl } } = supabase.storage
    .from('items_bucket')
    .getPublicUrl(filePath);

  return publicUrl;
}

// GET all items with filters
app.get("/items", async (req, res) => {
  try {
    const { status, category, search } = req.query;
    let query = supabase.from("items").select("*");

    if (status) query = query.eq("status", status);
    if (category) query = query.eq("category", category);
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,location.ilike.%${search}%`);
    }

    const { data, error } = await query.order("created_at", { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error("Error fetching items:", error);
    res.status(500).json({ error: error.message });
  }
});

// GET single item by ID
app.get("/items/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from("items")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: "Item not found" });
    
    res.json(data);
  } catch (error) {
    console.error("Error fetching item:", error);
    res.status(500).json({ error: error.message });
  }
});

// POST - Create new item report 
app.post("/items", upload.single("photo"), async (req, res) => {
  try {
    console.log("Request body:", req.body);
    console.log("Uploaded file:", req.file);

    const { 
      status, 
      itemName, 
      description, 
      category, 
      date, 
      location, 
      contact 
    } = req.body;

    // Validate required fields
    if (!status || !itemName || !location || !contact) {
      return res.status(400).json({ 
        error: "Missing required fields",
        required: ["status", "itemName", "location", "contact"]
      });
    }

    // Generate claim code if status is "lost"
    const generateClaimCode = () => {
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ0123456789';
      let code = '';
      for (let i = 0; i < 8; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return code;
    };

    let claimcode = null;
    if (status === "lost" || status === "found") {
      claimcode = generateClaimCode();
      console.log(`Generated claim code for ${status} item:`, claimcode);
    }

    // Insert item into Supabase 
    const insertData = {
      status: status,
      title: itemName,
      description: description || null,
      category: category || null,
      location: location,
      contact: contact,
      date: date || null,
      claimcode: claimcode,  // Auto-generate claim code ONLY for lost items
    };

    console.log("Inserting data:", insertData);

    const { data: itemData, error: insertError } = await supabase
      .from("items")
      .insert([insertData])
      .select();

    if (insertError) throw insertError;

    let imageUrl = null;
    
    // Upload photo if provided
    if (req.file && itemData && itemData[0]) {
      try {
        imageUrl = await uploadImageToSupabase(req.file, itemData[0].id);
        
        // Update item with image URL
        const { error: updateError } = await supabase
          .from("items")
          .update({ image: imageUrl })
          .eq("id", itemData[0].id);

        if (updateError) console.error("Error updating image URL:", updateError);
        
        itemData[0].image = imageUrl;
      } catch (uploadError) {
        console.error("Error uploading photo:", uploadError);
        // Don't fail the whole request if photo upload fails
      }
    }

    res.status(201).json({ 
      message: "Report submitted successfully!", 
      item: itemData[0],
      claimcode: itemData[0].claimcode 
    });
  } catch (error) {
    console.error("Error creating item:", error);
    res.status(500).json({ error: error.message });
  }
});

// PATCH - Update item status
app.patch("/items/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !["lost", "found"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const { data, error } = await supabase
      .from("items")
      .update({ status })
      .eq("id", id)
      .select();

    if (error) throw error;
    if (!data || data.length === 0) {
      return res.status(404).json({ error: "Item not found" });
    }

    res.json({ message: "Status updated successfully", item: data[0] });
  } catch (error) {
    console.error("Error updating status:", error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE - Remove an item
app.delete("/items/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Get the item to check if it has an image
    const { data: item, error: fetchError } = await supabase
      .from("items")
      .select("image")
      .eq("id", id)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;

    // Delete image from storage if exists
    if (item && item.image) {
      const filePath = item.image.split('/').pop();
      if (filePath) {
        await supabase.storage
          .from('items_bucket')
          .remove([`item-images/${filePath}`]);
      }
    }

    // Delete item from database
    const { error: deleteError } = await supabase
      .from("items")
      .delete()
      .eq("id", id);

    if (deleteError) throw deleteError;

    res.json({ message: "Item deleted successfully" });
  } catch (error) {
    console.error("Error deleting item:", error);
    res.status(500).json({ error: error.message });
  }
});

// GET - Search items
app.get("/items/search/:query", async (req, res) => {
  try {
    const { query } = req.params;
    const { data, error } = await supabase
      .from("items")
      .select("*")
      .or(`title.ilike.%${query}%,description.ilike.%${query}%,location.ilike.%${query}%`)
      .order("created_at", { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error("Error searching items:", error);
    res.status(500).json({ error: error.message });
  }
});

// GET - Items statistics
app.get("/stats", async (req, res) => {
  try {
    const { data: allItems, error } = await supabase
      .from("items")
      .select("status, category");

    if (error) throw error;

    const stats = {
      total: allItems.length,
      lost: allItems.filter(item => item.status === "lost").length,
      found: allItems.filter(item => item.status === "found").length,
      categories: {}
    };

    // Count by category
    allItems.forEach(item => {
      if (item.category) {
        stats.categories[item.category] = (stats.categories[item.category] || 0) + 1;
      }
    });

    res.json(stats);
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({ error: error.message });
  }
});

// POST - Verify claim code and mark item as returned
app.post("/items/:id/verify-claim", async (req, res) => {
  try {
    const { id } = req.params;
    const { claimcode } = req.body;

    console.log("=== CLAIM VERIFICATION DEBUG ===");
    console.log("Item ID:", id);
    console.log("Provided claim code:", claimcode);

    // Validate required fields
    if (!claimcode) {
      return res.status(400).json({ error: "Claim code is required" });
    }

    // Get the item by ID
    const { data: item, error: fetchError } = await supabase
      .from("items")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError) {
      return res.status(404).json({ error: "Item not found" });
    }

    console.log("Item claimcode from DB:", item.claimcode);
    console.log("Item status:", item.status);
    console.log("Item type:", item.status === "lost" ? "Lost Item" : "Found Item");

    // Check if claim code exists in database
    if (!item.claimcode) {
      return res.status(400).json({ 
        error: "No claim code has been generated for this item yet"
      });
    }

    // Check if item is already returned
    if (item.status === "returned") {
      return res.status(400).json({ 
        error: "Item has already been returned"
      });
    }

    // Verify claim code (case insensitive)
    const dbCode = String(item.claimcode).trim().toUpperCase();
    const inputCode = String(claimcode).trim().toUpperCase();
    
    if (dbCode !== inputCode) {
      return res.status(401).json({ error: "Invalid claim code" });
    }

    // Update item status to 'returned' (for BOTH lost and found items)
    const { data: updatedItem, error: updateError } = await supabase
      .from("items")
      .update({ 
        status: "returned",
        returned_at: new Date().toISOString()
      })
      .eq("id", id)
      .select();

    if (updateError) throw updateError;

    // Return appropriate message based on item type
    const message = item.status === "lost" 
      ? "✅ Claim verified! Lost item marked as returned to owner."
      : "✅ Claim verified! Found item marked as returned to owner.";

    res.json({ 
      message: message,
      success: true,
      item: updatedItem[0]
    });

  } catch (error) {
    console.error("Error verifying claim:", error);
    res.status(500).json({ error: error.message });
  }
});

// GET - Get claim code for an item
app.get("/items/:id/claim-code", async (req, res) => {
  try {
    const { id } = req.params;

    const { data: item, error } = await supabase
      .from("items")
      .select("claimcode, status, title")
      .eq("id", id)
      .single();

    if (error) {
      return res.status(404).json({ error: "Item not found" });
    }

    if (!item.claimcode) {
      return res.status(404).json({ error: "No claim code generated for this item" });
    }

    res.json({ 
      claimcode: item.claimcode,
      title: item.title,
      status: item.status
    });

  } catch (error) {
    console.error("Error fetching claim code:", error);
    res.status(500).json({ error: error.message });
  }
});

// GET - Check claim status
app.get("/items/:id/claim-status", async (req, res) => {
  try {
    const { id } = req.params;

    const { data: item, error } = await supabase
      .from("items")
      .select("status, claimcode, returned_at")
      .eq("id", id)
      .single();

    if (error) {
      return res.status(404).json({ error: "Item not found" });
    }

    const isClaimed = item.status === "found";
    const hasClaimcode = !!item.claimcode;

    res.json({ 
      isClaimed: isClaimed,
      hasClaimcode: hasClaimcode,
      status: item.status,
      returnedAt: item.returned_at || null
    });

  } catch (error) {
    console.error("Error checking claim status:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = app;