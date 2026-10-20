export type Flavor = {
  id: string;
  /** Short label used in nav dots and chips */
  name: string;
  /** Big display word rendered behind the can */
  display: string;
  tagline: string;
  description: string;
  /** Main brand accent — drives glow, text, progress bars */
  accent: string;
  /** Secondary accent used for gradients and the liquid tint */
  accent2: string;
  /** Deep background tone the page morphs to when this flavor is active */
  bg: string;
  can: string;
  volume: string;
  caffeine: string;
  /** Three stat bars, 0–100 */
  profile: { label: string; value: number }[];
  notes: string[];
};

export const FLAVORS: Flavor[] = [

  {
    id: 'classic',
    name: 'Classic',
    display: 'CLASSIC',
    tagline: 'Charge Your Power',
    description:
      'Əfsanənin başladığı yer. Balanslı sitrus-tropik profil, kəskin karbonizasiya və 12 saatlıq fokus. Bizonun imza dadı.',
    accent: '#2F6BFF',
    accent2: '#7FB2FF',
    bg: '#060B1C',
    can: 'cans/classic.webp',
    volume: '250 ml',
    caffeine: '80 mg',
    profile: [
      { label: 'Enerji', value: 82 },
      { label: 'Fokus', value: 74 },
      { label: 'Təravət', value: 90 },
    ],
    notes: ['Turşuluq tənzimləyiciləri', 'Tropik', 'Sərin bitiş'],
  },

  {
    id: 'max',
    name: 'Max',
    display: 'MAX',
    tagline: 'Maximum Overdrive',
    description:
      'Daha sıx formula, daha uzun dayanıqlılıq. Taurin və B-kompleksin gücləndirilmiş dozası — maksimum yüklənmə üçün.',
    accent: '#1E7BE8',
    accent2: '#FF4438',
    bg: '#04101F',
    can: 'cans/max.webp',
    volume: '250 ml',
    caffeine: '110 mg',
    profile: [
      { label: 'Enerji', value: 97 },
      { label: 'Fokus', value: 88 },
      { label: 'Təravət', value: 71 },
    ],
    notes: ['İntensiv', 'Taurin+', 'Uzun təsir'],
  },

  {
    id: 'red',
    name: 'Red',
    display: 'RED',
    tagline: 'Pure Adrenaline',
    description:
      'Qırmızı meyvə və nar qarışığı. Kəskin, isti və partlayıcı — qan dövranını saniyələr içində oyadan dad.',
    accent: '#E8242F',
    accent2: '#FF7A6B',
    bg: '#180407',
    can: 'cans/red.webp',
    volume: '250 ml',
    caffeine: '80 mg',
    profile: [
      { label: 'Enerji', value: 88 },
      { label: 'Fokus', value: 70 },
      { label: 'Təravət', value: 78 },
    ],
    notes: ['Nar', 'Qırmızı meyvə', 'Kəskin'],
  },

  {
    id: 'green',
    name: 'Green',
    display: 'GREEN',
    tagline: 'Fresh Impact',
    description:
      'Nanə aromatizatoru. Yüngül, təmiz və sərinlədici — gün ərzində ağırlıq hissi vermədən yükləyir.',
    accent: '#2ECC4E',
    accent2: '#A8F57E',
    bg: '#04140A',
    can: 'cans/green.webp',
    volume: '250 ml',
    caffeine: '80 mg',
    profile: [
      { label: 'Enerji', value: 76 },
      { label: 'Fokus', value: 72 },
      { label: 'Təravət', value: 96 },
    ],
    notes: ['Nanə', 'Laym', 'Təmiz'],
  },

  {
    id: 'pink',
    name: 'Pink Edition',
    display: 'PINK',
    tagline: 'Limited Edition',
    description:
      ' Məhdud buraxılış — yumşaq giriş, uzun və şirin bitiş.',
    accent: '#EC46A8',
    accent2: '#FFA6DC',
    bg: '#170612',
    can: 'cans/pink.webp',
    volume: '250 ml',
    caffeine: '80 mg',
    profile: [
      { label: 'Enerji', value: 74 },
      { label: 'Fokus', value: 68 },
      { label: 'Təravət', value: 86 },
    ],
    notes: ['Aromatizator', 'Taurin', 'Vanil'],
  },
  {
    id: 'sugar-free',
    name: 'Sugar Free',
    display: 'SUGAR',
    tagline: 'Zero Sugar · Maximum Energy',
    description:
      'Sıfır şəkər, eyni güc. Taurin, B-vitaminlər və kəskin karbonizasiya — kalorisiz yükləmə üçün qurulmuş formula.',
    accent: '#0EC8C0',
    accent2: '#7FF0EB',
    bg: '#020F0E',
    can: 'cans/sugar-free.webp',
    volume: '250 ml',
    caffeine: '80 mg',
    profile: [
      { label: 'Enerji', value: 80 },
      { label: 'Fokus', value: 76 },
      { label: 'Təravət', value: 94 },
    ],
    notes: ['0 şəkər', 'Taurin', 'Yüngül'],
  },

  {
    id: 'exotic',
    name: 'Exotic',
    display: 'EXOTIC',
    tagline: 'New Mood · Strawberry Mango',
    description:
      'Çiyələk və manqonun tropik birləşməsi. Yeni əhval-ruhiyyə, canlı meyvə partlaması — yüngül efervesans ilə ekzotik bir təcrübə.',
    accent: '#E040A8',
    accent2: '#7DD4F0',
    bg: '#09060F',
    can: 'cans/exotic.webp',
    volume: '250 ml',
    caffeine: '80 mg',
    profile: [
      { label: 'Enerji', value: 78 },
      { label: 'Fokus', value: 65 },
      { label: 'Təravət', value: 92 },
    ],
    notes: ['Çiyələk', 'Manqo', 'Tropik'],
  },

  {
    id: 'white-diamond',
    name: 'White Diamond',
    display: 'DIAMOND',
    tagline: 'Premium Edition',
    description:
      'Gümüşü premium qab, qızılı imza. Köpüklü mineral su bazasında yüngül sitrus vurğusu — zərif, incə, eksklyuziv.',
    accent: '#D4AF37',
    accent2: '#F0E48A',
    bg: '#0A0A08',
    can: 'cans/white-diamond.webp',
    volume: '250 ml',
    caffeine: '95 mg',
    profile: [
      { label: 'Enerji', value: 85 },
      { label: 'Fokus', value: 90 },
      { label: 'Təravət', value: 72 },
    ],
    notes: ['Premium', 'Sitrus', 'Mineral'],
  },

  {
    id: 'black-diamond',
    name: 'Black Diamond',
    display: 'DIAMOND',
    tagline: 'Zero Sugar · Dark Edition',
    description:
      'Şəkərsiz. Qara üzüm və tünd gilas üzərində qurulmuş premium profil — ağır, zərif və tam nəzarətdə.',
    accent: '#E0AE3C',
    accent2: '#FFE39A',
    bg: '#0B0A06',
    can: 'cans/black-diamond.webp',
    volume: '250 ml',
    caffeine: '95 mg',
    profile: [
      { label: 'Enerji', value: 90 },
      { label: 'Fokus', value: 93 },
      { label: 'Təravət', value: 64 },
    ],
    notes: ['0 şəkər', 'Qara üzüm', 'Premium'],
  },

  {
    id: 'cyber',
    name: 'Cyber',
    display: 'CYBER',
    tagline: 'Gamer Formula',
    description:
      'Oyunçular üçün yaradılıb. Lutein, kolin və L-teanin — reaksiya sürəti, dəqiqlik və göz dayanıqlılığı üçün.',
    accent: '#F0D21C',
    accent2: '#FFF48A',
    bg: '#100E02',
    can: 'cans/cyber.webp',
    volume: '250 ml',
    caffeine: '120 mg',
    profile: [
      { label: 'Reaksiya', value: 95 },
      { label: 'Dəqiqlik', value: 92 },
      { label: 'Dayanıqlıq', value: 89 },
    ],
    notes: ['Lutein', 'L-Teanin', 'Kolin'],
  },

  {
    id: 'ice-coffee-latte',
    name: 'Ice Latte',
    display: 'LATTE',
    tagline: 'Cold Brew · Smooth & Sweet',
    description:
      'Soyuq dəmlənmiş qəhvə, yumşaq süd köpüyü. Həm enerji, həm ləzzət — gün ərzində soyuq kofein ritualu.',
    accent: '#C87840',
    accent2: '#F0C890',
    bg: '#100804',
    can: 'cans/ice-coffee-latte.webp',
    volume: '250 ml',
    caffeine: '70 mg',
    profile: [
      { label: 'Enerji', value: 70 },
      { label: 'Fokus', value: 80 },
      { label: 'Təravət', value: 68 },
    ],
    notes: ['Cold Brew', 'Süd', 'Şirin'],
  },

  {
    id: 'ice-coffee-cappuccino',
    name: 'Cappuccino',
    display: 'CAPPUCCINO',
    tagline: 'Cold Brew · Rich & Bold',
    description:
      'Yoğun espresso bazası, qalın köpük. İtalyan cappuccinosunun soyuq, güclü versiyası — intensiv kofein dozu.',
    accent: '#B86830',
    accent2: '#E0A870',
    bg: '#0E0804',
    can: 'cans/ice-coffee-cappuccino.webp',
    volume: '250 ml',
    caffeine: '75 mg',
    profile: [
      { label: 'Enerji', value: 72 },
      { label: 'Fokus', value: 85 },
      { label: 'Təravət', value: 60 },
    ],
    notes: ['Espresso', 'Cappuccino', 'Yoğun'],
  }
];

export const flavorById = (id: string) =>
  FLAVORS.find((f) => f.id === id) ?? FLAVORS[0];
