export interface AdminProfile {
  id: string;
  email: string;
  role: string;
  firstName: string;
}

export interface AdminLoginResponse {
  access_token: string;
  user: AdminProfile;
}

export interface AdminDashboardStats {
  totalOrders: number;
  pendingOrders: number;
  totalUsers: number;
  totalProducts: number;
  todayOrders: number;
  todayRevenue: number;
}

export interface AdminTopProduct {
  _id: string;
  title: {
    uz: string;
    ru: string;
  };
  totalSold: number;
  revenue: number;
}

export interface AdminRecentOrder {
  _id: string;
  orderNumber: string;
  totalPrice: number;
  status: string;
  paymentMethod: string;
   paymentReceiptUrl?: string;
   paymentReviewStatus?: string;
   paymentSubmittedAt?: string;
   paymentVerifiedAt?: string;
   paymentRejectedAt?: string;
   createdAt: string;
   notes?: string;
   items: Array<{
     title: {
       uz: string;
       ru: string;
     };
     quantity: number;
     selectedVolume?: string;
     selectedScentLabel?: {
       uz: string;
       ru: string;
     };
   }>;
   deliveryDetails: {
     firstName: string;
     lastName?: string;
     phone: string;
     address: string;
  };
  userId?: {
    firstName?: string;
    phone?: string;
  };
}

export interface AdminUser {
  _id: string;
  firstName: string;
  lastName?: string;
  phone: string;
  username?: string;
  languageCode?: string;
  role: string;
  createdAt?: string;
}
