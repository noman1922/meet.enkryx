'use client';
import { useState } from 'react';
import {
  CallControls,
  CallParticipantsList,
  CallStatsButton,
  CallingState,
  PaginatedGridLayout,
  SpeakerLayout,
  useCallStateHooks,
  useCall,
} from '@stream-io/video-react-sdk';
import { useRouter, useSearchParams } from 'next/navigation';
import { Users, Volume2 } from 'lucide-react';

import Loader from './Loader';
import EndCallButton from './EndCallButton';
import { cn } from '@/lib/utils';



const MeetingRoom = () => {
  const searchParams = useSearchParams();
  const isPersonalRoom = !!searchParams.get('personal');
  const router = useRouter();
  const [showParticipants, setShowParticipants] = useState(false);
  const [showSpeakerMenu, setShowSpeakerMenu] = useState(false);
  const { useCallCallingState, useHasOngoingScreenShare, useSpeakerState } = useCallStateHooks();
  const callingState = useCallCallingState();
  const hasOngoingScreenShare = useHasOngoingScreenShare();
  const { devices: speakers, selectedDevice: selectedSpeaker } = useSpeakerState();
  const call = useCall();

  if (callingState !== CallingState.JOINED) return <Loader />;

  const CallLayout = () => {
    if (hasOngoingScreenShare) {
      return <SpeakerLayout participantsBarPosition="bottom" />;
    }
    return <PaginatedGridLayout />;
  };

  return (
    <section className="relative h-screen w-full overflow-hidden pt-4 text-white">
      <div className="relative flex size-full items-center justify-center">
        <div className=" flex size-full max-w-[1000px] items-center">
          <CallLayout />
        </div>
        <div
          className={cn('h-[calc(100vh-86px)] hidden ml-2', {
            'show-block': showParticipants,
          })}
        >
          <CallParticipantsList onClose={() => setShowParticipants(false)} />
        </div>
      </div>
      {/* video layout and call controls */}
      <div className="fixed bottom-0 flex w-full items-center justify-center gap-5 p-2 bg-dark-1/80 backdrop-blur-md">
        <CallControls onLeave={() => router.push(`/`)} />

        <CallStatsButton />

        {speakers && (
          <div className="relative group">
            <button
              onClick={() => setShowSpeakerMenu((prev) => !prev)}
              className="cursor-pointer rounded-2xl bg-[#19232d] px-4 py-2 hover:bg-[#4c535b] flex items-center gap-2"
              title="Select Speaker"
            >
              <Volume2 size={20} className="text-white" />
            </button>

            {showSpeakerMenu && (
              <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-dark-1 border border-dark-3 rounded-lg p-2 shadow-xl min-w-[200px] z-50">
                <p className="text-xs text-gray-400 mb-2 px-2">Select Speaker</p>
                <div className="flex flex-col gap-1">
                  {speakers.length > 0 ? (
                    speakers.map((speaker) => (
                      <button
                        key={speaker.deviceId}
                        onClick={() => {
                          call?.speaker.select(speaker.deviceId);
                          setShowSpeakerMenu(false);
                        }}
                        className={cn(
                          "text-left text-sm p-2 rounded hover:bg-dark-3 transition-colors",
                          selectedSpeaker === speaker.deviceId ? "bg-blue-1 text-white" : "text-gray-200"
                        )}
                      >
                        {speaker.label || 'Default Speaker'}
                      </button>
                    ))
                  ) : (
                    <p className="text-xs p-2 text-gray-500">No output devices found</p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        <button onClick={() => setShowParticipants((prev) => !prev)}>
          <div className=" cursor-pointer rounded-2xl bg-[#19232d] px-4 py-2 hover:bg-[#4c535b]  ">
            <Users size={20} className="text-white" />
          </div>
        </button>
        {!isPersonalRoom && <EndCallButton />}
      </div>
    </section>
  );
};

export default MeetingRoom;
