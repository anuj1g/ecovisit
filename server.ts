import express from "express";
import { createServer as createViteServer } from "vite";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Express app setup
const app = express();
const PORT = 3000; // Force 3000 as required by infrastructure

// Disable mongoose buffering
mongoose.set('bufferCommands', false);

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Request logging for API during development
if (process.env.NODE_ENV !== 'production') {
  app.use('/api', (req, res, next) => {
    console.log(`[API REQUEST] ${req.method} ${req.path}`);
    next();
  });
}

// Simple top-level health check (outside /api)
app.get("/health", (req, res) => {
  res.json({ status: "alive", timestamp: new Date().toISOString() });
});

// MongoDB URI
const DEFAULT_URI = "mongodb+srv://anshshri018_db_user:anshchutiya%40@cluster0.2rnveyn.mongodb.net/ecovisit?appName=Cluster0";
const MONGODB_URI = process.env.MONGODB_URI || DEFAULT_URI;

// Models
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  fullName: { type: String, required: true },
  phoneNumber: String,
  resetToken: String,
  resetTokenExpiry: Date,
  role: { type: String, default: "user" },
  points: { type: Number, default: 0 },
  avatarUrl: String,
  createdAt: { type: Date, default: Date.now },
});

const reportSchema = new mongoose.Schema({
  reporterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  description: String,
  imageUrl: { type: String, required: true },
  videoUrl: String,
  fileUrl: String,
  location: {
    lat: Number,
    lng: Number,
    address: String,
  },
  status: { type: String, default: "pending" },
  pointsAwarded: { type: Boolean, default: false },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  commentCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const commentSchema = new mongoose.Schema({
  reportId: { type: mongoose.Schema.Types.ObjectId, ref: 'Report', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userName: String,
  text: { type: String, required: true },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment' },
  createdAt: { type: Date, default: Date.now },
});

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['like', 'comment', 'status_change', 'system'], required: true },
  message: { type: String, required: true },
  link: String,
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

const rewardSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reportId: { type: mongoose.Schema.Types.ObjectId, ref: 'Report' },
  points: { type: Number, required: true },
  type: { type: String, enum: ['earned', 'redeemed'], default: 'earned' },
  timestamp: { type: Date, default: Date.now },
});

const User = mongoose.model("User", userSchema);
const Report = mongoose.model("Report", reportSchema);
const Comment = mongoose.model("Comment", commentSchema);
const Notification = mongoose.model("Notification", notificationSchema);
const Reward = mongoose.model("Reward", rewardSchema);

// Helper for notifications
async function createNotification(userId: string, type: string, message: string, link = "") {
  try {
    const notification = new Notification({ userId, type, message, link });
    await notification.save();
    return notification;
  } catch (err) {
    console.error("Failed to create notification:", err);
  }
}

// Mock reports for fallback if DB is down
const mockReports = [
  {
    _id: "mock1",
    description: "Welcome to EcoVisit! (Demo Mode: MongoDB is not connected. Please whitelist IP 0.0.0.0/0 in Atlas)",
    imageUrl: "https://images.unsplash.com/photo-1518173946687-a4c8a9833d8e?auto=format&fit=crop&q=80",
    location: { address: "Global Headquarters", lat: 28.6139, lng: 77.2090 },
    status: "resolved",
    likes: [],
    commentCount: 0,
    reporterId: "system",
    reporterName: "EcoVisit Team",
    createdAt: new Date().toISOString()
  }
];

// Middleware
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET || "secret", (err: any, user: any) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// API routes go here
app.get("/api/health", (req, res) => {
  res.json({ 
    status: "ok", 
    mongo: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    mongoState: mongoose.connection.readyState,
    timestamp: new Date().toISOString() 
  });
});

// Middleware to check DB connection for API routes
app.use("/api", (req, res, next) => {
  if (req.path === "/health" || req.path.startsWith("/auth")) return next();
  
  if (mongoose.connection.readyState !== 1) {
    // If it's a GET request for reports, provide mock data instead of erroring
    if (req.path === "/reports" && req.method === "GET") {
      return res.json(mockReports);
    }
    
    return res.status(503).json({ 
      error: "Database not connected", 
      details: "The server is still connecting to the database or Atlas IP is not whitelisted. Please whitelist 0.0.0.0/0." 
    });
  }
  next();
});

