/**
 * The client videos: one entry per video, in the order of `testimonials.videos` in home-v11.json, which holds every
 * word shown with them. This file holds the files and colours. `client` is the client's name as the case study shows
 * it, so a study finds its video by name. The videos sit in the Sanity `proposals` dataset; stills are 1280 × 720.
 */
const FILES = 'https://cdn.sanity.io/files/xjjjqhgt/proposals';

export const CLIENT_VIDEOS = [
  { key: 'maksim', client: 'Outbound Specialist', video: `${FILES}/b06b514be51d437bb81031a9f96cc6e5796767e6.mp4`, still: 'video-maksim.jpg', icon: 'logos/fav-outbound.png', tint: '#e9e5fd', portrait: false },
  { key: 'sarig', client: 'Dimer Health', video: `${FILES}/cbba2c1526479ce38d8dab811802738ae3a1659b.mp4`, still: 'video-dimer.jpg', icon: 'logos/fav-dimer.png', tint: '#fde6dd', portrait: false },
  { key: 'elizabete', client: 'Reiterate', video: `${FILES}/77f7444f1da7ed7a221c1637d897a0f4ec3e87aa.mp4`, still: 'video-elizabete.jpg', icon: 'logos/fav-reiterate.png', tint: '#fcf0d4', portrait: false },
  { key: 'kevin', client: 'Genie Teacher', video: `${FILES}/944a231b935cc95bdcf702b624f5e4af02879da7.mp4`, still: 'video-kevin.jpg', icon: 'logos/genie-icon.png', tint: '#e8ecfb', portrait: false },
  { key: 'daan', client: 'Brandfirm', video: `${FILES}/57697fa16e0d045b8ba0bc804bf9223cc6cb8788.mp4`, still: 'video-daan.jpg', icon: 'logos/fav-brandfirm.png', tint: '#fbe9df', portrait: false },
  /** Recorded on a phone: the player shows it whole on a dark ground instead of cropping it. */
  { key: 'kasimir', client: 'Onne', video: `${FILES}/f32240d1f970aead07a1da44be99062efeebd83c.mp4`, still: 'video-kasimir.jpg', icon: null, tint: '#ecebf2', portrait: true },
] as const;

export type ClientVideo = (typeof CLIENT_VIDEOS)[number];
export type VideoKey = ClientVideo['key'];

/** The homepage section that holds the videos; a case study links back to it. */
export const CLIENT_VIDEOS_ANCHOR = 'client-videos';

export const videoByKey = (key: VideoKey): ClientVideo => CLIENT_VIDEOS.find((v) => v.key === key)!;
