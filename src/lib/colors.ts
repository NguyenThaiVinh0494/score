export interface ColorOption {
  key: string;
  name: string;
  badge: string;
  btn: string;
  border: string;
  dot: string;
}

export const COLOR_OPTIONS: ColorOption[] = [
  {
    key: "sky",
    name: "Xanh da trời",
    badge: "bg-sky-500 text-white",
    btn: "bg-sky-600 hover:bg-sky-700 active:bg-sky-800 shadow-sky-600/25",
    border: "border-sky-500",
    dot: "bg-sky-500",
  },
  {
    key: "emerald",
    name: "Xanh lục",
    badge: "bg-emerald-500 text-white",
    btn: "bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 shadow-emerald-600/25",
    border: "border-emerald-500",
    dot: "bg-emerald-500",
  },
  {
    key: "amber",
    name: "Vàng hổ phách",
    badge: "bg-amber-500 text-white",
    btn: "bg-amber-500 hover:bg-amber-600 active:bg-amber-700 shadow-amber-500/25 text-white",
    border: "border-amber-500",
    dot: "bg-amber-500",
  },
  {
    key: "rose",
    name: "Đỏ hồng",
    badge: "bg-rose-500 text-white",
    btn: "bg-rose-600 hover:bg-rose-700 active:bg-rose-800 shadow-rose-600/25",
    border: "border-rose-500",
    dot: "bg-rose-500",
  },
  {
    key: "indigo",
    name: "Xanh tím",
    badge: "bg-indigo-500 text-white",
    btn: "bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 shadow-indigo-600/25",
    border: "border-indigo-500",
    dot: "bg-indigo-500",
  },
  {
    key: "teal",
    name: "Xanh ngọc",
    badge: "bg-teal-500 text-white",
    btn: "bg-teal-600 hover:bg-teal-700 active:bg-teal-800 shadow-teal-600/25",
    border: "border-teal-500",
    dot: "bg-teal-500",
  },
  {
    key: "violet",
    name: "Tím hoa cà",
    badge: "bg-violet-500 text-white",
    btn: "bg-violet-600 hover:bg-violet-700 active:bg-violet-800 shadow-violet-600/25",
    border: "border-violet-500",
    dot: "bg-violet-500",
  },
  {
    key: "pink",
    name: "Hồng cánh sen",
    badge: "bg-pink-500 text-white",
    btn: "bg-pink-600 hover:bg-pink-700 active:bg-pink-800 shadow-pink-600/25",
    border: "border-pink-500",
    dot: "bg-pink-500",
  },
  {
    key: "orange",
    name: "Cam rực rỡ",
    badge: "bg-orange-500 text-white",
    btn: "bg-orange-500 hover:bg-orange-600 active:bg-orange-700 shadow-orange-500/25 text-white",
    border: "border-orange-500",
    dot: "bg-orange-500",
  },
  {
    key: "slate",
    name: "Xám than",
    badge: "bg-slate-700 text-white",
    btn: "bg-slate-800 hover:bg-slate-900 active:bg-black shadow-slate-800/25",
    border: "border-slate-700",
    dot: "bg-slate-700",
  },
];

export function getPlayerColor(colorKey?: string, defaultIndex = 0): ColorOption {
  if (colorKey) {
    const found = COLOR_OPTIONS.find((c) => c.key === colorKey);
    if (found) return found;
  }
  return COLOR_OPTIONS[defaultIndex % COLOR_OPTIONS.length];
}
