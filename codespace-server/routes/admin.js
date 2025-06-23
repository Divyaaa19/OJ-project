const express = require("express");
const router = express.Router();
const Problem = require("../models/Problem");
const verifyAdmin = require("../middleware/verifyAdmin");

// GET all problems (summary)
router.get("/problems", verifyAdmin, async (req, res) => {
  const problems = await Problem.find().select("title difficulty");
  res.json(problems);
});

// GET a single problem by ID
router.get("/problems/:id", verifyAdmin, async (req, res) => {
  const problem = await Problem.findById(req.params.id);
  if (!problem) return res.status(404).json({ message: "Problem not found" });
  res.json(problem);
});

// POST new problem
router.post("/problems", verifyAdmin, async (req, res) => {
  try {
    const newProblem = new Problem(req.body);
    await newProblem.save();
    res.status(201).json({ message: "Problem added successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to add problem" });
  }
});

// PUT update problem
router.put("/problems/:id", verifyAdmin, async (req, res) => {
  try {
    await Problem.findByIdAndUpdate(req.params.id, req.body);
    res.json({ message: "Problem updated successfully" });
  } catch (err) {
    res.status(500).json({ message: "Update failed" });
  }
});

// DELETE problem
router.delete("/problems/:id", verifyAdmin, async (req, res) => {
  try {
    await Problem.findByIdAndDelete(req.params.id);
    res.json({ message: "Problem deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Delete failed" });
  }
});

module.exports = router;
