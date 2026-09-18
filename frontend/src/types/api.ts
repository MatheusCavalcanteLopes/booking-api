export type Role = 'ADMIN' | 'MANAGER' | 'USER';

export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED';

export type Locale = 'pt-BR' | 'en';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  locale: Locale;
  // Non-null only while "Try as Admin" has this account temporarily
  // elevated — the role to restore on exit. See AuthContext#exitAdminPreview.
  previewRole: Role | null;
}

export interface Resource {
  id: string;
  name: string;
  description: string | null;
  capacity: number;
  location: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Booking {
  id: string;
  startTime: string;
  endTime: string;
  status: BookingStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  userId: string;
  resourceId: string;
  resource: Resource;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginResponse extends AuthTokens {
  user: User;
}

export interface ApiErrorIssue {
  path: string;
  message: string;
}

export interface ApiErrorBody {
  message: string;
  issues?: ApiErrorIssue[];
}

export interface CreateResourceInput {
  name: string;
  description?: string;
  capacity?: number;
  location?: string;
}

export type UpdateResourceInput = Partial<CreateResourceInput> & { isActive?: boolean };

export interface CreateBookingInput {
  resourceId: string;
  startTime: string;
  endTime: string;
  notes?: string;
}
