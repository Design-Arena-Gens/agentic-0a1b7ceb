export type MealType = "breakfast" | "lunch" | "snacks";

export interface Dish {
  id: string;
  name: string;
  description?: string;
  ingredients: string[];
  allergens: string[];
}

export interface NutritionalInfo {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

export interface Menu {
  id: string;
  date: string; // ISO date representing the menu day
  mealType: MealType;
  dishes: Dish[];
  nutritionalInfo: NutritionalInfo;
  specialNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export type UserRole = "employee" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  passwordHash: string;
  department: string;
}

export type MealStatus = "opt-in" | "opt-out";

export interface MealSelection {
  id: string;
  userId: string;
  menuId: string;
  status: MealStatus;
  updatedAt: string;
  reason?: string;
}

export interface Feedback {
  id: string;
  userId: string;
  menuId: string;
  rating: number; // 1-5 scale
  comments?: string;
  createdAt: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  threshold: number;
  updatedAt: string;
  notes?: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "warning" | "success";
  createdAt: string;
  readBy: string[]; // user IDs who have read the notification
  scope: "employee" | "admin" | "all";
}

export interface SeatingCapacity {
  id: string;
  date: string;
  capacity: number;
  updatedAt: string;
}

export interface DashboardMetrics {
  totalOptIns: number;
  totalOptOuts: number;
  optInRate: number;
  averageRating: number;
  wasteEstimateKg: number;
}

export interface HistoricalMeal {
  menu: Menu;
  selection?: MealSelection;
  feedback?: Feedback;
}
