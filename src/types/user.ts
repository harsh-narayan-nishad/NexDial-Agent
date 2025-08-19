export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  status: 'active' | 'break' | 'inactive';
  currentBreakStart?: Date;
  dailyWorkTime: number; // in minutes
}

export interface BreakRecord {
  start: string;
  end: string;
  duration?: number; // in minutes
}

export interface DayRecord {
  date: string;
  workTime: number; // in minutes
  breaks: BreakRecord[];
  totalBreakTime: number; // in minutes
}

export interface UserData {
  [userId: string]: {
    [month: string]: DayRecord[];
  };
}

export interface ResearchEntry {
  id: string;
  title: string;
  link?: string;
  notes: string;
  userId: string;
  userName: string;
  createdAt: Date;
  type: 'link' | 'note';
}