const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/db");

// ✅ Admin Signup
exports.signup = (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ msg: "All fields are required" });
  }

  // 1️⃣ Check if any admin already exists
  const checkAdminSql = "SELECT COUNT(*) AS adminCount FROM users WHERE role = 'admin'";
  db.query(checkAdminSql, (err, results) => {
    if (err) return res.status(500).json({ msg: "Database error" });

    const adminCount = results[0].adminCount;

    if (adminCount > 0) {
      return res.status(403).json({ msg: "Signup disabled. Contact system administrator." });
    }

    // 2️⃣ Continue signup for first admin
    const hashedPassword = bcrypt.hashSync(password, 10);

    const sql = "INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, 'admin')";
    db.query(sql, [username, email, hashedPassword], (err, result) => {
      if (err) {
        if (err.code === "ER_DUP_ENTRY") {
          return res.status(400).json({ msg: "Email already in use" });
        }
        return res.status(500).json({ msg: "Failed to create admin" });
      }

      const newUser = {
        id: result.insertId,
        username,
        email,
        role: "admin",
      };

      const token = jwt.sign(
        { id: newUser.id, role: newUser.role },
        process.env.JWT_SECRET,
        { expiresIn: "2h" }
      );

      res.json({
        msg: "Admin account created",
        token,
        user: newUser,
      });
    });
  });
};


// ✅ Admin login only
exports.login = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ msg: "Email and password are required" });
  }

  const sql = "SELECT * FROM users WHERE email = ?";
  db.query(sql, [email], (err, results) => {
    if (err) return res.status(500).json({ msg: "Database error" });
    if (results.length === 0) return res.status(401).json({ msg: "Invalid credentials" });

    const user = results[0];

    // ✅ Only admin can log in
    if (user.role !== "admin") {
      return res.status(403).json({ msg: "Access denied: Admin only" });
    }

    // ✅ Compare password
    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) return res.status(500).json({ msg: "Password check failed" });
      if (!isMatch) return res.status(401).json({ msg: "Invalid credentials" });

      // ✅ Generate JWT token
      const token = jwt.sign(
        { id: user.id, role: user.role },
        process.env.JWT_SECRET || "secretkey",
        { expiresIn: "2h" }
      );

      res.json({
        msg: "Login successful",
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
        },
      });
    });
  });
};
