const http = require("http");
const https = require("https");
const fs = require("fs");
const path = require("path");
const { randomUUID, createHash, createHmac } = require("crypto");

const port = Number(process.env.PORT) || 4173;
const rootDirectory = __dirname;
const adminDirectory = path.join(rootDirectory, "admin");
const dataDirectory = path.resolve(process.env.DATA_DIR || path.join(rootDirectory, "data"));
const uploadsDirectory = path.resolve(process.env.UPLOADS_DIR || path.join(dataDirectory, "uploads"));
const inquiriesFile = path.join(dataDirectory, "inquiries.json");
const packagesFile = path.join(dataDirectory, "packages.json");
const ordersFile = path.join(dataDirectory, "orders.json");
const isProduction = process.env.NODE_ENV === "production";
const trustProxy = process.env.TRUST_PROXY === "1";
const adminPassword = process.env.ADMIN_PASSWORD || (isProduction ? "" : "oravfx-admin");
const secureCookie = isProduction ? "; Secure" : "";
const sessions = new Map();
const SESSION_MAX_AGE = 1000 * 60 * 60 * 12;
const MAX_REQUEST_BYTES = Number(process.env.MAX_REQUEST_BYTES) || 5_000_000;
const loginAttempts = new Map();
const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const LOGIN_MAX_ATTEMPTS = 8;
const razorpaySecret = process.env.RAZORPAY_KEY_SECRET || "";
const razorpayKeyId = process.env.RAZORPAY_KEY_ID || "";
const razorpayWebhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || razorpaySecret;

const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mp4": "video/mp4",
  ".png": "image/png",
};

const DEFAULT_PACKAGES = [
  {
    id: "brand-identity-package",
    slug: "brand-identity-package",
    name: "Brand Identity Package",
    category: "Branding",
    price: 18000,
    currency: "INR",
    billingType: "One-time",
    summary: "Identity system, visual direction, and branded assets for launch-ready positioning.",
    description: "Includes concept development, logo exploration, typography, brand board, and delivery files.",
    deliverables: ["Logo directions", "Brand board", "Typography system", "Social kit"],
    revisions: "2 included revisions",
    active: true,
    featured: true,
  },
  {
    id: "website-launch-package",
    slug: "website-launch-package",
    name: "Website Launch Package",
    category: "Website Design",
    price: 32000,
    currency: "INR",
    billingType: "One-time",
    summary: "Landing page design plus build for a polished launch experience and conversion funnel.",
    description: "Includes copy direction, landing page design, responsive front-end build, and deployment launch support.",
    deliverables: ["Landing page design", "Responsive build", "Launch QA", "Basic SEO setup"],
    revisions: "3 included revisions",
    active: true,
    featured: true,
  },
  {
    id: "motion-graphics-retainer",
    slug: "motion-graphics-retainer",
    name: "Motion Graphics Retainer",
    category: "Video / Motion",
    price: 26000,
    currency: "INR",
    billingType: "Monthly retainer",
    summary: "Ongoing motion support for social cuts, ad variations, and short-form edits.",
    description: "A flexible monthly plan for short-form edits, kinetic graphics, and fast turnaround revisions.",
    deliverables: ["3 videos / month", "Motion overlays", "Quick revisions", "Usage-ready exports"],
    revisions: "1 revision cycle included",
    active: true,
    featured: false,
  },
];

const SECURITY_HEADERS = {
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "X-Frame-Options": "SAMEORIGIN",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
};

function sendJson(response, statusCode, payload, headers = {}) {
  response.writeHead(statusCode, {
    ...SECURITY_HEADERS,
    "Content-Type": "application/json; charset=utf-8",
    ...headers,
  });
  response.end(JSON.stringify(payload));
}

function readRequestBody(request) {
  return new Promise((resolve, reject) => {
    let body = "";
    let settled = false;
    request.on("data", (chunk) => {
      if (settled) return;
      body += chunk;
      if (Buffer.byteLength(body) > MAX_REQUEST_BYTES) {
        settled = true;
        reject(new Error("Request too large"));
        request.destroy();
      }
    });
    request.on("end", () => { if (!settled) resolve(body); });
    request.on("error", reject);
  });
}

