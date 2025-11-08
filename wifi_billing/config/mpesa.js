require("dotenv").config();
const axios = require("axios");
const moment = require("moment");

const MPESA_ENV = process.env.MPESA_ENV || "sandbox"; // "sandbox" or "production"
const MPESA_BASE_URL = MPESA_ENV === "sandbox" ? "https://sandbox.safaricom.co.ke" : "https://api.safaricom.co.ke";

// ✅ Check if M-Pesa is enabled (for development, can be disabled)
const MPESA_ENABLED = process.env.MPESA_ENABLED !== "false";

if (MPESA_ENABLED) {
    const REQUIRED_ENV_VARS = [
        "MPESA_CONSUMER_KEY",
        "MPESA_CONSUMER_SECRET",
        "MPESA_SHORTCODE",
        "MPESA_PASSKEY",
        "MPESA_CALLBACK_URL"
    ];

    for (const varName of REQUIRED_ENV_VARS) {
        if (!process.env[varName] || process.env[varName] === "your_consumer_key_here" || process.env[varName] === "your_consumer_secret_here" || process.env[varName] === "your_passkey_here") {
            console.warn(`⚠️  Missing or placeholder value for: ${varName}`);
            console.warn(`⚠️  M-Pesa will run in MOCK mode. Set MPESA_ENABLED=false to disable this warning.`);
        }
    }
}

// ✅ Get access token
const getAccessToken = async () => {
    const auth = Buffer.from(`${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`).toString("base64");

    try {
        const response = await axios.get(`${MPESA_BASE_URL}/oauth/v1/generate?grant_type=client_credentials`, {
            headers: { Authorization: `Basic ${auth}` }
        });
        console.log("✅ MPesa Access Token Obtained Successfully");
        return response.data.access_token;
    } catch (error) {
        console.error("❌ MPesa Auth Error:", error.response ? error.response.data : error.message);
        return null;
    }
};

// ✅ STK Push
const stkPush = async (phone, amount, transactionId) => {
    console.log(`📩 STK Push Request: Phone: ${phone}, Amount: ${amount}, TransactionID: ${transactionId}`);

    const accessToken = await getAccessToken();
    if (!accessToken) {
        console.error("❌ Failed to get MPesa access token. STK Push aborted.");
        return null;
    }

    const timestamp = moment().format("YYYYMMDDHHmmss");
    const password = Buffer.from(`${process.env.MPESA_SHORTCODE}${process.env.MPESA_PASSKEY}${timestamp}`).toString("base64");

    const payload = {
        BusinessShortCode: process.env.MPESA_SHORTCODE,
        Password: password,
        Timestamp: timestamp,
        TransactionType: "CustomerPayBillOnline",
        Amount: amount,
        PartyA: phone,
        PartyB: process.env.MPESA_SHORTCODE,
        PhoneNumber: phone,
        CallBackURL: process.env.MPESA_CALLBACK_URL,
        AccountReference: "WiFi Payment",
        TransactionDesc: `WiFi Payment - ${transactionId}`
    };

    try {
        console.log("📤 Sending STK Push...");
        const response = await axios.post(`${MPESA_BASE_URL}/mpesa/stkpush/v1/processrequest`, payload, {
            headers: { Authorization: `Bearer ${accessToken}` }
        });

        if (response.data.ResponseCode === "0") {
            console.log("✅ STK Push Successful:", response.data);
            return response.data;
        } else {
            console.error("❌ STK Push Failed:", response.data);
            return null;
        }
    } catch (error) {
        console.error("❌ MPesa STK Push Error:", error.response ? error.response.data : error.message);
        return null;
    }
};

module.exports = { stkPush };
