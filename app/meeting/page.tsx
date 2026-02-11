"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { StreamVideo, StreamVideoClient, Call, StreamCall, StreamTheme } from "@stream-io/video-react-sdk";
import Loader from "@/components/Loader";
import MeetingRoom from "@/components/MeetingRoom";

const API_KEY = process.env.NEXT_PUBLIC_STREAM_API_KEY;

export default function MeetingPage() {
    const [client, setClient] = useState<StreamVideoClient | null>(null);
    const [call, setCall] = useState<Call | null>(null);
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem("stream_token");
        const userId = localStorage.getItem("stream_userId");
        const userName = localStorage.getItem("stream_userName");

        if (!token || !userId || !API_KEY) {
            router.push("/");
            return;
        }

        const videoClient = new StreamVideoClient({
            apiKey: API_KEY,
            user: {
                id: userId,
                name: userName || userId,
            },
            token,
        });

        setClient(videoClient);

        const callInstance = videoClient.call("default", "enkryx-office");

        callInstance.join({
            create: true,
            data: {
                settings_override: {
                    audio: {
                        echo_cancellation: true,
                        noise_suppression: true,
                        auto_gain_control: true,
                    } as any,
                    video: {
                        camera_facing: "front",
                        target_resolution: { width: 1280, height: 720 },
                    },
                },
            },
        }).then(() => {
            // Auto-enable camera and mic
            callInstance.camera.enable();
            callInstance.microphone.enable();
            setCall(callInstance);
        }).catch((err) => {
            console.error("Failed to join call:", err);
            router.push("/");
        });

        return () => {
            callInstance.leave();
            videoClient.disconnectUser();
        };
    }, [router]);

    if (!client || !call) return <Loader />;

    return (
        <main className="h-screen w-full bg-dark-2">
            <StreamVideo client={client}>
                <StreamCall call={call}>
                    <StreamTheme>
                        <MeetingRoom />
                    </StreamTheme>
                </StreamCall>
            </StreamVideo>
        </main>
    );
}
