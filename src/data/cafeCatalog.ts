export type CafeIngredient = { name: string; amount: number; unit: string; unitCost: number };
export type CafeAddon = { id: string; name: string; price: number; ingredients: CafeIngredient[] };
export type CafeMenuItem = {
  id: string; name: string; category: string; price: number; cost: number;
  description: string; active: boolean; ingredients: CafeIngredient[]; addons: CafeAddon[];
  source: "template" | "custom";
};

const categorySeeds = [
  { name: "بار گرم", items: ["هات چاکلت", "وایت چاکلت", "ماسالا", "چای کرک", "چای دارچین", "شیر عسل", "شیر زعفران", "قهوه ترک", "قهوه فرانسه", "آمریکانو"] },
  { name: "بار سرد", items: ["آیس لاته", "آیس آمریکانو", "آیس موکا", "آیس کارامل ماکیاتو", "آیس چاکلت", "آیس تی لیمو", "آیس ماسالا", "فراپه", "کولد برو", "شیر موز"] },
  { name: "اسپرسو بار", items: ["اسپرسو", "دبل اسپرسو", "ریسترتو", "لانگو", "ماکیاتو", "کورتادو", "کاپوچینو", "فلت وایت", "لاته", "موکا"] },
  { name: "چای و دمنوش", items: ["چای سیاه", "چای سبز", "چای ترش", "دمنوش آرامش", "دمنوش به‌لیمو", "دمنوش گل‌گاوزبان", "چای زنجبیل", "چای نعناع", "چای زعفران", "چای لیمو"] },
  { name: "اسموتی و شیک", items: ["شیک وانیل", "شیک شکلات", "شیک نوتلا", "شیک توت‌فرنگی", "شیک موز", "اسموتی انبه", "اسموتی توت‌فرنگی", "اسموتی سبز", "اسموتی بری", "میلک‌شیک بادام‌زمینی"] },
  { name: "آبمیوه طبیعی", items: ["آب پرتقال", "آب هویج", "آب سیب", "آب انار", "آب هندوانه", "آب طالبی", "آب کرفس", "لیموناد", "موهیتو", "آب گریپ‌فروت"] },
  { name: "کیک و دسر", items: ["چیزکیک", "براونی", "ردولوت", "کیک هویج", "کیک شکلاتی", "تیرامیسو", "کیک روز", "پاناکوتا", "کرم بروله", "سن‌سباستین"] },
  { name: "کوکی و شیرینی", items: ["کوکی شکلاتی", "کوکی دبل چاکلت", "کوکی ردولوت", "کوکی جو دوسر", "کوکی کره‌ای", "ماکارون", "کروسان ساده", "کروسان شکلاتی", "دونات", "رول دارچین"] },
  { name: "صبحانه و برانچ", items: ["املت", "نیمرو", "صبحانه انگلیسی", "پنکیک", "وافل", "تست آووکادو", "فرنچ تست", "گرانولا", "ساندویچ تخم‌مرغ", "تست پنیر"] },
  { name: "غذا و میان‌وعده", items: ["پنینی مرغ", "پنینی بوقلمون", "کلاب ساندویچ", "سیب‌زمینی", "سالاد سزار", "سالاد یونانی", "پاستا آلفردو", "پاستا پستو", "سوپ روز", "نان سیر"] }
];

const recipeBases: Record<string, CafeIngredient[]> = {
  "بار گرم": [{name:"شیر",amount:180,unit:"ml",unitCost:90},{name:"پودر نوشیدنی",amount:25,unit:"g",unitCost:420}],
  "بار سرد": [{name:"شیر",amount:160,unit:"ml",unitCost:90},{name:"قهوه",amount:18,unit:"g",unitCost:900},{name:"یخ",amount:100,unit:"g",unitCost:5}],
  "اسپرسو بار": [{name:"دانه قهوه",amount:18,unit:"g",unitCost:1100},{name:"شیر",amount:120,unit:"ml",unitCost:90}],
  "چای و دمنوش": [{name:"چای یا دمنوش",amount:5,unit:"g",unitCost:500},{name:"آب",amount:250,unit:"ml",unitCost:1}],
  "اسموتی و شیک": [{name:"شیر",amount:180,unit:"ml",unitCost:90},{name:"میوه",amount:100,unit:"g",unitCost:350},{name:"بستنی",amount:80,unit:"g",unitCost:300}],
  "آبمیوه طبیعی": [{name:"میوه تازه",amount:300,unit:"g",unitCost:260}],
  "کیک و دسر": [{name:"مواد پایه دسر",amount:140,unit:"g",unitCost:650}],
  "کوکی و شیرینی": [{name:"مواد پایه شیرینی",amount:90,unit:"g",unitCost:520}],
  "صبحانه و برانچ": [{name:"تخم‌مرغ",amount:2,unit:"عدد",unitCost:1800},{name:"نان",amount:80,unit:"g",unitCost:120}],
  "غذا و میان‌وعده": [{name:"مواد اولیه اصلی",amount:180,unit:"g",unitCost:520},{name:"نان یا دورچین",amount:1,unit:"عدد",unitCost:900}]
};

const addonSeeds: CafeAddon[] = [
  { id:"addon-cookie", name:"کوکی", price:35000, ingredients:[{name:"کوکی",amount:1,unit:"عدد",unitCost:12000}] },
  { id:"addon-truffle", name:"ترافل", price:25000, ingredients:[{name:"ترافل",amount:15,unit:"g",unitCost:700}] },
  { id:"addon-chocolate", name:"شکلات", price:20000, ingredients:[{name:"شکلات",amount:20,unit:"g",unitCost:600}] },
  { id:"addon-syrup", name:"سیروپ", price:18000, ingredients:[{name:"سیروپ",amount:20,unit:"ml",unitCost:450}] },
  { id:"addon-extra-shot", name:"شات اضافه", price:30000, ingredients:[{name:"دانه قهوه",amount:9,unit:"g",unitCost:1100}] },
  { id:"addon-oat", name:"شیر جو دوسر", price:25000, ingredients:[{name:"شیر جو دوسر",amount:150,unit:"ml",unitCost:220}] }
];

export const cafeCategories = categorySeeds.map((category, index) => ({
  id: `cat-${index + 1}`, name: category.name, count: category.items.length, isDefault: true
}));

export const cafeAddonLibrary = addonSeeds;

export const cafeStarterCatalog: CafeMenuItem[] = categorySeeds.flatMap((category, categoryIndex) =>
  category.items.map((name, itemIndex) => {
    const ingredients = recipeBases[category.name].map((ingredient) => ({ ...ingredient }));
    const cost = ingredients.reduce((sum, ingredient) => sum + ingredient.amount * ingredient.unitCost, 0);
    const price = Math.round((cost * 2.65 + 18000) / 5000) * 5000;
    return {
      id: `starter-${categoryIndex + 1}-${itemIndex + 1}`,
      name,
      category: category.name,
      price,
      cost,
      description: `رسپی مرجع پیشنهادی برای ${name}؛ مقادیر و مواد اولیه را مطابق کافه خودتان تنظیم کنید.`,
      active: true,
      ingredients,
      addons: [],
      source: "template" as const
    };
  })
);