function ensureDataFiles() {
  fs.mkdirSync(dataDirectory, { recursive: true });
  if (!fs.existsSync(inquiriesFile)) fs.writeFileSync(inquiriesFile, "[]");
  if (!fs.existsSync(packagesFile)) fs.writeFileSync(packagesFile, JSON.stringify(DEFAULT_PACKAGES, null, 2));
  if (!fs.existsSync(ordersFile)) fs.writeFileSync(ordersFile, "[]");
}

function readJsonFile(filePath, fallback) {
  try {
    const raw = fs.readFileSync(filePath, "utf8").trim();
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeJsonFile(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  const tempPath = `${filePath}.${process.pid}.${randomUUID()}.tmp`;
  fs.writeFileSync(tempPath, JSON.stringify(value, null, 2), { mode: 0o600 });
  fs.renameSync(tempPath, filePath);
}

function readPackages() {
  ensureDataFiles();
  const packages = readJsonFile(packagesFile, DEFAULT_PACKAGES);
  return Array.isArray(packages) && packages.length ? packages : DEFAULT_PACKAGES;
}

function writePackages(packages) {
  writeJsonFile(packagesFile, Array.isArray(packages) ? packages : DEFAULT_PACKAGES);
}

function readOrders() {
  ensureDataFiles();
  const orders = readJsonFile(ordersFile, []);
  return Array.isArray(orders) ? orders : [];
}

function writeOrders(orders) {
  writeJsonFile(ordersFile, Array.isArray(orders) ? orders : []);
}

function normalizeText(value, fallback = "") {
  return typeof value === "string" ? value.trim() : fallback;
}

function normalizePackage(payload) {
  const name = normalizeText(payload && payload.name, "Custom package");
  const category = normalizeText(payload && payload.category, "General");
  const summary = normalizeText(payload && payload.summary, "Creative package for your next production.");
  const description = normalizeText(payload && payload.description, summary);
  const price = Number(payload && payload.price);
  const currency = normalizeText(payload && payload.currency, "INR");
  const billingType = normalizeText(payload && payload.billingType, "One-time");
  const id = normalizeText(payload && (payload.id || payload.slug), String(name).toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + Date.now());
  const deliverables = Array.isArray(payload && payload.deliverables)
    ? payload.deliverables.map((item) => normalizeText(item, "")).filter(Boolean)
    : [];
  const revisions = normalizeText(payload && payload.revisions, "As agreed");

  return {
    id,
    slug: normalizeText(payload && payload.slug, id),
    name,
    category,
    price: Number.isFinite(price) ? Math.max(0, price) : 0,
    currency,
    billingType,
    summary,
    description,
    deliverables,
    revisions,
    active: payload && payload.active !== undefined ? Boolean(payload.active) : true,
    featured: payload && payload.featured !== undefined ? Boolean(payload.featured) : false,
    createdAt: new Date().toISOString(),
  };
}

function validateInquiry(payload) {
  const fields = payload && payload.fields;
  const services = payload && payload.services;
  if (!fields || !String(fields.fullName || "").trim()) return "Full name is required.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(fields.email || "").trim())) {
    return "A valid email is required.";
  }
  if (!String(fields.phone || "").trim()) return "WhatsApp / phone is required.";
  if (!Array.isArray(services) || services.length === 0) return "Select at least one service.";
  if (!String(fields.details || "").trim()) return "Project details are required.";
  return null;
}

function saveInquiry(payload) {
  fs.mkdirSync(dataDirectory, { recursive: true });
  const inquiryId = randomUUID();
  const files = Array.isArray(payload.files)
    ? payload.files.map((file, index) => {
        if (!file || typeof file !== "object" || !file.data) return file;
        const match = /^data:([^;]+);base64,(.+)$/.exec(file.data);
        if (!match) return { name: String(file.name || "file") };
        const extension = path.extname(String(file.name || "")).toLowerCase();
        const storedName = `${inquiryId}-${index}${extension}`;
        fs.mkdirSync(uploadsDirectory, { recursive: true });
        fs.writeFileSync(path.join(uploadsDirectory, storedName), Buffer.from(match[2], "base64"));
        return {
          name: String(file.name || storedName),
          type: match[1],
          url: `/api/inquiry-files/${encodeURIComponent(storedName)}`,
        };
      })
    : [];
  const inquiries = readInquiries();
  inquiries.push({
    id: inquiryId,
    receivedAt: new Date().toISOString(),
    ...payload,
    files,
  });
  writeInquiries(inquiries);
}

function readInquiries() {
  ensureDataFiles();
  const raw = fs.readFileSync(inquiriesFile, "utf8").trim();
  if (!raw) return [];
  const inquiries = JSON.parse(raw);
  return Array.isArray(inquiries) ? inquiries : [];
}

function writeInquiries(inquiries) {
  fs.mkdirSync(dataDirectory, { recursive: true });
  fs.writeFileSync(inquiriesFile, JSON.stringify(inquiries, null, 2));
}

function cookies(request) {
  const result = {};
  (request.headers.cookie || "").split(";").forEach((part) => {
    const separator = part.indexOf("=");
    if (separator > -1) {
      result[part.slice(0, separator).trim()] = decodeURIComponent(part.slice(separator + 1).trim());
    }
  });
  return result;
}

function authenticated(request) {
  const token = cookies(request).oravfx_admin;
  const created = token && sessions.get(token);
  if (!created) return false;
  if (Date.now() - created > SESSION_MAX_AGE) {
    sessions.delete(token);
    return false;
  }
  return true;
}

function equal(left, right) {
  return createHash("sha256")
    .update(String(left))
    .digest()
    .equals(createHash("sha256").update(String(right)).digest());
}

function clientIp(request) {
  if (trustProxy) {
    const forwarded = String(request.headers["x-forwarded-for"] || "").split(",")[0].trim();
    if (forwarded) return forwarded;
  }
  return request.socket.remoteAddress || "unknown";
}

function loginAllowed(request) {
  const now = Date.now();
  const key = clientIp(request);
  const record = loginAttempts.get(key) || { count: 0, first: now };
  if (now - record.first > LOGIN_WINDOW_MS) {
    loginAttempts.set(key, { count: 1, first: now });
    return true;
  }
  if (record.count >= LOGIN_MAX_ATTEMPTS) return false;
  record.count += 1;
  loginAttempts.set(key, record);
  return true;
}

function clearLoginAttempts(request) { loginAttempts.delete(clientIp(request)); }

function requireAdmin(request, response) {
  if (!authenticated(request)) {
    sendJson(response, 401, { message: "Admin authentication required." });
    return false;
  }
  return true;
}

function verifyRazorpaySignature({ orderId, paymentId, signature, secret }) {
  if (!orderId || !paymentId || !signature || !secret) return false;
  const expected = createHmac("sha256", secret).update(`${orderId}|${paymentId}`).digest("hex");
  return equal(expected, signature);
}

function verifyWebhookSignature(rawBody, signature, secret) {
  if (!rawBody || !signature || !secret) return false;
  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  return equal(expected, signature);
}

function razorpayRequest(method, endpoint, payload) {
  return new Promise((resolve, reject) => {
    const body = payload ? JSON.stringify(payload) : "";
    const request = https.request({
      hostname: "api.razorpay.com",
      path: `/v1/${endpoint}`,
      method,
      auth: `${razorpayKeyId}:${razorpaySecret}`,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(body),
      },
      timeout: 15000,
    }, (response) => {
      let responseBody = "";
      response.setEncoding("utf8");
      response.on("data", (chunk) => { responseBody += chunk; });
      response.on("end", () => {
        let data;
        try { data = JSON.parse(responseBody || "{}"); } catch { data = { error: { description: responseBody } }; }
        if (response.statusCode < 200 || response.statusCode >= 300) {
          return reject(new Error(data.error?.description || `Razorpay returned ${response.statusCode}.`));
        }
        resolve(data);
      });
    });
    request.on("timeout", () => request.destroy(new Error("Razorpay request timed out.")));
    request.on("error", reject);
    if (body) request.write(body);
    request.end();
  });
}

