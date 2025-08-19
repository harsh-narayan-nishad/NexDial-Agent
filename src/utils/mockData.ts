import { User, UserData, DayRecord } from '@/types/user';

// Mock users for tracking system
export const mockUsers: User[] = [
  { id: 'user1', name: 'Alex Chen', email: 'alex@nexvora.com', status: 'active', dailyWorkTime: 0 },
  { id: 'user2', name: 'Sarah Johnson', email: 'sarah@nexvora.com', status: 'break', dailyWorkTime: 0 },
  { id: 'user3', name: 'Michael Brown', email: 'michael@nexvora.com', status: 'active', dailyWorkTime: 0 },
  { id: 'user4', name: 'Emily Davis', email: 'emily@nexvora.com', status: 'inactive', dailyWorkTime: 0 },
  { id: 'user5', name: 'David Wilson', email: 'david@nexvora.com', status: 'active', dailyWorkTime: 0 },
  { id: 'user6', name: 'Lisa Anderson', email: 'lisa@nexvora.com', status: 'break', dailyWorkTime: 0 },
  { id: 'user7', name: 'James Taylor', email: 'james@nexvora.com', status: 'active', dailyWorkTime: 0 },
  { id: 'user8', name: 'Jennifer Martinez', email: 'jennifer@nexvora.com', status: 'inactive', dailyWorkTime: 0 },
  { id: 'user9', name: 'Robert Garcia', email: 'robert@nexvora.com', status: 'active', dailyWorkTime: 0 },
  { id: 'user10', name: 'Amanda Lee', email: 'amanda@nexvora.com', status: 'break', dailyWorkTime: 0 }
];

// Generate mock data for August 2025
const generateMockData = (): UserData => {
  const data: UserData = {};
  const month = '2025-08';
  
  mockUsers.forEach(user => {
    data[user.id] = {
      [month]: []
    };
    
    // Generate data for each day in August
    for (let day = 1; day <= 31; day++) {
      const date = `2025-08-${day.toString().padStart(2, '0')}`;
      const workTime = Math.floor(Math.random() * 480) + 240; // 4-12 hours
      const numBreaks = Math.floor(Math.random() * 4) + 1; // 1-4 breaks
      
      const breaks = [];
      let totalBreakTime = 0;
      
      for (let i = 0; i < numBreaks; i++) {
        const startHour = Math.floor(Math.random() * 8) + 9; // 9-16
        const startMinute = Math.floor(Math.random() * 60);
        const duration = Math.floor(Math.random() * 30) + 10; // 10-40 minutes
        
        const start = `${startHour.toString().padStart(2, '0')}:${startMinute.toString().padStart(2, '0')}`;
        const endMinute = startMinute + duration;
        const endHour = startHour + Math.floor(endMinute / 60);
        const end = `${endHour.toString().padStart(2, '0')}:${(endMinute % 60).toString().padStart(2, '0')}`;
        
        breaks.push({ start, end, duration });
        totalBreakTime += duration;
      }
      
      const dayRecord: DayRecord = {
        date,
        workTime,
        breaks,
        totalBreakTime
      };
      
      data[user.id][month].push(dayRecord);
    }
  });
  
  return data;
};

export const mockUsersData = generateMockData();

// Simulated API functions
export const apiSimulator = {
  // Simulate network delay
  delay: () => new Promise(resolve => setTimeout(resolve, 500)),
  
  // Get user data
  getUserData: async (userId: string) => {
    await apiSimulator.delay();
    return mockUsersData[userId] || {};
  },
  
  // Get all users
  getUsers: async () => {
    await apiSimulator.delay();
    return mockUsers;
  },
  
  // Start break
  startBreak: async (userId: string) => {
    await apiSimulator.delay();
    const user = mockUsers.find(u => u.id === userId);
    if (user) {
      user.status = 'break';
      user.currentBreakStart = new Date();
    }
    return { success: true, user };
  },
  
  // End break
  endBreak: async (userId: string) => {
    await apiSimulator.delay();
    const user = mockUsers.find(u => u.id === userId);
    if (user && user.currentBreakStart) {
      user.status = 'active';
      const breakDuration = Math.floor((Date.now() - user.currentBreakStart.getTime()) / 1000 / 60);
      user.currentBreakStart = undefined;
      
      // Add break to today's data
      const today = new Date().toISOString().split('T')[0];
      const month = today.substring(0, 7);
      const userData = mockUsersData[userId];
      
      if (userData && userData[month]) {
        const todayRecord = userData[month].find(d => d.date === today);
        if (todayRecord) {
          const now = new Date();
          const start = new Date(now.getTime() - breakDuration * 60 * 1000);
          todayRecord.breaks.push({
            start: start.toTimeString().substring(0, 5),
            end: now.toTimeString().substring(0, 5),
            duration: breakDuration
          });
          todayRecord.totalBreakTime += breakDuration;
        }
      }
    }
    return { success: true, user };
  },
  
  // Get monthly data for all users
  getMonthlyData: async (month: string) => {
    await apiSimulator.delay();
    const result: { [userId: string]: DayRecord[] } = {};
    
    Object.keys(mockUsersData).forEach(userId => {
      result[userId] = mockUsersData[userId][month] || [];
    });
    
    return result;
  }
};