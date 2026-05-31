import siteJson from "@/data/site.json";

export type MenuItemVariant = {
  name: string;
  price: number;
};

export type MenuItem = {
  id: string;
  name: string;
  description: string;
  price?: number;
  badge?: string;
  rating?: number;
  variants?: MenuItemVariant[];
};

export type MenuCategory = {
  id: string;
  name: string;
  icon: string;
  items: MenuItem[];
};

// Removed static menu JSON as data is now fetched from Supabase.
export const MENU_CATEGORIES: MenuCategory[] = [];

export const REVIEWS = siteJson.reviews;

export const SITE = siteJson;
