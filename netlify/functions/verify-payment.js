const crypto = require("crypto");

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Content-Type": "application/json",
};

// Build service account credentials from split env vars (avoids 4KB Lambda limit)
function getFirebaseCreds() {
  return {
    type: "service_account",
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token",
  };
}

function getSheetsCreds() {
  return {
    type: "service_account",
    project_id: process.env.GOOGLE_PROJECT_ID,
    private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
    private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token",
  };
}

// Firebase Admin — lazy singleton
let _db = null;
async function getDb() {
  if (_db) return _db;
  const admin = require("firebase-admin");
  if (!admin.apps.length) {
    admin.initializeApp({ credential: admin.credential.cert(getFirebaseCreds()) });
  }
  _db = admin.firestore();
  return _db;
}

async function logToSheets(data) {
  const { google } = require("googleapis");
  const auth = new google.auth.GoogleAuth({
    credentials: getSheetsCreds(),
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  const sheets = google.sheets({ version: "v4", auth });
  await sheets.spreadsheets.values.append({
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    range: "Payments!A:L",
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [[
        new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
        data.customer.name,
        data.customer.school,
        data.customer.email,
        data.customer.phone,
        data.collegeName,
        data.collegeId,
        data.orderId,
        data.paymentId,
        "\u20b9" + data.amount,
        "SUCCESS",
        data.pdfUrl || "",
      ]],
    },
  });
}

async function sendReportEmail({ customer, collegeName, pdfUrl }) {
  const nodemailer = require("nodemailer");
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

  const pdfRes = await fetch(pdfUrl);
  if (!pdfRes.ok) throw new Error("PDF fetch failed: " + pdfRes.status);
  const pdfBuf = Buffer.from(await pdfRes.arrayBuffer());
  const safeName = collegeName.replace(/[^a-z0-9\s]/gi, "").trim().replace(/\s+/g, "-");

  await transporter.sendMail({
    from: `"NM Squad Reports" <${process.env.GMAIL_USER}>`,
    to: customer.email,
    subject: "Your College Report: " + collegeName + " \u2014 NM Squad",
    html: `<div style="font-family:Georgia,serif;max-width:640px;margin:0 auto;background:#faf7f2;"><div style="background:#1a1612;padding:32px 40px;text-align:center;"><div style="font-size:28px;color:#f5f0e8;font-weight:700;">College Search</div><div style="font-size:14px;color:#c0392b;font-style:italic;margin-top:4px;">by NM Squad</div></div><div style="padding:48px 40px;"><h1 style="font-size:24px;color:#1a1612;margin:0 0 16px;">Your Report is Ready</h1><p style="color:#555;margin:0 0 8px;">Dear ${customer.name},</p><p style="color:#333;line-height:1.7;margin:0 0 24px;">Your full college intelligence report for <strong>${collegeName}</strong> is attached as a PDF.</p><p style="color:#999;font-size:13px;">Questions? Reply to this email.</p></div><div style="background:#1a1612;padding:20px 40px;text-align:center;"><p style="color:#666;font-size:11px;letter-spacing:0.08em;text-transform:uppercase;margin:0;">Intelligence Reports &middot; Application Strategy &middot; College Research</p></div></div>`,
    attachments: [{ filename: safeName + "-Report.pdf", content: pdfBuf, contentType: "application/pdf" }],
  });
}

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return { statusCode: 200, headers: CORS, body: "" };
  if (event.httpMethod !== "POST")
    return { statusCode: 405, headers: CORS, body: JSON.stringify({ error: "Method not allowed" }) };

  let body;
  try { body = JSON.parse(event.body); }
  catch { return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: "Invalid request body" }) }; }

  const { razorpay_payment_id, razorpay_order_id, razorpay_signature, customer, collegeId, collegeName, pdfUrl, amount } = body;

  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(razorpay_order_id + "|" + razorpay_payment_id)
    .digest("hex");

  if (expected !== razorpay_signature) {
    console.error("PAYMENT VERIFICATION FAILED");
    return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: "Payment verification failed. No report will be sent." }) };
  }

  try {
    const admin = require("firebase-admin");
    const db = await getDb();
    await db.collection("payments").add({
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      customer, collegeId, collegeName, amount,
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      status: "SUCCESS",
    });
  } catch (e) { console.error("Firebase error (non-fatal):", e.message); }

  try {
    await logToSheets({ customer, collegeId, collegeName, orderId: razorpay_order_id, paymentId: razorpay_payment_id, amount, pdfUrl });
  } catch (e) { console.error("Sheets error (non-fatal):", e.message); }

  if (!pdfUrl) return { statusCode: 200, headers: CORS, body: JSON.stringify({ success: true, message: "Payment recorded." }) };

  try {
    await sendReportEmail({ customer, collegeName, pdfUrl });
  } catch (e) {
    console.error("Email error:", e.message);
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: "Payment confirmed but email failed. Contact support with payment ID: " + razorpay_payment_id }) };
  }

  return { statusCode: 200, headers: CORS, body: JSON.stringify({ success: true, message: "Payment confirmed. Report sent to " + customer.email }) };
};