function updateOrder(orderId, updater) {
  const orders = readOrders();
  const index = orders.findIndex((order) => order.id === orderId || order.razorpayOrderId === orderId);
  if (index === -1) return null;
  const next = { ...orders[index] };
  updater(next);
  orders[index] = next;
  writeOrders(orders);
  return next;
}

function paymentStatusFromEvent(event) {
  if (["payment.captured", "order.paid"].includes(event)) return "paid";
  if (event === "payment.failed") return "payment_failed";
  return "payment_pending";
}

function createOrderFromRequest(body) {
  const item = readPackages().find((packageItem) => packageItem.id === body.packageId || packageItem.slug === body.packageId);
  if (!item) return { error: "Package not found." };
  const customer = {
    fullName: normalizeText(body && body.customer && body.customer.fullName, "Customer"),
    email: normalizeText(body && body.customer && body.customer.email, ""),
    phone: normalizeText(body && body.customer && body.customer.phone, ""),
    company: normalizeText(body && body.customer && body.customer.company, ""),
    notes: normalizeText(body && body.customer && body.customer.notes, ""),
  };

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email) || !customer.phone) {
    return { error: "Customer email and phone are required." };
  }

  const order = {
    id: randomUUID(),
    createdAt: new Date().toISOString(),
    packageId: item.id,
    packageName: item.name,
    category: item.category,
    amount: Number(item.price) || 0,
    currency: item.currency || "INR",
    status: "pending_payment",
    paymentMode: body && body.paymentMode === "razorpay" ? "razorpay" : "manual",
    customer,
  };

  const orders = readOrders();
  orders.unshift(order);
  writeOrders(orders);
  return { order };
}

