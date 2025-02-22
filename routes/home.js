import express from 'express';
const router = express.Router();

// Serve the index page
router.get("/home", (req, res) => {
  res.redirect("/");
});

export default router;
