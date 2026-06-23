# SafeWitness Backend — README

This is your half of the SafeWitness project: a small server that does two things:
1. `/generate-report` — sends evidence details to Groq's AI and gets back a structured incident report in Tamil. **This is real and working.**
2. `/anchor` — will eventually send an evidence hash to a public blockchain testnet. **This currently returns fake/mock data — still needs to be built (see Step 3 in the build plan).**

---

## Step 1: Install Node.js (if you don't already have it)

Go to **nodejs.org**, download the "LTS" version, install it like any normal program.

To check it worked, open a terminal (Command Prompt on Windows, Terminal on Mac) and type:
```
node --version
```
You should see a version number, like `v22.x.x`.

---

## Step 2: Unzip this project and install its dependencies

1. Unzip the folder you downloaded somewhere easy to find (like your Desktop).
2. Open a terminal **inside that folder**. (On Windows: open the folder, type `cmd` in the address bar and press Enter. On Mac: right-click the folder → "New Terminal at Folder", or `cd` into it manually.)
3. Type this and press Enter:
   ```
   npm install
   ```
   This downloads all the tools the project needs. It'll take a minute or two — you'll see a progress output, then it'll finish.

---

## Step 3: Add your real Groq API key

1. In the project folder, find the file called **`.env.example`**.
2. Make a **copy** of it, and rename the copy to exactly **`.env`** (just `.env`, nothing after it).
3. Open `.env` in any text editor (Notepad is fine).
4. Find this line:
   ```
   GROQ_API_KEY=your_groq_api_key_here
   ```
5. Replace `your_groq_api_key_here` with your real key (the one starting with `gsk_...` from console.groq.com).
6. Save the file.

⚠️ Never share this `.env` file with anyone or upload it to GitHub — it has your real secret key in it. The `.gitignore` file already included in this project is set up to prevent this automatically if you use Git.

---

## Step 4: Run the server

In the same terminal, type:
```
npm start
```

If everything worked, you should see:
```
🚀 SafeWitness backend running on http://localhost:3000
```

This means your server is alive and listening. **Leave this terminal window open** — closing it stops the server.

---

## Step 5: Test that it actually works

Open a **second** terminal window (keep the first one running), and paste this in:

**On Mac/Linux:**
```bash
curl -X POST http://localhost:3000/generate-report -H "Content-Type: application/json" -d '{"timestamp":"2026-06-23T22:15:00Z","location":{"lat":13.0827,"lng":80.2707},"transcript":"Help, someone is following me near the bus stop"}'
```

**On Windows (PowerShell):**
```powershell
curl.exe -X POST http://localhost:3000/generate-report -H "Content-Type: application/json" -d '{\"timestamp\":\"2026-06-23T22:15:00Z\",\"location\":{\"lat\":13.0827,\"lng\":80.2707},\"transcript\":\"Help, someone is following me near the bus stop\"}'
```

If it works, you'll see a JSON response with a `report` field containing a real, AI-generated Tamil incident report. 🎉

If you see an error instead, copy the exact error text and bring it back to this conversation — we'll debug it together.

---

## What's done vs. what's left (see the full build plan file for details)

✅ **Done:** `/generate-report` — real Groq AI call, working
🔲 **Still to do:**
- `/anchor` — wire in the real Polygon Amoy testnet wallet + transaction logic
- Deploy this server online (so your teammate's Flutter app can reach it from a real phone, not just your laptop)
- Build the mesh-layer explainer diagram

Refer back to the main **SafeWitness Build Plan** file for the full step-by-step on these remaining pieces.
