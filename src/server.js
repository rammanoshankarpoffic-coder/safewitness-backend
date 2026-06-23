import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import Groq from "groq-sdk";
import { ethers } from "ethers";

dotenv.config();

const app = express();
app.use(cors()); // allows your teammate's frontend to call this server from a different origin
app.use(express.json({ limit: "10mb" })); // generous limit since audio_base64 can be large

const PORT = process.env.PORT || 3000;

// Set up the Groq client using the key from .env
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Set up the Ethereum Sepolia testnet connection
// provider = our connection to the Sepolia network
// wallet   = our account that will actually send transactions
const provider = new ethers.JsonRpcProvider(process.env.TESTNET_RPC_URL);
const wallet = new ethers.Wallet(process.env.TESTNET_PRIVATE_KEY, provider);

// ---------------------------------------------
// ROLE C: POST /anchor
// Receives an evidence hash and sends a real transaction on Ethereum Sepolia
// testnet with that hash embedded in the transaction data. This creates a
// public, timestamped, independently-verifiable record.
// ---------------------------------------------
app.post("/anchor", async (req, res) => {
  const { hash } = req.body;

  if (!hash) {
    return res.status(400).json({ error: "Missing 'hash' in request body" });
  }

  try {
    // We send a tiny transaction to ourselves, with the evidence hash
    // tucked into the transaction's "data" field. No smart contract needed —
    // the hash being permanently recorded in a public transaction is enough.
    const tx = await wallet.sendTransaction({
      to: wallet.address, // sending to ourselves — we just need the hash recorded
      value: 0,
      data: ethers.hexlify(ethers.toUtf8Bytes(hash)),
    });

    console.log("✅ Real Sepolia transaction sent:", tx.hash);

    // Wait for it to actually be confirmed on-chain before responding
    await tx.wait();

    res.json({
      txId: tx.hash,
      explorerUrl: `https://sepolia.etherscan.io/tx/${tx.hash}`,
    });
  } catch (err) {
    console.error("❌ Blockchain anchoring error:", err.message);
    res.status(500).json({ error: "Failed to anchor hash", details: err.message });
  }
});

// ---------------------------------------------
// ROLE D: POST /generate-report
// Receives capsule metadata, calls Groq API (free, no card required) to
// generate a structured incident report in a regional language (Tamil by default).
// ---------------------------------------------
app.post("/generate-report", async (req, res) => {
  const { timestamp, location, transcript } = req.body;

  if (!timestamp || !location) {
    return res.status(400).json({ error: "Missing 'timestamp' or 'location' in request body" });
  }

  try {
    const prompt = `You are helping generate a structured incident report to support a survivor filing an FIR (First Information Report) in India.

Here is the evidence captured by a safety app:
- Timestamp: ${timestamp}
- Location (lat, lng): ${location.lat}, ${location.lng}
- Audio transcript (may be partial or placeholder): ${transcript || "(no transcript provided)"}

Write a clear, structured incident report in TAMIL with these exact sections:
1. நேரம் (Time)
2. இடம் (Location)
3. சம்பவ விவரம் (Sequence of events, based on the transcript)
4. அடுத்த படிகள் (Suggested next steps for filing an FIR)

Keep the tone factual, calm, and respectful. Do not invent details that aren't supported by the transcript — if the transcript is a placeholder, note that clearly rather than fabricating events.`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
    });

    const reportText = completion.choices[0].message.content;

    console.log("✅ Real Groq report generated");

    res.json({ report: reportText });
  } catch (err) {
    console.error("❌ Groq API error:", err.message);
    res.status(500).json({ error: "Failed to generate report", details: err.message });
  }
});

// Simple health check — useful to confirm the server is up
app.get("/", (req, res) => {
  res.send("SafeWitness backend is running ✅");
});

app.listen(PORT, () => {
  console.log(`🚀 SafeWitness backend running on http://localhost:${PORT}`);
});
