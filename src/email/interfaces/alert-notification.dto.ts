export interface AlertNotificationDto {
  to: string;
  userName: string;
  type: 'counter-completed' | 'counter-started' | 'contraction-alert';

  // For counter-completed notifications
  totalKicks?: number;
  duration?: string;
  completedAt?: string;

  // For counter-started notifications
  startTime?: string;
  targetKicks?: number;

  // For contraction-alert notifications
  actualCount?: number;
  minimumCount?: number;
  alertColor?: string;
  alertTitle?: string;
  alertMessage?: string;
  alertTime?: string;
  alertDescription?: string;

  appUrl: string;
}
