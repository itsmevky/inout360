const fs = require("fs");
const path = require("path");
const multer = require("multer");

const UPLOAD_ROOT = path.join(__dirname, "..", "uploads");

const ensureDir = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

const resolveSubdir = (fieldname) => {
  if (fieldname === "apkFile" || fieldname === "companyLogo") return "settings";
  if (fieldname === "profileImage") return "employees";
  return "misc";
};

const storage = multer.diskStorage({
  destination: (_req, file, cb) => {
    const subdir = resolveSubdir(file.fieldname);
    const target = path.join(UPLOAD_ROOT, subdir);
    ensureDir(target);
    cb(null, target);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${ext}`);
  },
});

const fileFilter = (_req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (file.fieldname === "apkFile") {
    return cb(null, ext === ".apk");
  }
  if (file.fieldname === "companyLogo" || file.fieldname === "profileImage") {
    return cb(null, [".png", ".jpg", ".jpeg", ".gif", ".webp", ".avif"].includes(ext));
  }
  return cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 },
});

module.exports = { upload, UPLOAD_ROOT };