// Auth Routes
app.post("/api/auth/register", async (req, res) => {
  try {
    const { email, password, fullName, phoneNumber } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hashedPassword, fullName, phoneNumber });
    await user.save();
    const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, process.env.JWT_SECRET || "secret");
    res.json({ token, user: { uid: user._id.toString(), email: user.email, fullName: user.fullName, role: user.role, points: user.points, phoneNumber: user.phoneNumber } });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, process.env.JWT_SECRET || "secret");
    res.json({ token, user: { uid: user._id.toString(), email: user.email, fullName: user.fullName, role: user.role, points: user.points } });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/auth/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      // Don't leak if user exists or not
      return res.json({ message: "If an account exists with that email, a reset link has been sent." });
    }
    
    // In a real app, send actual email. For demo, we just return success.
    const resetToken = Math.random().toString(36).slice(-8);
    user.resetToken = resetToken;
    user.resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour
    await user.save();
    
    console.log(`[DEMO] Reset token for ${email}: ${resetToken}`);
    res.json({ message: "If an account exists with that email, a reset link has been sent." });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/auth/me", authenticateToken, async (req: any, res) => {
  const user = await User.findById(req.user.id);
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json({ uid: user._id.toString(), email: user.email, fullName: user.fullName, role: user.role, points: user.points });
});

