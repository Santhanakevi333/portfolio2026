export type SceneMode = 'wind' | 'solar' | 'demand';

export interface Burst {
  cx: number;
  cy: number;
  t: number;
  wx: number;
  wy: number;
  init: boolean;
}

export interface Project {
  title: string;
  kind: string;
  description: string;
  details?: string;
  liveUrl?: string;
  tags: string[];
  mode?: SceneMode;
  specs?: { label: string; value: string }[];
  featured?: boolean;
  wide?: boolean;
}

export interface SkillCategory {
  title: string;
  skills: string[];
}

