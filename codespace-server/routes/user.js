const express = require("express");
const router = express.Router();
const Problem = require("../models/Problem");
const User = require("../models/User");
const verifyUser = require("../middleware/verifyUser"); // or wherever it's defined
const Submission = require("../models/Submission");
const UserProblem = require("../models/UserProblem");
const mongoose=require("mongoose")
const bcrypt = require("bcrypt");

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
    
    // Check if any submissions don't have verdicts and update them
    const submissionsWithoutVerdicts = submissions.filter(sub => !sub.verdict || sub.verdict === "Pending");
    
    if (submissionsWithoutVerdicts.length > 0) {
      console.log(`Found ${submissionsWithoutVerdicts.length} submissions without verdicts for problem ${problemId}, updating...`);
      
      // Check if this problem is solved
      const userProblem = await UserProblem.findOne({ 
        userId: new mongoose.Types.ObjectId(userId), 
        problemId: new mongoose.Types.ObjectId(problemId),
        status: "Solved"
      });
      
      const isProblemSolved = !!userProblem;
      
      // Update submissions based on whether the problem is solved
      for (const submission of submissionsWithoutVerdicts) {
        await Submission.updateOne(
          { _id: submission._id },
          { $set: { verdict: isProblemSolved ? "Accepted" : "Wrong Answer" } }
        );
      }
      
      // Fetch updated submissions
      const updatedSubmissions = await Submission.find({ userId, problemId }).sort({ timestamp: -1 });
      res.json(updatedSubmissions);
    } else {
      res.json(submissions);
    }
  } catch (error) {
    console.error("Failed to fetch submissions:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get all submissions by the logged-in user (for activity data)
router.get("/submissions", verifyUser, async (req, res) => {
  const userId = req.user.id;

  try {
    const submissions = await Submission.find({ userId }).sort({ timestamp: -1 });
    
    // Check if any submissions don't have verdicts and update them
    const submissionsWithoutVerdicts = submissions.filter(sub => !sub.verdict || sub.verdict === "Pending");
    
    if (submissionsWithoutVerdicts.length > 0) {
      console.log(`Found ${submissionsWithoutVerdicts.length} submissions without verdicts, updating...`);
      
      // Get all solved problems for this user
      const solvedProblems = await UserProblem.find({ 
        userId: new mongoose.Types.ObjectId(userId), 
        status: "Solved" 
      });
      const solvedProblemIds = new Set(solvedProblems.map(sp => sp.problemId.toString()));
      
      // Update submissions based on whether the problem is solved
      for (const submission of submissionsWithoutVerdicts) {
        const isProblemSolved = solvedProblemIds.has(submission.problemId.toString());
        await Submission.updateOne(
          { _id: submission._id },
          { $set: { verdict: isProblemSolved ? "Accepted" : "Wrong Answer" } }
        );
      }
      
      // Fetch updated submissions
      const updatedSubmissions = await Submission.find({ userId }).sort({ timestamp: -1 });
      res.json(updatedSubmissions);
    } else {
      res.json(submissions);
    }
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
  const { problemId, code, language, timestamp, verdict } = req.body;
  const userId = req.user.id;

  await Submission.create({
    userId,
    problemId,
    code,
    language,
    timestamp: new Date(),
    verdict: verdict || "Pending",
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

// Get solve dates for streak calculation
router.get("/solve-dates", verifyUser, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get all solved problems
    const solvedProblems = await UserProblem.find({ 
      userId: new mongoose.Types.ObjectId(userId), 
      status: "Solved"
    }).select('solvedAt').sort({ solvedAt: -1 });
    
    // Filter out entries without solvedAt (legacy data) and add fallback dates
    const validSolveDates = solvedProblems
      .filter(problem => problem.solvedAt)
      .map(problem => ({ solvedAt: problem.solvedAt }));
    
    console.log("Found solved problems:", solvedProblems.length);
    console.log("Valid solve dates:", validSolveDates.length);
    
    res.json(validSolveDates);
  } catch (error) {
    console.error("Failed to fetch solve dates:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Change password route
router.patch("/change-password", verifyUser, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ error: "Current password is incorrect" });
    }

    // Hash the new password
    const saltRounds = 10;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update the password
    user.password = hashedNewPassword;
    await user.save();

    res.json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
