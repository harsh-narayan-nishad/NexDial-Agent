import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { User, DayRecord } from '@/types/user';
import { mockUsers, apiSimulator } from '@/utils/mockData';
import { format } from 'date-fns';
import { Clock, Play, Pause, Users, Calendar as CalendarIcon, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

const TrackingSystem = () => {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [selectedUserId, setSelectedUserId] = useState<string>(mockUsers[0].id);
  const [selectedUser, setSelectedUser] = useState<User>(mockUsers[0]);
  const [monthlyData, setMonthlyData] = useState<{ [userId: string]: DayRecord[] }>({});
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarFilterUser, setCalendarFilterUser] = useState<string>('all');
  const [workTimer, setWorkTimer] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Timer effect for daily work time
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (selectedUser.status === 'active') {
      interval = setInterval(() => {
        setWorkTimer(prev => prev + 1);
        setSelectedUser(prev => ({
          ...prev,
          dailyWorkTime: prev.dailyWorkTime + (1/60) // Add 1 minute every 60 seconds
        }));
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [selectedUser.status]);

  // Load monthly data on mount
  useEffect(() => {
    loadMonthlyData();
  }, []);

  // Update selected user when user selection changes
  useEffect(() => {
    const user = users.find(u => u.id === selectedUserId);
    if (user) {
      setSelectedUser(user);
    }
  }, [selectedUserId, users]);

  const loadMonthlyData = async () => {
    try {
      const data = await apiSimulator.getMonthlyData('2025-08');
      setMonthlyData(data);
    } catch (error) {
      console.error('Failed to load monthly data:', error);
    }
  };

  const handleStartBreak = async () => {
    if (selectedUser.status !== 'active') return;
    
    setIsLoading(true);
    try {
      const result = await apiSimulator.startBreak(selectedUserId);
      if (result.success && result.user) {
        setUsers(users.map(u => u.id === selectedUserId ? result.user : u));
        setSelectedUser(result.user);
        toast({
          title: "Break started",
          description: `${selectedUser.name} is now on break.`,
        });
      }
    } catch (error) {
      console.error('Failed to start break:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEndBreak = async () => {
    if (selectedUser.status !== 'break') return;
    
    setIsLoading(true);
    try {
      const result = await apiSimulator.endBreak(selectedUserId);
      if (result.success && result.user) {
        setUsers(users.map(u => u.id === selectedUserId ? result.user : u));
        setSelectedUser(result.user);
        toast({
          title: "Break ended",
          description: `${selectedUser.name} is back to work.`,
        });
      }
    } catch (error) {
      console.error('Failed to end break:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatWorkTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = Math.floor(minutes % 60);
    return `${hours}h ${mins}m`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-status-active text-green-900';
      case 'break': return 'bg-status-break text-orange-900';
      case 'inactive': return 'bg-status-inactive text-gray-900';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getDayActivity = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const usersToCheck = calendarFilterUser === 'all' ? users : users.filter(u => u.id === calendarFilterUser);
    
    let hasActivity = false;
    let hasBreaks = false;
    
    usersToCheck.forEach(user => {
      const userData = monthlyData[user.id];
      if (userData) {
        const dayData = userData.find(d => d.date === dateStr);
        if (dayData) {
          hasActivity = true;
          if (dayData.breaks.length > 0) {
            hasBreaks = true;
          }
        }
      }
    });
    
    return { hasActivity, hasBreaks };
  };

  const getDayDetails = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const details: Array<{ user: User; dayData: DayRecord }> = [];
    
    users.forEach(user => {
      const userData = monthlyData[user.id];
      if (userData) {
        const dayData = userData.find(d => d.date === dateStr);
        if (dayData) {
          details.push({ user, dayData });
        }
      }
    });
    
    return details;
  };

  const selectedDateDetails = selectedDate ? getDayDetails(selectedDate) : [];

  return (
    <div className="min-h-screen pt-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-cosmic bg-clip-text text-transparent mb-2">
            Employee Tracking System
          </h1>
          <p className="text-muted-foreground">
            Monitor employee work time and break schedules
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Control Panel */}
          <div className="lg:col-span-2 space-y-6">
            {/* User Selection */}
            <Card className="bg-background/60 backdrop-blur-glass border-cosmic-accent/20 shadow-nebula">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-cosmic-primary">
                  <Users className="h-5 w-5" />
                  User Selection
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                  <SelectTrigger className="bg-background/50 border-cosmic-accent/30">
                    <SelectValue placeholder="Select a user" />
                  </SelectTrigger>
                  <SelectContent className="bg-background/90 backdrop-blur-glass border-cosmic-accent/20">
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        <div className="flex items-center gap-2">
                          <div className={cn("w-2 h-2 rounded-full", {
                            'bg-status-active': user.status === 'active',
                            'bg-status-break': user.status === 'break',
                            'bg-status-inactive': user.status === 'inactive',
                          })} />
                          {user.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Status & Controls */}
            <Card className="bg-background/60 backdrop-blur-glass border-cosmic-accent/20 shadow-nebula">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-cosmic-primary">
                  <Clock className="h-5 w-5" />
                  Current Status: {selectedUser.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Badge className={cn("text-sm", getStatusColor(selectedUser.status))}>
                      {selectedUser.status.toUpperCase()}
                    </Badge>
                    {selectedUser.status === 'break' && selectedUser.currentBreakStart && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Break started: {selectedUser.currentBreakStart.toLocaleTimeString()}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      onClick={handleStartBreak}
                      disabled={selectedUser.status !== 'active' || isLoading}
                      className="bg-status-break/20 text-status-break hover:bg-status-break/30"
                    >
                      <Pause className="h-4 w-4 mr-2" />
                      Start Break
                    </Button>
                    <Button
                      onClick={handleEndBreak}
                      disabled={selectedUser.status !== 'break' || isLoading}
                      className="bg-status-active/20 text-status-active hover:bg-status-active/30"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      End Break
                    </Button>
                  </div>
                </div>

                {/* Daily Timer */}
                <div className="bg-background/30 p-4 rounded-lg border border-cosmic-accent/20">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Daily Work Time</span>
                    <span className="text-xl font-mono text-cosmic-primary">
                      {formatWorkTime(selectedUser.dailyWorkTime)}
                    </span>
                  </div>
                  {selectedUser.status === 'active' && (
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-sm text-muted-foreground">Live Timer</span>
                      <span className="text-lg font-mono text-cosmic-accent">
                        {formatTime(workTimer)}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* All Users Overview */}
            <Card className="bg-background/60 backdrop-blur-glass border-cosmic-accent/20 shadow-nebula">
              <CardHeader>
                <CardTitle className="text-cosmic-primary">All Users Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-3">
                  {users.map((user) => (
                    <div
                      key={user.id}
                      className={cn(
                        "p-3 rounded-lg border transition-colors cursor-pointer",
                        selectedUserId === user.id 
                          ? "border-cosmic-primary bg-cosmic-primary/10" 
                          : "border-cosmic-accent/20 bg-background/30 hover:bg-background/40"
                      )}
                      onClick={() => setSelectedUserId(user.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-sm">{user.name}</div>
                          <div className="text-xs text-muted-foreground">{user.email}</div>
                        </div>
                        <Badge className={cn("text-xs", getStatusColor(user.status))}>
                          {user.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Calendar & Analytics */}
          <div className="space-y-6">
            <Card className="bg-background/60 backdrop-blur-glass border-cosmic-accent/20 shadow-nebula">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-cosmic-primary">
                  <CalendarIcon className="h-5 w-5" />
                  Calendar View
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <Select value={calendarFilterUser} onValueChange={setCalendarFilterUser}>
                    <SelectTrigger className="bg-background/50 border-cosmic-accent/30">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-background/90 backdrop-blur-glass border-cosmic-accent/20">
                      <SelectItem value="all">All Users</SelectItem>
                      {users.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-md border border-cosmic-accent/20 bg-background/30 p-3 pointer-events-auto"
                  modifiers={{
                    hasActivity: (date) => getDayActivity(date).hasActivity,
                    hasBreaks: (date) => getDayActivity(date).hasBreaks,
                  }}
                  modifiersStyles={{
                    hasActivity: { backgroundColor: 'hsl(var(--cosmic-accent) / 0.2)' },
                    hasBreaks: { 
                      backgroundColor: 'hsl(var(--status-break) / 0.3)',
                      fontWeight: 'bold'
                    },
                  }}
                />

                <Button
                  onClick={() => setShowCalendar(true)}
                  className="w-full bg-cosmic-primary/20 text-cosmic-primary hover:bg-cosmic-primary/30"
                >
                  View Detailed Calendar
                </Button>
              </CardContent>
            </Card>

            {/* Day Details */}
            {selectedDate && selectedDateDetails.length > 0 && (
              <Card className="bg-background/60 backdrop-blur-glass border-cosmic-accent/20 shadow-nebula">
                <CardHeader>
                  <CardTitle className="text-cosmic-primary">
                    {format(selectedDate, 'MMM dd, yyyy')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {selectedDateDetails.map(({ user, dayData }) => (
                    <div key={user.id} className="bg-background/30 p-3 rounded-lg border border-cosmic-accent/20">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm">{user.name}</span>
                        <span className="text-xs text-cosmic-accent">
                          {formatWorkTime(dayData.workTime)}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Breaks: {dayData.breaks.length} ({formatWorkTime(dayData.totalBreakTime)})
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Detailed Calendar Modal */}
      <Dialog open={showCalendar} onOpenChange={setShowCalendar}>
        <DialogContent className="max-w-4xl bg-background/90 backdrop-blur-glass border-cosmic-accent/20">
          <DialogHeader>
            <DialogTitle className="text-cosmic-primary">Monthly Activity Calendar</DialogTitle>
          </DialogHeader>
          <div className="p-4">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border border-cosmic-accent/20 bg-background/30 p-3 pointer-events-auto w-full"
              modifiers={{
                hasActivity: (date) => getDayActivity(date).hasActivity,
                hasBreaks: (date) => getDayActivity(date).hasBreaks,
              }}
              modifiersStyles={{
                hasActivity: { backgroundColor: 'hsl(var(--cosmic-accent) / 0.2)' },
                hasBreaks: { 
                  backgroundColor: 'hsl(var(--status-break) / 0.3)',
                  fontWeight: 'bold'
                },
              }}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TrackingSystem;