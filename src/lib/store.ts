import { randomUUID } from "crypto";
import { addDays, formatISO, startOfDay } from "date-fns";
import type {
  DashboardMetrics,
  Feedback,
  InventoryItem,
  MealSelection,
  Menu,
  Notification,
  SeatingCapacity,
  User,
} from "./types";
import { estimateWaste, getAggregateRating } from "./utils";
import { DEFAULT_SEATING_CAPACITY } from "./constants";

interface Database {
  users: User[];
  menus: Menu[];
  selections: MealSelection[];
  feedback: Feedback[];
  inventory: InventoryItem[];
  notifications: Notification[];
  seatingCapacity: SeatingCapacity[];
}

type Mutable<T> = {
  -readonly [K in keyof T]: T[K];
};

declare global {
  var __kc_store: Database | undefined;
}

const createMenu = (
  date: Date,
  mealType: Menu["mealType"],
  dishes: Array<{
    name: string;
    description?: string;
    ingredients: string[];
    allergens: string[];
  }>,
  nutritionalInfo: Menu["nutritionalInfo"],
  specialNotes?: string,
): Menu => {
  const now = new Date();
  return {
    id: randomUUID(),
    date: formatISO(startOfDay(date)),
    mealType,
    dishes: dishes.map((dish) => ({
      id: randomUUID(),
      ...dish,
    })),
    nutritionalInfo,
    specialNotes,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  };
};

const seedData = (): Database => {
  const today = startOfDay(new Date());
  const menuPlan: Menu[] = [
    createMenu(
      addDays(today, 0),
      "breakfast",
      [
        {
          name: "Masala Oats Bowl",
          description: "High fiber oats with seasonal vegetables",
          ingredients: ["Oats", "Carrot", "Beans", "Peas", "Spices"],
          allergens: ["Gluten"],
        },
        {
          name: "Fresh Fruit Platter",
          ingredients: ["Papaya", "Banana", "Apple", "Seasonal fruits"],
          allergens: [],
        },
      ],
      { calories: 320, protein: 14, carbs: 45, fats: 9 },
      "Includes sugar-free options",
    ),
    createMenu(
      addDays(today, 0),
      "lunch",
      [
        {
          name: "Millet Veg Biryani",
          description: "Foxtail millet cooked with mixed vegetables",
          ingredients: ["Millet", "Carrot", "Beans", "Spices"],
          allergens: [],
        },
        {
          name: "Dal Tadka",
          ingredients: ["Lentils", "Ghee", "Spices"],
          allergens: ["Dairy"],
        },
      ],
      { calories: 540, protein: 22, carbs: 68, fats: 16 },
      "Served with raita and roasted papad",
    ),
    createMenu(
      addDays(today, 0),
      "snacks",
      [
        {
          name: "Sprout Chaat",
          ingredients: ["Green gram", "Onions", "Tomato", "Spices"],
          allergens: [],
        },
        {
          name: "Masala Chai",
          ingredients: ["Tea leaves", "Milk", "Spices"],
          allergens: ["Dairy"],
        },
      ],
      { calories: 280, protein: 12, carbs: 34, fats: 8 },
      "Low sugar option available",
    ),
  ];

  for (let i = 1; i <= 4; i += 1) {
    menuPlan.push(
      createMenu(
        addDays(today, i),
        "breakfast",
        [
          {
            name: "Rava Idli with Chutney",
            description: "Steamed semolina cakes with coconut chutney",
            ingredients: ["Semolina", "Coconut", "Curd"],
            allergens: ["Gluten", "Dairy"],
          },
          {
            name: "Seasonal Fruit Juice",
            ingredients: ["Watermelon", "Mint", "Lime"],
            allergens: [],
          },
        ],
        { calories: 350, protein: 11, carbs: 58, fats: 8 },
        "Includes gluten-free millet option",
      ),
      createMenu(
        addDays(today, i),
        "lunch",
        [
          {
            name: "Paneer Tikka Bowl",
            description: "Grilled paneer with quinoa and greens",
            ingredients: ["Paneer", "Quinoa", "Bell peppers", "Spices"],
            allergens: ["Dairy"],
          },
          {
            name: "Lemon Coriander Soup",
            ingredients: ["Vegetable stock", "Lemon", "Coriander"],
            allergens: [],
          },
        ],
        { calories: 560, protein: 26, carbs: 62, fats: 18 },
        "Vegan tofu alternative available",
      ),
      createMenu(
        addDays(today, i),
        "snacks",
        [
          {
            name: "Baked Samosa",
            ingredients: ["Whole wheat flour", "Potato", "Peas"],
            allergens: ["Gluten"],
          },
          {
            name: "Herbal Infusion",
            ingredients: ["Lemongrass", "Tulsi", "Ginger"],
            allergens: [],
          },
        ],
        { calories: 260, protein: 9, carbs: 35, fats: 8 },
        "Air-fried for lower oil content",
      ),
    );
  }

  const now = new Date().toISOString();

  return {
    users: [
      {
        id: randomUUID(),
        name: "Priya Sharma",
        email: "jane@karmic.solutions",
        role: "employee",
        passwordHash: "$2b$10$zEryuGzcriaNHj5AodZwUuJdyShHGSUpeKalRZ0b5V4ufHKJ0pUVG",
        department: "Engineering",
      },
      {
        id: randomUUID(),
        name: "Rahul Mehta",
        email: "admin@karmic.solutions",
        role: "admin",
        passwordHash: "$2b$10$u.P.Z.o2FAMYxi9p8VB5qO2S4yznW75gT88bUjQiZuSt3WX0paCN.",
        department: "Operations",
      },
    ],
    menus: menuPlan,
    selections: [],
    feedback: [],
    inventory: [
      {
        id: randomUUID(),
        name: "Organic Vegetables",
        quantity: 85,
        unit: "kg",
        threshold: 40,
        updatedAt: now,
        notes: "Sufficient for two days",
      },
      {
        id: randomUUID(),
        name: "Millets Assorted",
        quantity: 45,
        unit: "kg",
        threshold: 25,
        updatedAt: now,
        notes: "Reorder within this week",
      },
      {
        id: randomUUID(),
        name: "Dairy Supplies",
        quantity: 30,
        unit: "liters",
        threshold: 15,
        updatedAt: now,
        notes: "Low-fat options stocked",
      },
    ],
    notifications: [
      {
        id: randomUUID(),
        title: "Update Your Lunch Preference",
        message:
          "Please confirm your lunch preference by 9 PM today to avoid food wastage.",
        type: "warning",
        createdAt: now,
        readBy: [],
        scope: "all",
      },
      {
        id: randomUUID(),
        title: "Weekend Special Menu",
        message: "Chef's special millet and greens menu planned for Saturday!",
        type: "info",
        createdAt: now,
        readBy: [],
        scope: "employee",
      },
    ],
    seatingCapacity: [
      {
        id: randomUUID(),
        date: formatISO(startOfDay(today)),
        capacity: DEFAULT_SEATING_CAPACITY,
        updatedAt: now,
      },
      {
        id: randomUUID(),
        date: formatISO(startOfDay(addDays(today, 1))),
        capacity: DEFAULT_SEATING_CAPACITY,
        updatedAt: now,
      },
    ],
  };
};

