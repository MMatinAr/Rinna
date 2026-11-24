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
  "بار گرم": [{name:"شیر",amount:180,unit:"ml",unitCost:90},{name:"پودر نوشیدنی یا چای",amount:25,unit:"g",unitCost:420},{name:"شکر",amount:8,unit:"g",unitCost:90}],
  "بار سرد": [{name:"دانه قهوه",amount:18,unit:"g",unitCost:1100},{name:"شیر",amount:150,unit:"ml",unitCost:90},{name:"یخ",amount:100,unit:"g",unitCost:5},{name:"سیروپ",amount:15,unit:"ml",unitCost:450}],
  "اسپرسو بار": [{name:"دانه قهوه",amount:18,unit:"g",unitCost:1100},{name:"شیر",amount:120,unit:"ml",unitCost:90}],
  "چای و دمنوش": [{name:"چای یا گیاه خشک",amount:5,unit:"g",unitCost:500},{name:"آب",amount:250,unit:"ml",unitCost:1},{name:"قند یا عسل",amount:10,unit:"g",unitCost:250}],
  "اسموتی و شیک": [{name:"میوه",amount:150,unit:"g",unitCost:350},{name:"شیر",amount:180,unit:"ml",unitCost:90},{name:"بستنی",amount:80,unit:"g",unitCost:300},{name:"یخ",amount:80,unit:"g",unitCost:5}],
  "آبمیوه طبیعی": [{name:"میوه تازه",amount:350,unit:"g",unitCost:260},{name:"یخ",amount:50,unit:"g",unitCost:5}],
  "کیک و دسر": [{name:"برش کیک یا دسر",amount:1,unit:"عدد",unitCost:28000},{name:"خامه یا سس تزئین",amount:25,unit:"g",unitCost:500}],
  "کوکی و شیرینی": [{name:"آرد",amount:60,unit:"g",unitCost:80},{name:"کره",amount:25,unit:"g",unitCost:650},{name:"شکر",amount:18,unit:"g",unitCost:90},{name:"شکلات",amount:20,unit:"g",unitCost:600}],
  "صبحانه و برانچ": [{name:"تخم‌مرغ",amount:2,unit:"عدد",unitCost:1800},{name:"نان",amount:80,unit:"g",unitCost:120},{name:"پنیر یا کره",amount:30,unit:"g",unitCost:450},{name:"سبزیجات",amount:40,unit:"g",unitCost:180}],
  "غذا و میان‌وعده": [{name:"پروتئین یا ماده اصلی",amount:120,unit:"g",unitCost:520},{name:"نان یا پاستا",amount:1,unit:"عدد",unitCost:900},{name:"سس",amount:30,unit:"g",unitCost:300},{name:"سبزیجات",amount:50,unit:"g",unitCost:180}]
};
