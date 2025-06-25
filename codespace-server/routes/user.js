const express = require("express");
const router = express.Router();
const Problem = require("../models/Problem");
const User = require("../models/User");
const verifyUser = require("../middleware/verifyUser");

router.get("/dashboard", verifyUser, async (req, res) => {
  const problems = await Problem.find().select("title difficulty");
  const user = req.user;
  const solved = user.solvedProblems.map(id => id.toString());
  const favorites = user.favoriteProblems  || [];

  const result = problems.map(p => ({
    _id: p._id,
    title: p.title,
    difficulty: p.difficulty,
    solved: solved.includes(p._id.toString()),
    favorite: favorites.includes(p._id.toString())
  }));

  res.json(result);
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