const db = (() => {
  if (!global.__kc_store) {
    global.__kc_store = seedData();
  }
  return global.__kc_store;
})();

export const getDatabase = (): Database => db;

export const findUserByEmail = (email: string): User | undefined =>
  db.users.find((user) => user.email.toLowerCase() === email.toLowerCase());

export const getUserById = (id: string): User | undefined =>
  db.users.find((user) => user.id === id);

export const getMenus = ({ includePast = false } = {}): Menu[] => {
  const now = startOfDay(new Date());
  return db.menus
    .filter((menu) => includePast || startOfDay(new Date(menu.date)) >= now)
    .sort((a, b) => a.date.localeCompare(b.date) || a.mealType.localeCompare(b.mealType));
};

export const getMenuById = (menuId: string): Menu | undefined =>
  db.menus.find((menu) => menu.id === menuId);

export const upsertMenu = (payload: Omit<Menu, "createdAt" | "updatedAt" | "id"> & { id?: string }): Menu => {
  const now = new Date().toISOString();
  if (payload.id) {
    const existing = getMenuById(payload.id);
    if (!existing) {
      throw new Error("Menu not found");
    }
    const updated: Menu = {
      ...existing,
      ...payload,
      id: existing.id,
      dishes: payload.dishes,
      updatedAt: now,
    };
    db.menus = db.menus.map((menu) => (menu.id === existing.id ? updated : menu));
    return updated;
  }
  const created: Menu = {
    ...payload,
    id: randomUUID(),
    createdAt: now,
    updatedAt: now,
  };
  db.menus.push(created);
  return created;
};

export const deleteMenu = (menuId: string): void => {
  db.menus = db.menus.filter((menu) => menu.id !== menuId);
  db.selections = db.selections.filter((selection) => selection.menuId !== menuId);
  db.feedback = db.feedback.filter((item) => item.menuId !== menuId);
};

export const upsertSelection = (input: {
  menuId: string;
  userId: string;
  status: MealSelection["status"];
  reason?: string;
}): MealSelection => {
  const now = new Date().toISOString();
  const existing = db.selections.find(
    (entry) => entry.menuId === input.menuId && entry.userId === input.userId,
  );
  if (existing) {
    existing.status = input.status;
    existing.reason = input.reason;
    existing.updatedAt = now;
    return existing;
  }
  const selection: MealSelection = {
    id: randomUUID(),
    menuId: input.menuId,
    userId: input.userId,
    status: input.status,
    reason: input.reason,
    updatedAt: now,
  };
  db.selections.push(selection);
  return selection;
};