app.patch("/api/auth/me", authenticateToken, async (req: any, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    
    if (req.body.fullName) user.fullName = req.body.fullName;
    if (req.body.phoneNumber) user.phoneNumber = req.body.phoneNumber;
    
    await user.save();
    res.json({ uid: user._id.toString(), email: user.email, fullName: user.fullName, role: user.role, points: user.points });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Reports Routes
app.get("/api/reports", async (req, res) => {
  try {
    const reports = await Report.find().sort({ createdAt: -1 }).populate('reporterId', 'fullName');
    res.json(reports.map(r => {
      const json = r.toJSON();
      const reporter = r.reporterId as any;
      return { 
        ...json, 
        id: r._id.toString(), 
        reporterId: reporter?._id?.toString() || json.reporterId,
        reporterName: reporter?.fullName || 'User'
      };
    }));
  } catch (err: any) {
    console.error('[API ERROR] Failed to fetch reports:', err);
    res.status(500).json({ error: "Failed to fetch reports" });
  }
});

app.post("/api/reports", authenticateToken, async (req: any, res) => {
  console.log(`[POST REPORT] Attempt by user: ${req.user.id}`);
  try {
    const reportData = {
      ...req.body,
      reporterId: req.user.id,
      status: req.body.status || 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const report = new Report(reportData);
    await report.save();
    console.log(`[POST REPORT] SUCCESS: ${report._id}`);
    res.json({ ...report.toJSON(), id: report._id });
  } catch (err: any) {
    console.error('[POST REPORT] ERROR:', err.message);
    res.status(400).json({ error: err.message });
  }
});

app.patch("/api/reports/:id", authenticateToken, async (req: any, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ error: "Report not found" });
    
    // Only admin or owner can update
    if (req.user.role !== 'admin' && report.reporterId.toString() !== req.user.id) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    Object.assign(report, req.body);
    report.updatedAt = new Date();
    
    // If status changed to resolved, maybe award points if not already awarded
    if (req.body.status === 'resolved' && !report.pointsAwarded) {
      const reporter = await User.findById(report.reporterId);
      if (reporter) {
        reporter.points += 100; // Award 100 points
        await reporter.save();
        report.pointsAwarded = true;
        
        // Create reward entry
        const reward = new Reward({
          userId: report.reporterId,
          reportId: report._id,
          points: 100,
          type: 'earned'
        });
        await reward.save();

        // Create notification
        await createNotification(
          report.reporterId.toString(),
          'status_change',
          `Your report was resolved! You earned 100 impact points.`,
          `/rewards`
        );
      }
    }

    await report.save();
    res.json({ ...report.toJSON(), id: report._id });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.delete("/api/reports/:id", authenticateToken, async (req: any, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ error: "Report not found" });
    if (report.reporterId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: "Unauthorized" });
    }
    await report.deleteOne();
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Likes/Comments
app.get("/api/user/activity/posts", authenticateToken, async (req: any, res) => {
  try {
    const reports = await Report.find({ reporterId: req.user.id }).sort({ createdAt: -1 }).populate('reporterId', 'fullName');
    res.json(reports.map(r => ({ ...r.toJSON(), id: r._id, reporterName: (r.reporterId as any).fullName })));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/user/activity/likes", authenticateToken, async (req: any, res) => {
  try {
    const reports = await Report.find({ likes: req.user.id }).sort({ createdAt: -1 }).populate('reporterId', 'fullName');
    res.json(reports.map(r => ({ ...r.toJSON(), id: r._id, reporterName: (r.reporterId as any).fullName })));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/user/activity/comments", authenticateToken, async (req: any, res) => {
  try {
    const comments = await Comment.find({ userId: req.user.id }).select('reportId');
    const reportIds = [...new Set(comments.map(c => c.reportId))];
    const reports = await Report.find({ _id: { $in: reportIds } }).sort({ createdAt: -1 }).populate('reporterId', 'fullName');
    res.json(reports.map(r => ({ ...r.toJSON(), id: r._id, reporterName: (r.reporterId as any).fullName })));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/reports/:id/like", authenticateToken, async (req: any, res) => {
  const report = await Report.findById(req.params.id);
  if (!report) return res.status(404).json({ error: "Report not found" });
  
  const userId = req.user.id;
  const index = report.likes.indexOf(userId);
  if (index === -1) {
    report.likes.push(userId);
    // Create notification for post owner
    if (report.reporterId.toString() !== userId) {
      const user = await User.findById(userId);
      await createNotification(
        report.reporterId.toString(), 
        'like', 
        `${user?.fullName || 'Someone'} liked your impact report.`,
        `/reports/${report._id}`
      );
    }
  } else {
    report.likes.splice(index, 1);
  }
  
  await report.save();
  res.json({ likes: report.likes });
});

app.get("/api/reports/:id/comments", async (req, res) => {
  const comments = await Comment.find({ reportId: req.params.id }).sort({ createdAt: 1 });
  res.json(comments.map(c => ({ ...c.toJSON(), id: c._id })));
});

app.post("/api/reports/:id/comments", authenticateToken, async (req: any, res) => {
  const comment = new Comment({ ...req.body, reportId: req.params.id, userId: req.user.id });
  await comment.save();
  const report = await Report.findByIdAndUpdate(req.params.id, { $inc: { commentCount: 1 } });
  
  // Notification for report owner
  if (report && report.reporterId.toString() !== req.user.id) {
    await createNotification(
      report.reporterId.toString(),
      'comment',
      `${req.user.fullName || 'Someone'} commented on your report.`,
      `/reports/${req.params.id}`
    );
  }
  
  res.json({ ...comment.toJSON(), id: comment._id });
});

// Notifications Routes
app.get("/api/notifications", authenticateToken, async (req: any, res) => {
  const notifications = await Notification.find({ userId: req.user.id }).sort({ createdAt: -1 }).limit(50);
  res.json(notifications.map(n => ({ ...n.toJSON(), id: n._id })));
});

app.patch("/api/notifications/:id/read", authenticateToken, async (req: any, res) => {
  await Notification.findOneAndUpdate({ _id: req.params.id, userId: req.user.id }, { read: true });
  res.json({ success: true });
});

app.patch("/api/notifications/read-all", authenticateToken, async (req: any, res) => {
  await Notification.updateMany({ userId: req.user.id, read: false }, { read: true });
  res.json({ success: true });
});

// Rewards Routes
app.get("/api/rewards", authenticateToken, async (req: any, res) => {
  const rewards = await Reward.find({ userId: req.user.id }).sort({ timestamp: -1 });
  res.json(rewards.map(r => ({ ...r.toJSON(), id: r._id })));
});

// Vite Middleware
async function start() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    
    // SPA fallback only for non-API routes
    app.get(/^(?!\/api).*/, (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // Handle 404 for API routes explicitly
  app.use("/api/*", (req, res) => {
    res.status(404).json({ error: "API endpoint not found" });
  });

  // Global Error Handler for JSON responses
  app.use((err: any, req: any, res: any, next: any) => {
    console.error("GLOBAL ERROR:", err);
    res.status(err.status || 500).json({ 
      error: err.message || "Internal Server Error",
      path: req.path
    });
  });

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`SUCCESS: Server listening on 0.0.0.0:${PORT}`);
    console.log(`API check: http://localhost:${PORT}/api/health`);
    console.log(`Root check: http://localhost:${PORT}/health`);
  });

  // Start DB connection asynchronously
  mongoose.connect(MONGODB_URI, {
    serverSelectionTimeoutMS: 10000,
    connectTimeoutMS: 15000,
  }).then(() => {
    console.log("SUCCESS: Connected to MongoDB Atlas");
  }).catch((err: any) => {
    console.error("\n--- MONGODB CONNECTION ERROR ---");
    console.error("Error Message:", err.message);
    
    if (err.message.includes('ECONNREFUSED') || err.message.includes('querySrv')) {
      console.error("\n[FIX] DNS issue detected: Your local network/ISP might be blocking SRV records.");
      console.error("Try switching to the 'Standard Connection String' (mongodb://... instead of mongodb+srv://) in your .env file.");
    } else if (err.message.includes('whitelisted') || err.message.includes('OP_MSG')) {
      console.error("\n[FIX] IP Whitelist issue: Go to Atlas -> Network Access and add '0.0.0.0/0' to allow access from anywhere.");
    }
    console.error("--------------------------------\n");
  });
}

start();
