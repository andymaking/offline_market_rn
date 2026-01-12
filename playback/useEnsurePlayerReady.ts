import React from 'react';

import { bootstrapData } from '@/playback/bootstrap';
import { startPlayer } from '@/playback/player';
import { usePlaybackStore } from '@/stores/playbackStore';

let cachedEvents: any[] | null = null;

export function useEnsurePlayerReady() {
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    (async () => {
      const { events } = await bootstrapData();
      cachedEvents = events;
      setReady(true);
    })();
  }, []);

  return { ready, events: cachedEvents };
}

export async function ensurePlayerAndPlay() {
  const play = usePlaybackStore.getState().play;
  if (!cachedEvents) {
    const { events } = await bootstrapData();
    cachedEvents = events;
  }
  play();
  if (cachedEvents) {
    await startPlayer(cachedEvents as any);
  }
}