export const getSelectionsForUser = (userId: string): MealSelection[] =>
  db.selections.filter((selection) => selection.userId === userId);

export const getSelectionsForMenu = (menuId: string): MealSelection[] =>
  db.selections.filter((selection) => selection.menuId === menuId);

export const getSelections = (): MealSelection[] => db.selections;

export const addFeedback = (payload: {
  userId: string;
  menuId: string;
  rating: number;
  comments?: string;
}): Feedback => {
  const now = new Date().toISOString();
  const existing = db.feedback.find(
    (item) => item.userId === payload.userId && item.menuId === payload.menuId,
  );
  if (existing) {
    existing.rating = payload.rating;
    existing.comments = payload.comments;
    existing.createdAt = now;
    return existing;
  }
  const feedback: Feedback = {
    id: randomUUID(),
    userId: payload.userId,
    menuId: payload.menuId,
    rating: payload.rating,
    comments: payload.comments,
    createdAt: now,
  };
  db.feedback.push(feedback);
  return feedback;
};

export const getFeedback = (): Feedback[] => db.feedback;

export const getFeedbackForMenu = (menuId: string): Feedback[] =>
  db.feedback.filter((item) => item.menuId === menuId);

export const getInventory = (): InventoryItem[] => db.inventory;

export const upsertInventoryItem = (payload: Omit<InventoryItem, "id" | "updatedAt"> & { id?: string }): InventoryItem => {
  const now = new Date().toISOString();
  if (payload.id) {
    const existing = db.inventory.find((item) => item.id === payload.id);
    if (!existing) {
      throw new Error("Inventory item not found");
    }
    Object.assign(existing, payload, { updatedAt: now, id: existing.id });
    return existing;
  }
  const item: InventoryItem = {
    ...payload,
    id: randomUUID(),
    updatedAt: now,
  };
  db.inventory.push(item);
  return item;
};

export const removeInventoryItem = (id: string): void => {
  db.inventory = db.inventory.filter((item) => item.id !== id);
};

export const getNotifications = (scope?: Notification["scope"] | "all"): Notification[] => {
  if (!scope) {
    return db.notifications;
  }
  if (scope === "all") {
    return db.notifications.filter((note) => note.scope === "all");
  }
  return db.notifications.filter(
    (note) => note.scope === scope || note.scope === "all",
  );
};

export const markNotificationAsRead = ({
  notificationId,
  userId,
}: {
  notificationId: string;
  userId: string;
}): void => {
  const notification = db.notifications.find((item) => item.id === notificationId);
  if (!notification) {
    return;
  }
  if (!notification.readBy.includes(userId)) {
    notification.readBy.push(userId);
  }
};

export const addNotification = (notification: Omit<Notification, "id" | "createdAt" | "readBy">): Notification => {
  const result: Notification = {
    ...notification,
    id: randomUUID(),
    createdAt: new Date().toISOString(),
    readBy: [],
  };
  db.notifications.unshift(result);
  return result;
};

export const getSeatingCapacity = (date: string): SeatingCapacity | undefined =>
  db.seatingCapacity.find((entry) => entry.date === date);

export const upsertSeatingCapacity = (payload: Omit<SeatingCapacity, "id" | "updatedAt"> & { id?: string }) => {
  const now = new Date().toISOString();
  if (payload.id) {
    const existing = db.seatingCapacity.find((entry) => entry.id === payload.id);
    if (!existing) {
      throw new Error("Seating capacity record not found");
    }
    Object.assign(existing, payload, { updatedAt: now });
    return existing;
  }
  const record: SeatingCapacity = {
    ...payload,
    id: randomUUID(),
    updatedAt: now,
  };
  db.seatingCapacity.push(record);
  return record;
};

export const computeDashboardMetrics = (): DashboardMetrics => {
  const selections = getSelections();
  const optInCount = selections.filter((item) => item.status === "opt-in").length;
  const optOutCount = selections.filter((item) => item.status === "opt-out").length;
  const feedback = getFeedback();
  const averageRating = getAggregateRating(feedback);

  const metrics: DashboardMetrics = {
    totalOptIns: optInCount,
    totalOptOuts: optOutCount,
    optInRate: Number(
      selections.length ? ((optInCount / selections.length) * 100).toFixed(1) : 0,
    ),
    averageRating,
    wasteEstimateKg: estimateWaste({
      optInCount,
      optOutCount,
    }),
  };
  return metrics;
};

export const mutateDatabase = <K extends keyof Database>(
  key: K,
  updater: (current: Mutable<Database>[K]) => Mutable<Database>[K],
) => {
  db[key] = updater(db[key]) as Database[K];
};
