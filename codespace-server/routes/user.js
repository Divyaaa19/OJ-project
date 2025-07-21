const express = require("express");
const router = express.Router();
const Problem = require("../models/Problem");
const User = require("../models/User");
const verifyUser = require("../middleware/verifyUser"); // or wherever it's defined
const Submission = require("../models/Submission");
const UserProblem = require("../models/UserProblem");
const mongoose=require("mongoose")

router.get("/profile", verifyUser, async (req, res) => {
  try {
    const user = req.user; // from verifyUser middleware
    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      favoriteProblems: user.favoriteProblems || [],
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ message: "Server error" });
  }
});


// Get all submissions by the logged-in user for a specific problem
router.get("/submissions/:problemId", verifyUser, async (req, res) => {
  const { problemId } = req.params;
  const userId = req.user.id;

  try {
    const submissions = await Submission.find({ userId, problemId }).sort({ timestamp: -1 });
    res.json(submissions);
  } catch (error) {
    console.error("Failed to fetch submissions:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get all submissions by the logged-in user (for Activity page)
router.get("/submissions", verifyUser, async (req, res) => {
  const userId = req.user.id;
  try {
    const submissions = await Submission.find({ userId }).sort({ timestamp: -1 });
    res.json(submissions);
  } catch (error) {
    console.error("Failed to fetch all submissions:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/dashboard", verifyUser, async (req, res) => {
  const userId = req.user.id;

  const problems = await Problem.find().select("title difficulty");

  // Get all statuses from UserProblem
  const userStatuses = await UserProblem.find({ userId });

  // Map of problemId -> status
  const statusMap = new Map();
  userStatuses.forEach((entry) => {
    statusMap.set(entry.problemId.toString(), entry.status);
  });

  // Assume "Unsolved" if no entry exists
  const result = problems.map((p) => {
    const status = statusMap.get(p._id.toString()) || "Unsolved";
    return {
      _id: p._id,
      title: p.title,
      difficulty: p.difficulty,
      solved: status === "Solved",
      favorite: req.user.favoriteProblems?.includes(p._id.toString()) || false,
    };
  });

  res.json(result);
});


// routes/user.js
router.post('/submit', verifyUser, async (req, res) => {
  const { problemId, code, language, timestamp } = req.body;
  const userId = req.user.id;

  await Submission.create({
    userId,
    problemId,
    code,
    language,
    timestamp: new Date(),
  });

  res.json({ message: "Submission saved" });
});

router.post('/mark-solved', verifyUser, async (req, res) => {
  try {
    const { problemId } = req.body;
    const userId = req.user.id;

    // Convert to ObjectId explicitly
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const problemObjectId = new  mongoose.Types.ObjectId(problemId);

    await UserProblem.updateOne(
      { userId: userObjectId, problemId: problemObjectId },
      { $set: { status: "Solved" } },
      { upsert: true }
    );

    res.json({ message: "Problem marked as solved" });
  } catch (error) {
    console.error("❌ mark-solved error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});




router.patch("/favorite/:problemId", verifyUser, async (req, res) => {
  try {
    const user = req.user;
    const problemId = req.params.problemId;

    // Initialize the array if it doesn't exist
    if (!user.favoriteProblems) {
      user.favoriteProblems = [];
    }

    const index = user.favoriteProblems.indexOf(problemId);
    if (index === -1) {
      user.favoriteProblems.push(problemId);
    } else {
      user.favoriteProblems.splice(index, 1); // unfavorite
    }

    await user.save();
    res.json({ message: "Favorites updated", favorites: user.favoriteProblems });
  } catch (err) {
    console.error("Toggle favorite error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/user-problems/:id", verifyUser, async (req, res) => {
  const problem = await Problem.findById(req.params.id);
  if (!problem) return res.status(404).json({ message: "Problem not found" });
  res.json(problem);
});
module.exports = router;
