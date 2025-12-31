
export enum ViewMode {
  CHAT = 'chat',
  IMAGE = 'image',
  LIVE = 'live',
  DEPLOY = 'deploy',
  GALLERY = 'gallery'
}

export interface Message {
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export interface GeneratedImage {
  url: string;
  prompt: string;
  timestamp: Date;
}
