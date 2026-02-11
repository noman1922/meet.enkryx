import { NextRequest, NextResponse } from "next/server";
import { StreamClient } from "@stream-io/node-sdk";

export async function POST(req: NextRequest) {
    console.log(">>> [JOIN API] Request received");
    try {
        const body = await req.json();
        const { passcode } = body;
        console.log(">>> [JOIN API] Passcode:", passcode);

        if (passcode !== "192288") {
            console.log(">>> [JOIN API] Error: Invalid passcode");
            return NextResponse.json({ error: "Invalid passcode" }, { status: 401 });
        }

        const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY;
        const apiSecret = process.env.STREAM_SECRET_KEY;

        if (!apiKey || !apiSecret) {
            console.error(">>> [JOIN API] Error: Stream keys missing in process.env", {
                hasApiKey: !!apiKey,
                hasApiSecret: !!apiSecret
            });
            return NextResponse.json({ error: "Server configuration error (missing keys)" }, { status: 500 });
        }

        const userId = `guest_${Math.floor(Math.random() * 9000) + 1000}`;
        const userName = `Guest_${Math.floor(Math.random() * 9000) + 1000}`;

        console.log(">>> [JOIN API] Initializing StreamClient...");
        const streamClient = new StreamClient(apiKey, apiSecret);

        const expirationTime = Math.floor(Date.now() / 1000) + 3600;
        const issuedAt = Math.floor(Date.now() / 1000) - 60;

        console.log(">>> [JOIN API] Creating token for:", userId);
        const token = streamClient.createToken(userId, expirationTime, issuedAt);

        console.log(">>> [JOIN API] Success. Returning token.");
        return NextResponse.json({ token, userId, userName });
    } catch (error: any) {
        console.error(">>> [JOIN API] CRITICAL ERROR:", error);
        return NextResponse.json({
            error: "Internal Server Error",
            details: error.message || "Unknown error"
        }, { status: 500 });
    }
}
