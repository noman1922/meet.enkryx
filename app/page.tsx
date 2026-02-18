"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";

export default function Home() {
    const [passcode, setPasscode] = useState("");
    const [userName, setUserName] = useState("");
    const [step, setStep] = useState<"passcode" | "name">("passcode");
    const [isJoining, setIsJoining] = useState(false);
    const [joinedData, setJoinedData] = useState<{ token: string; userId: string } | null>(null);
    const { toast } = useToast();

    useEffect(() => {
        // Clear old session
        localStorage.removeItem("stream_token");
        localStorage.removeItem("stream_userId");
        localStorage.removeItem("stream_userName");
    }, []);

    const handlePasscodeSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!passcode || isJoining) return;

        setIsJoining(true);
        try {
            const response = await fetch("/api/join", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ passcode: passcode.trim() }),
            });

            const data = await response.json();

            if (response.ok && data.token) {
                setJoinedData({ token: data.token, userId: data.userId });
                setStep("name");
            } else {
                const errorMsg = data.error || data.details || "Access Denied";
                alert("Fail: " + errorMsg);
                toast({
                    title: "Access Denied",
                    description: errorMsg,
                    variant: "destructive",
                });
            }
        } catch (err: any) {
            alert("Critical Error: " + err.message);
            toast({
                title: "Connection Error",
                description: err.message,
                variant: "destructive",
            });
        } finally {
            setIsJoining(false);
        }
    };

    const handleJoinMeeting = (e: React.FormEvent) => {
        e.preventDefault();
        if (!userName.trim() || !joinedData) return;

        localStorage.setItem("stream_token", joinedData.token);
        localStorage.setItem("stream_userId", joinedData.userId);
        localStorage.setItem("stream_userName", userName.trim());

        window.location.assign("/meeting");
    };

    return (
        <main className="flex min-h-screen flex-col items-center justify-center bg-dark-2 p-4">
            <div className="w-full max-w-md rounded-2xl bg-dark-1 p-10 shadow-2xl animate-in fade-in zoom-in duration-500">
                <div className="flex flex-col items-center gap-8">
                    <div className="flex flex-col items-center gap-3">
                        <div className="rounded-full bg-blue-1/10 p-4 mb-2">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-12 w-12 text-blue-1">
                                <path d="M15 10l5 5-5 5" />
                                <path d="M4 4v7a4 4 0 0 0 4 4h12" />
                            </svg>
                        </div>
                        <h1 className="text-4xl font-black text-white uppercase tracking-[0.3em]">enkryx</h1>
                    </div>

                    {step === "passcode" ? (
                        <form onSubmit={handlePasscodeSubmit} className="space-y-6 w-full mt-4">
                            <div className="space-y-2 text-center">
                                <h2 className="text-xl font-bold text-gray-100">Enter Meeting Passcode</h2>
                            </div>

                            <div className="space-y-4">
                                <Input
                                    type="password"
                                    placeholder="******"
                                    value={passcode}
                                    onChange={(e) => setPasscode(e.target.value)}
                                    className="bg-dark-3 border-none text-white text-center text-3xl tracking-[0.5em] h-16 focus-visible:ring-2 focus-visible:ring-blue-1 rounded-xl"
                                    autoFocus
                                    required
                                />
                                <Button
                                    type="submit"
                                    disabled={isJoining || !passcode}
                                    className="w-full h-14 bg-blue-1 hover:bg-blue-600 text-white text-lg font-bold transition-all rounded-xl mt-2 shadow-lg shadow-blue-1/20"
                                >
                                    {isJoining ? "Joining..." : "Join Meeting"}
                                </Button>
                            </div>
                        </form>
                    ) : (
                        <form onSubmit={handleJoinMeeting} className="space-y-6 w-full mt-4">
                            <div className="space-y-2 text-center">
                                <h2 className="text-xl font-bold text-gray-100">Enter Your Name</h2>
                                <p className="text-gray-400">Please provide a name for the meeting.</p>
                            </div>

                            <div className="space-y-4">
                                <Input
                                    type="text"
                                    placeholder="Your Name"
                                    value={userName}
                                    onChange={(e) => setUserName(e.target.value)}
                                    className="bg-dark-3 border-none text-white text-center text-2xl h-16 focus-visible:ring-2 focus-visible:ring-blue-1 rounded-xl"
                                    autoFocus
                                    required
                                />
                                <Button
                                    type="submit"
                                    disabled={!userName.trim()}
                                    className="w-full h-14 bg-blue-1 hover:bg-blue-600 text-white text-lg font-bold transition-all rounded-xl mt-2 shadow-lg shadow-blue-1/20"
                                >
                                    Enter Meeting
                                </Button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </main>
    );
}
