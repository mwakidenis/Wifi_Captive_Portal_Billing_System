const express = require("express");
const router = express.Router();
const prisma = require("../config/prismaClient");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt"); // optional if later you want hashed passwords
const {
  disconnectAllUsers,
  disconnectByMac,
  getActiveDevices,
  getStatus
} = require("../config/mikrotik");

// 🔐 ========================
// ADMIN LOGIN (via .env)
// ==========================
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (
      username === process.env.ADMIN_USERNAME &&
      password === process.env.ADMIN_PASSWORD
    ) {
      const token = jwt.sign(
        { role: "admin", username, email: process.env.ADMIN_EMAIL },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
      );
      return res.json({ success: true, token, admin: { username, email: process.env.ADMIN_EMAIL } });
    }

    return res.status(401).json({ success: false, message: "Invalid credentials" });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Login failed" });
  }
});

// 🔐 ========================
// AUTH MIDDLEWARE
// ==========================
function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token provided" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== "admin") {
      return res.status(403).json({ message: "Forbidden: Admins only" });
    }
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid or expired token" });
  }
}

// ============================
// ADMIN ENDPOINTS
// ============================

// ✅ Get All Payments
router.get("/payments", authMiddleware, async (req, res) => {
  try {
    const payments = await prisma.payment.findMany({
      orderBy: { timePurchased: "desc" },
      select: {
        phone: true,
        amount: true,
        timePurchased: true,
        status: true
      }
    });
    res.json({ success: true, data: payments });
  } catch (error) {
    console.error("Payments error:", error);
    res.status(500).json({ success: false, error: "Database error" });
  }
});

// ✅ Get Summary
router.get("/summary", authMiddleware, async (req, res) => {
  try {
    const totalUsers = await prisma.payment.count({
      where: { status: "completed" },
      distinct: ["phone"]
    });

    const totalRevenue = await prisma.payment.aggregate({
      where: { status: "completed" },
      _sum: { amount: true }
    });

    const pendingPayments = await prisma.payment.count({
      where: { status: "pending" }
    });

    const activeSessions = 0; // Placeholder for now

    res.json({
      success: true,
      data: {
        totalUsers,
        totalRevenue: totalRevenue._sum.amount || 0,
        activeSessions,
        pendingPayments
      }
    });
  } catch (error) {
    console.error("Summary error:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});

// ============================
// USERS
// ============================
router.get("/users", authMiddleware, async (req, res) => {
  try {
    const { search = "", status = "all", page = 1, limit = 10 } = req.query;
    const pageNum = Number(page) || 1;
    const per = Number(limit) || 10;
    const where = {};
    if (search) {
      where.phone = { contains: search, mode: "insensitive" };
    }
    if (status !== "all") {
      where.status = status;
    }
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip: (pageNum - 1) * per,
        take: per,
        orderBy: { lastSeen: "desc" },
      }),
      prisma.user.count({ where }),
    ]);
    const totalPages = Math.max(1, Math.ceil(total / per));
    return res.json({ success: true, data: { users, total, page: pageNum, totalPages } });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Failed to fetch users" });
  }
});

router.post("/users/:id/block", authMiddleware, async (req, res) => {
  return res.json({ success: true });
});

router.post("/users/:id/unblock", authMiddleware, async (req, res) => {
  return res.json({ success: true });
});

router.post("/users/:id/disconnect", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.promise().query("SELECT mac_address AS mac FROM payments WHERE id = ? LIMIT 1", [id]);
    const mac = rows && rows[0] && rows[0].mac;
    if (!mac) return res.json({ success: true });
    const resp = await disconnectByMac(mac);
    return res.json({ success: resp.success, message: resp.message });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Failed to disconnect user" });
  }
});

router.delete("/users/:id", authMiddleware, async (req, res) => {
  return res.json({ success: true });
});

// ============================
// TRANSACTIONS
// ============================
router.get("/transactions", authMiddleware, async (req, res) => {
  try {
    const { search = "", status = "all", page = 1, limit = 10, startDate = null, endDate = null } = req.query;
    let sql = "SELECT transaction_id AS id, phone, amount, status, time_purchased AS timestamp, mpesa_ref FROM payments WHERE 1=1";
    const params = [];
    if (status !== "all") {
      sql += " AND status = ?";
      params.push(status);
    }
    if (startDate) {
      sql += " AND time_purchased >= ?";
      params.push(startDate);
    }
    if (endDate) {
      sql += " AND time_purchased <= ?";
      params.push(endDate);
    }
    sql += " ORDER BY time_purchased DESC";
    const [rows] = await db.promise().query(sql, params);
    let txns = rows.map((r) => ({ ...r, package: "" }));
    const q = String(search).toLowerCase();
    if (q) txns = txns.filter((t) => t.phone.toLowerCase().includes(q) || String(t.id).toLowerCase().includes(q) || String(t.mpesa_ref || '').toLowerCase().includes(q));
    const pageNum = Number(page) || 1;
    const per = Number(limit) || 10;
    const total = txns.length;
    const totalPages = Math.max(1, Math.ceil(total / per));
    const slice = txns.slice((pageNum - 1) * per, pageNum * per);
    return res.json({ success: true, data: { transactions: slice, total, page: pageNum, totalPages } });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Failed to fetch transactions" });
  }
});

router.post("/transactions/:transactionId/refund", authMiddleware, async (req, res) => {
  return res.json({ success: false, error: "Refund not implemented" });
});

router.get("/transactions/:transactionId/receipt", authMiddleware, async (req, res) => {
  return res.json({ success: false, error: "Receipt generation not implemented" });
});

// ============================
// SUPPORT
// ============================
router.post("/support/contact", async (req, res) => {
  return res.json({ success: true });
});

router.get("/support/requests", authMiddleware, async (req, res) => {
  return res.json({ success: true, data: { requests: [], total: 0, page: 1, totalPages: 1 } });
});

// ============================
// LOGS
// ============================
router.get("/system/logs", authMiddleware, async (req, res) => {
  return res.json({ success: true, data: [] });
});

// ============================
// NETWORK
// ============================
router.get("/network/devices", authMiddleware, async (req, res) => {
  const resp = await getActiveDevices();
  if (!resp.success) return res.status(500).json({ success: false, error: resp.error });
  return res.json({ success: true, data: resp.data });
});

router.post("/network/disconnect-all", authMiddleware, async (req, res) => {
  const resp = await disconnectAllUsers();
  return res.json({ success: resp.success, message: resp.message });
});

router.get("/network/status", authMiddleware, async (req, res) => {
  const resp = await getStatus();
  if (!resp.success) return res.status(500).json({ success: false, error: resp.error });
  return res.json({ success: true, data: resp.data });
});

module.exports = router;
