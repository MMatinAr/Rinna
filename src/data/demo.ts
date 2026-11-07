import type { Product } from "../services/cafeApi";

export const demoProducts: Product[] = [
  { id: 1, name: "دانه قهوه عربیکا", category: "قهوه", supplier_name: "رستری نمونه", price: 890000, unit: "کیلوگرم", image_url: "https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&w=700&q=85", available: true },
  { id: 2, name: "سیروپ وانیل", category: "سیروپ", supplier_name: "تأمین‌کننده نمونه", price: 245000, unit: "بطری", image_url: "https://images.unsplash.com/photo-1608270586620-248524c67de9?auto=format&fit=crop&w=700&q=85", available: true },
  { id: 3, name: "پودر شکلات", category: "شکلات", supplier_name: "مواد اولیه کافه", price: 310000, unit: "بسته", image_url: "https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&w=700&q=85", available: true },
  { id: 4, name: "پودر چای ماسالا", category: "پودر نوشیدنی", supplier_name: "بازار تخصصی", price: 275000, unit: "بسته", image_url: "https://images.unsplash.com/photo-1571934811356-5cc061b6821f?auto=format&fit=crop&w=700&q=85", available: true }
];