const server = http.createServer(async (request, response) => {
  const url = new URL(request.url, `http://${request.headers.host || "localhost"}`);
  const pathname = url.pathname;
  const declaredLength = Number(request.headers["content-length"] || 0);
  if (declaredLength > MAX_REQUEST_BYTES) {
    return sendJson(response, 413, { message: "Request too large." });
  }

  if (request.method === "GET" && pathname === "/health") {
    return sendJson(response, 200, { ok: true, service: "oravfx", time: new Date().toISOString() });
  }

  if (request.method === "POST" && pathname === "/api/admin/login") {
    try {
      const body = JSON.parse((await readRequestBody(request)) || "{}");
      if (!adminPassword) {
        return sendJson(response, 503, { message: "Admin authentication is not configured." });
      }
      if (!loginAllowed(request)) {
        return sendJson(response, 429, { message: "Too many login attempts. Try again later." });
      }
      if (!equal(body.password || "", adminPassword)) {
        return sendJson(response, 401, { message: "Incorrect admin password." });
      }
      clearLoginAttempts(request);
      const token = randomUUID();
      sessions.set(token, Date.now());
      return sendJson(
        response,
        200,
        { message: "Login successful." },
        {
          "Set-Cookie": `oravfx_admin=${encodeURIComponent(token)}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${SESSION_MAX_AGE / 1000}${secureCookie}`,
        },
      );
    } catch {
      return sendJson(response, 400, { message: "Invalid login request." });
    }
  }

  if (request.method === "POST" && pathname === "/api/admin/logout") {
    const token = cookies(request).oravfx_admin;
    if (token) sessions.delete(token);
    return sendJson(
      response,
      200,
      { message: "Logged out." },
      { "Set-Cookie": `oravfx_admin=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0${secureCookie}` },
    );
  }

  if (request.method === "GET" && pathname === "/api/admin/me") {
    return sendJson(response, 200, { authenticated: authenticated(request) });
  }

  if (request.method === "GET" && pathname === "/api/packages") {
    try {
      return sendJson(response, 200, { packages: readPackages() });
    } catch (error) {
      console.error(error);
      return sendJson(response, 500, { message: "Could not read packages." });
    }
  }

  if (request.method === "POST" && pathname === "/api/packages") {
    if (!requireAdmin(request, response)) return;
    try {
      const body = JSON.parse(await readRequestBody(request));
      if (!body || !body.name) {
        return sendJson(response, 400, { message: "Package name is required." });
      }
      const packages = readPackages();
      const nextPackage = normalizePackage(body);
      packages.unshift(nextPackage);
      writePackages(packages);
      return sendJson(response, 201, { message: "Package created.", package: nextPackage });
    } catch (error) {
      console.error(error);
      return sendJson(response, 400, { message: "Invalid package payload." });
    }
  }

  if (request.method === "PUT" && pathname.startsWith("/api/packages/")) {
    if (!requireAdmin(request, response)) return;
    try {
      const id = decodeURIComponent(pathname.slice("/api/packages/".length));
      const body = JSON.parse(await readRequestBody(request));
      const packages = readPackages();
      const index = packages.findIndex((item) => item.id === id || item.slug === id);
      if (index === -1) return sendJson(response, 404, { message: "Package not found." });
      const merged = { ...packages[index], ...normalizePackage({ ...packages[index], ...body, id: packages[index].id, slug: packages[index].slug }) };
      packages[index] = merged;
      writePackages(packages);
      return sendJson(response, 200, { message: "Package updated.", package: merged });
    } catch (error) {
      console.error(error);
      return sendJson(response, 400, { message: "Invalid package update payload." });
    }
  }

  if (request.method === "DELETE" && pathname.startsWith("/api/packages/")) {
    if (!requireAdmin(request, response)) return;
    try {
      const id = decodeURIComponent(pathname.slice("/api/packages/".length));
      const packages = readPackages();
      const nextPackages = packages.filter((item) => item.id !== id && item.slug !== id);
      if (nextPackages.length === packages.length) {
        return sendJson(response, 404, { message: "Package not found." });
      }
      writePackages(nextPackages);
      return sendJson(response, 200, { message: "Package deleted." });
    } catch (error) {
      console.error(error);
      return sendJson(response, 500, { message: "Could not delete package." });
    }
  }

  if (request.method === "GET" && pathname === "/api/orders") {
    if (!requireAdmin(request, response)) return;
    try {
      const orders = readOrders().sort((left, right) => new Date(right.createdAt || 0) - new Date(left.createdAt || 0));
      return sendJson(response, 200, { orders });
    } catch (error) {
      console.error(error);
      return sendJson(response, 500, { message: "Could not read orders." });
    }
  }

  if (request.method === "POST" && pathname === "/api/orders") {
    try {
      const body = JSON.parse(await readRequestBody(request));
      const result = createOrderFromRequest(body || {});
      if (result.error) return sendJson(response, 400, { message: result.error });
      if (result.order.paymentMode === "razorpay") {
        if (!razorpayKeyId || !razorpaySecret) {
          updateOrder(result.order.id, (order) => { order.status = "payment_pending"; order.paymentError = "Razorpay is not configured."; });
          return sendJson(response, 503, { message: "Online payment is temporarily unavailable. Please choose manual invoice." });
        }
        try {
          const razorpayOrder = await razorpayRequest("POST", "orders", {
            amount: Math.round(result.order.amount * 100),
            currency: result.order.currency,
            receipt: result.order.id,
            notes: { packageId: result.order.packageId, internalOrderId: result.order.id },
          });
          const order = updateOrder(result.order.id, (item) => {
            item.status = "payment_processing";
            item.razorpayOrderId = razorpayOrder.id;
            item.payment = { provider: "razorpay", amount: razorpayOrder.amount, currency: razorpayOrder.currency };
          });
          return sendJson(response, 201, {
            message: "Razorpay checkout created.",
            order: { ...order, razorpayKeyId },
          });
        } catch (error) {
          updateOrder(result.order.id, (order) => { order.status = "payment_pending"; order.paymentError = error.message; });
          return sendJson(response, 502, { message: "Could not start online payment. Please try again or choose manual invoice." });
        }
      }
      return sendJson(response, 201, {
        message: "Package order created successfully.",
        order: result.order,
      });
    } catch (error) {
      console.error(error);
      return sendJson(response, 400, { message: "Please send valid order data." });
    }
  }

  if (request.method === "POST" && pathname === "/api/payments/verify") {
    try {
      const body = JSON.parse(await readRequestBody(request));
      if (!razorpaySecret) {
        return sendJson(response, 400, { message: "Razorpay secret is not configured on this server." });
      }
      const isValid = verifyRazorpaySignature({
        orderId: body && body.razorpayOrderId,
        paymentId: body && body.paymentId,
        signature: body && body.signature,
        secret: razorpaySecret,
      });
      if (!isValid) return sendJson(response, 400, { message: "Invalid payment signature." });
      const order = updateOrder(body.internalOrderId, (item) => {
        if (item.razorpayOrderId !== body.razorpayOrderId) throw new Error("Payment order mismatch.");
        if (item.status !== "paid") {
          item.status = "paid";
          item.payment = { ...(item.payment || {}), paymentId: body.paymentId, verifiedAt: new Date().toISOString() };
        }
      });
      if (!order) return sendJson(response, 404, { message: "Order not found." });
      return sendJson(response, 200, { ok: true, message: "Payment verified.", order });
    } catch (error) {
      console.error(error);
      return sendJson(response, 400, { message: error.message || "Invalid payment verification payload." });
    }
  }

  if (request.method === "POST" && pathname === "/api/payments/failed") {
    try {
      const body = JSON.parse(await readRequestBody(request));
      const order = updateOrder(body.internalOrderId, (item) => {
        if (item.razorpayOrderId !== body.razorpayOrderId) throw new Error("Payment order mismatch.");
        if (item.status !== "paid") {
          item.status = "payment_failed";
          item.payment = { ...(item.payment || {}), failure: body.reason || "Payment was not completed.", failedAt: new Date().toISOString() };
        }
      });
      if (!order) return sendJson(response, 404, { message: "Order not found." });
      return sendJson(response, 200, { ok: true, order });
    } catch (error) {
      return sendJson(response, 400, { message: error.message || "Invalid payment failure payload." });
    }
  }

  if (request.method === "POST" && pathname === "/api/webhooks/payment") {
    try {
      const rawBody = await readRequestBody(request);
      const signature = request.headers["x-razorpay-signature"] || "";
      if (!razorpayWebhookSecret) {
        return sendJson(response, 400, { message: "Webhook verification is disabled." });
      }
      if (!verifyWebhookSignature(rawBody, String(signature), razorpayWebhookSecret)) {
        return sendJson(response, 400, { message: "Invalid Razorpay webhook signature." });
      }
      const payload = JSON.parse(rawBody || "{}");
      const eventId = request.headers["x-razorpay-event-id"] || payload.id || "";
      const entity = payload.payload?.payment?.entity || payload.payload?.order?.entity || {};
      const orderId = entity.order_id || entity.id || payload.order_id;
      const order = updateOrder(orderId, (item) => {
        if (eventId && item.payment?.processedEvents?.includes(eventId)) return;
        item.status = paymentStatusFromEvent(payload.event);
        item.payment = {
          ...(item.payment || {}),
          paymentId: entity.id || item.payment?.paymentId,
          webhookVerifiedAt: new Date().toISOString(),
          processedEvents: [...new Set([...(item.payment?.processedEvents || []), eventId].filter(Boolean))],
        };
      });
      return sendJson(response, 200, { ok: true, message: "Webhook accepted." });
    } catch (error) {
      console.error(error);
      return sendJson(response, 400, { message: "Invalid webhook payload." });
    }
  }

  if (request.method === "PATCH" && pathname.startsWith("/api/orders/")) {
    if (!requireAdmin(request, response)) return;
    try {
      const id = decodeURIComponent(pathname.slice("/api/orders/".length));
      const body = JSON.parse(await readRequestBody(request));
      const allowed = ["pending_payment", "payment_processing", "payment_pending", "paid", "payment_failed", "cancelled"];
      if (!allowed.includes(body.status)) return sendJson(response, 400, { message: "Invalid order status." });
      const order = updateOrder(id, (item) => { item.status = body.status; item.updatedAt = new Date().toISOString(); });
      if (!order) return sendJson(response, 404, { message: "Order not found." });
      return sendJson(response, 200, { message: "Order updated.", order });
    } catch (error) {
      return sendJson(response, 400, { message: "Invalid order update payload." });
    }
  }

  if (request.method === "GET" && pathname === "/api/inquiries") {
    if (!requireAdmin(request, response)) return;
    try {
      const inquiries = readInquiries().sort((left, right) => new Date(right.receivedAt || 0) - new Date(left.receivedAt || 0));
      return sendJson(response, 200, { inquiries });
    } catch (error) {
      console.error(error);
      return sendJson(response, 500, { message: "Could not read inquiries." });
    }
  }

  if (request.method === "DELETE" && pathname.startsWith("/api/inquiries/")) {
    if (!requireAdmin(request, response)) return;
    const id = decodeURIComponent(pathname.slice("/api/inquiries/".length));
    try {
      const inquiries = readInquiries();
      const deleted = inquiries.find((inquiry) => inquiry.id === id);
      const filtered = inquiries.filter((inquiry) => inquiry.id !== id);
      if (filtered.length === inquiries.length) {
        return sendJson(response, 404, { message: "Inquiry not found." });
      }
      for (const file of deleted.files || []) {
        if (file && file.url) {
          const storedName = decodeURIComponent(file.url.split("/").pop());
          const filePath = path.resolve(uploadsDirectory, storedName);
          if (filePath.startsWith(uploadsDirectory + path.sep)) {
            fs.rmSync(filePath, { force: true });
          }
        }
      }
      writeInquiries(filtered);
      return sendJson(response, 200, { message: "Inquiry deleted." });
    } catch (error) {
      console.error(error);
      return sendJson(response, 500, { message: "Could not delete inquiry." });
    }
  }

  if (request.method === "GET" && pathname.startsWith("/api/inquiry-files/")) {
    if (!requireAdmin(request, response)) return;
    const storedName = decodeURIComponent(pathname.slice("/api/inquiry-files/".length));
    const filePath = path.resolve(uploadsDirectory, storedName);
    if (!filePath.startsWith(uploadsDirectory + path.sep)) {
      return sendJson(response, 403, { message: "Forbidden." });
    }
    return fs.stat(filePath, (error, stats) => {
      if (error || !stats.isFile()) {
        response.writeHead(404);
        return response.end("Not found");
      }
      response.writeHead(200, {
        "Content-Type": "application/octet-stream",
        "Content-Length": stats.size,
        "Content-Disposition": `inline; filename="${path.basename(storedName)}"`,
      });
      if (request.method === "HEAD") return response.end();
      fs.createReadStream(filePath).pipe(response);
    });
  }

  if (request.method === "POST" && pathname === "/api/inquiry") {
    try {
      const payload = JSON.parse(await readRequestBody(request));
      const validationError = validateInquiry(payload);
      if (validationError) return sendJson(response, 400, { message: validationError });
      saveInquiry(payload);
      return sendJson(response, 201, { message: "Your project inquiry has been received. We'll be in touch soon." });
    } catch (error) {
      return sendJson(response, 400, { message: "Please send valid inquiry data." });
    }
  }

  if (request.method === "GET" && pathname === "/robots.txt") {
    const forwardedProto = String(request.headers["x-forwarded-proto"] || "").split(",")[0].trim();
    const protocol = forwardedProto === "https" || request.socket.encrypted ? "https" : "http";
    const host = request.headers.host || "localhost";
    const body = [
      "User-agent: *",
      "Disallow: /admin",
      "Disallow: /api/",
      "Disallow: /data",
      "Disallow: /uploads",
      `Sitemap: ${protocol}://${host}/sitemap.xml`,
      "",
    ].join("\n");
    response.writeHead(200, {
      ...SECURITY_HEADERS,
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    });
    return response.end(body);
  }

  if (request.method === "GET" && pathname === "/sitemap.xml") {
    const forwardedProto = String(request.headers["x-forwarded-proto"] || "").split(",")[0].trim();
    const protocol = forwardedProto === "https" || request.socket.encrypted ? "https" : "http";
    const host = request.headers.host || "localhost";
    const siteUrl = `${protocol}://${host}`;
    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>${siteUrl}/ora/</loc></url>\n</urlset>`;
    response.writeHead(200, {
      ...SECURITY_HEADERS,
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    });
    return response.end(xml);
  }

  if (request.method !== "GET" && request.method !== "HEAD") {
    return sendJson(response, 405, { message: "Method not allowed." });
  }

  const protectedStaticPaths = new Set([
    "/server.js", "/package.json", "/package-lock.json", "/admin/server.js",
  ]);
  if (protectedStaticPaths.has(pathname) || pathname.startsWith("/.git") || pathname === "/.env" || pathname.startsWith("/.env.")) {
    response.writeHead(404, SECURITY_HEADERS);
    return response.end("Not found");
  }

  if (pathname === "/data" || pathname.startsWith("/data/") || pathname === "/uploads" || pathname.startsWith("/uploads/")) {
    response.writeHead(404, SECURITY_HEADERS);
    return response.end("Not found");
  }

  if (pathname === "/") {
    response.writeHead(302, { Location: "/ora/" });
    return response.end();
  }

  const requestedPath = pathname.endsWith("/") ? `${pathname}index.html` : pathname;
  let decodedPath;
  try {
    decodedPath = decodeURIComponent(requestedPath);
  } catch {
    return sendJson(response, 400, { message: "Invalid URL." });
  }
  const isAdminPath = decodedPath === "/admin" || decodedPath.startsWith("/admin/");
  const staticRoot = isAdminPath ? adminDirectory : rootDirectory;
  const staticPath = isAdminPath ? decodedPath.slice("/admin".length) || "/index.html" : decodedPath;
  const filePath = path.resolve(staticRoot, `.${staticPath.endsWith("/") ? `${staticPath}index.html` : staticPath}`);
  if (!filePath.startsWith(staticRoot + path.sep) && filePath !== staticRoot) {
    return sendJson(response, 403, { message: "Forbidden." });
  }

  fs.stat(filePath, (error, fileStats) => {
    if (error) {
      response.writeHead(error.code === "ENOENT" ? 404 : 500);
      return response.end(error.code === "ENOENT" ? "Not found" : "Server error");
    }
    const extension = path.extname(filePath).toLowerCase();
    const headers = {
      ...SECURITY_HEADERS,
      "Content-Type": mimeTypes[extension] || "application/octet-stream",
      "Accept-Ranges": "bytes",
      "Content-Length": fileStats.size,
      "Cache-Control": extension === ".html" ? "no-cache" : "public, max-age=86400",
    };
    const range = request.headers.range;

    if (range && extension === ".mp4") {
      const match = /^bytes=(\d*)-(\d*)$/.exec(range);
      if (!match) {
        response.writeHead(416, { "Content-Range": `bytes */${fileStats.size}` });
        return response.end();
      }
      const start = match[1] ? Number(match[1]) : Math.max(0, fileStats.size - Number(match[2]));
      const end = match[2] ? Number(match[2]) : fileStats.size - 1;
      if (start > end || start >= fileStats.size) {
        response.writeHead(416, { "Content-Range": `bytes */${fileStats.size}` });
        return response.end();
      }
      const boundedEnd = Math.min(end, fileStats.size - 1);
      headers["Content-Range"] = `bytes ${start}-${boundedEnd}/${fileStats.size}`;
      headers["Content-Length"] = boundedEnd - start + 1;
      response.writeHead(206, headers);
      if (request.method === "HEAD") return response.end();
      return fs.createReadStream(filePath, { start, end: boundedEnd }).pipe(response);
    }

    response.writeHead(200, headers);
    if (request.method === "HEAD") return response.end();
    fs.createReadStream(filePath).pipe(response);
  });
});

server.listen(port, () => {
  console.log(`OraVFX server running at http://localhost:${port}`);
  if (isProduction && !adminPassword) console.error("ERROR: ADMIN_PASSWORD is required in production.");
  if (isProduction && !process.env.RAZORPAY_KEY_ID) console.warn("WARNING: Razorpay is not configured; online payments will be unavailable.");
});
