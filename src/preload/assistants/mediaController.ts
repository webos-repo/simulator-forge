const MediaTags = ['video', 'audio'] as const;

interface State {
  currentPlayingElm?: HTMLMediaElement;
  lastPlayedElm?: HTMLMediaElement;
}
const state: State = {};

export function handlePlayEvent(event: any) {
  state.currentPlayingElm = event.target;
  pauseMedia(state.currentPlayingElm);
}

export function handlePauseEvent(event: any) {
  if (event.target !== state.currentPlayingElm) return;
  state.currentPlayingElm = undefined;
}

export function pauseMediaWhenBg() {
  state.lastPlayedElm = state.currentPlayingElm;
  pauseMedia();
}

function pauseMedia(withoutElement?: Element) {
  MediaTags.forEach((tag) => {
    document.querySelectorAll(tag).forEach((elm) => {
      if (elm === withoutElement || elm.paused) return;
      elm.pause();
    });
  });
}

export function resumeMediaWhenFg() {
  state.lastPlayedElm?.play();
  state.lastPlayedElm = undefined;
}
