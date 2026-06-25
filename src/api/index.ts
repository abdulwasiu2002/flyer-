import { Router } from "express";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import fs from "fs";
import { db } from "../db/setup";

const router = Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(process.cwd(), "uploads"));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only images are allowed"));
    }
  },
});

// Admin Login
router.post("/auth/login", (req, res) => {
  const { email, password } = req.body;
  const admin = db.prepare("SELECT id, name, email FROM admins WHERE email = ? AND password = ?").get(email, password);
  if (admin) {
    res.json({ token: "fake-jwt-token-" + (admin as any).id, user: admin });
  } else {
    res.status(401).json({ error: "Invalid credentials" });
  }
});

// Settings
router.get("/settings", (req, res) => {
  const settings = db.prepare("SELECT * FROM settings").all();
  const settingsMap = settings.reduce((acc: any, row: any) => {
    acc[row.key] = row.value;
    return acc;
  }, {});
  res.json(settingsMap);
});

// Upload endpoint
router.post("/upload", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }
  const url = `/uploads/${req.file.filename}`;
  res.json({ url });
});

// Upload Base64 Flyer
router.post("/upload-flyer", (req, res) => {
  const { imageData } = req.body;
  if (!imageData) {
    return res.status(400).json({ error: "No image data" });
  }
  
  const base64Data = imageData.replace(/^data:image\/png;base64,/, "");
  const filename = `flyer-${Date.now()}.png`;
  const filepath = path.join(process.cwd(), "uploads", filename);
  
  fs.writeFileSync(filepath, base64Data, "base64");
  
  res.json({ url: `/uploads/${filename}` });
});

// Students Endpoint
router.post("/students", (req, res) => {
  const data = req.body;
  
  const stmt = db.prepare(`
    INSERT INTO students (
      id, flyer_code, full_name, state_of_origin, birthday, relationship_status, phone,
      best_course, challenging_course, best_level, challenging_level, favorite_lecturer,
      best_experience, post_held, next_after_school, favorite_quote, photo_url, flyer_url, nickname
    ) VALUES (
      @id, @flyer_code, @full_name, @state_of_origin, @birthday, @relationship_status, @phone,
      @best_course, @challenging_course, @best_level, @challenging_level, @favorite_lecturer,
      @best_experience, @post_held, @next_after_school, @favorite_quote, @photo_url, @flyer_url, @nickname
    )
  `);
  
  const flyer_code = `NCC26-${Math.floor(1000 + Math.random() * 9000)}`;
  const id = uuidv4();
  
  try {
    stmt.run({
      ...data,
      id,
      flyer_code
    });
    res.json({ success: true, flyer_code });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Admin routes
const authMiddleware = (req: any, res: any, next: any) => {
  const token = req.headers.authorization;
  if (!token || !token.startsWith("Bearer fake-jwt-token-")) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
};

router.get("/students", authMiddleware, (req, res) => {
  const students = db.prepare("SELECT * FROM students ORDER BY created_at DESC").all();
  res.json(students);
});

router.delete("/students/:id", authMiddleware, (req, res) => {
  db.prepare("DELETE FROM students WHERE id = ?").run(req.params.id);
  res.json({ success: true });
});

router.get("/stats", authMiddleware, (req, res) => {
  const totalStudents = (db.prepare("SELECT count(*) as c FROM students").get() as any).c;
  const todaysFlyers = (db.prepare("SELECT count(*) as c FROM students WHERE date(created_at) = date('now')").get() as any).c;
  
  res.json({
    totalStudents,
    todaysFlyers,
    downloads: totalStudents // Placeholder
  });
});

export default router;
