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
} from '@stream-io/video-react-sdk';
import { useRouter, useSearchParams } from 'next/navigation';
import { Users } from 'lucide-react';

import Loader from './Loader';
import EndCallButton from './EndCallButton';
import { cn } from '@/lib/utils';



const MeetingRoom = () => {
  const searchParams = useSearchParams();
  const isPersonalRoom = !!searchParams.get('personal');
  const router = useRouter();
  const [showParticipants, setShowParticipants] = useState(false);
  const { useCallCallingState, useHasOngoingScreenShare } = useCallStateHooks();
  const callingState = useCallCallingState();
  const hasOngoingScreenShare = useHasOngoingScreenShare();

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
      <div className="fixed bottom-0 flex w-full items-center justify-center gap-5">
        <CallControls onLeave={() => router.push(`/`)} />

        <CallStatsButton />
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
