const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { createClient } = require("@supabase/supabase-js");

const app = express();
app.use(cors());
app.use(express.json());

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

app.get("/items", async (req, res) => {
  const { data, error } = await supabase
    .from("items")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return res.status(500).json({ error });

  res.json(data);
});

app.post("/items", async (req, res) => {
  const { title, description, category, location, contact } = req.body;

  const { data, error } = await supabase
    .from("items")
    .insert([
      {
        title,
        description,
        category,
        location,
        contact,
        status: "lost"
      }
    ])
    .select();

  if (error) return res.status(500).json({ error });

  res.json(data[0]);
});

app.patch("/items/:id/status", async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const { data, error } = await supabase
    .from("items")
    .update({ status })
    .eq("id", id)
    .select();

  if (error) return res.status(500).json({ error });

  res.json(data[0]);
});

module.exports = app;

