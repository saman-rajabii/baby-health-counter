export interface AlertNotificationDto {
  to: string;
  userName: string;
  type: 'counter-completed' | 'counter-started';

  // For counter-completed notifications
  totalKicks?: number;
  duration?: string;
  completedAt?: string;

  // For counter-started notifications
  startTime?: string;
  targetKicks?: number;

  appUrl: string;
}
