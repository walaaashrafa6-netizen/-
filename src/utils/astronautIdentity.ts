export interface AstronautIdentity {
  displayName: string;
  email: string;
  callsign: string;
  rank: string;
  missionName: string;
}

const PROFILE_KEY = 'astra_profile_v1';
export const ASTRONAUT_PROFILE_EVENT = 'astra:profile-updated';

export function getAstronautIdentity(): AstronautIdentity {
  const fallback: AstronautIdentity = {
    displayName: 'Sarah Chen',
    email: '',
    callsign: 'Sarah Chen',
    rank: 'Commander',
    missionName: 'ISS Expedition 72',
  };
  try {
    const saved = JSON.parse(localStorage.getItem(PROFILE_KEY) || '{}');
    return {
      ...fallback,
      ...saved,
      displayName: saved.displayName || saved.callsign || fallback.displayName,
      callsign: saved.callsign || saved.displayName || fallback.callsign,
    };
  } catch {
    return fallback;
  }
}

export function announceAstronautIdentity(identity: AstronautIdentity): void {
  window.dispatchEvent(new CustomEvent<AstronautIdentity>(ASTRONAUT_PROFILE_EVENT, { detail: identity }));
}
