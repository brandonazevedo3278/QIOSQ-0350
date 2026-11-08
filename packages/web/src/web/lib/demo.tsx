import React, { createContext, useContext, useState, useEffect } from "react";
export type Store = {
  id: string;
  name: string;
  owner: string;
  document: string;
  email: string;
  phone: string;
  whatsapp: string;
  address: string;
  city: string;
  state: string;
  country: string;
  category: string;
  plan: string;
  status: string;
  created: string;
  x: number;
  y: number;
  delivery: boolean;
  radius: number;
  fee: number;
  minimum: number;
  estimate: string;
  hours: string;
  description: string;
};
export type Product = {
  id: string;
  tenantId: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  available: boolean;
  extras: string;
  variations: string;
  promo: boolean;
};
export type Order = {
  id: string;
  tenantId: string;
  customer: string;
  point: string;
  type: string;
  status: string;
  items: { name: string; qty: number; price: number; note: string }[];
  total: number;
  payment: string;
  paid: number;
  created: string;
  address: string;
  rating?: number;
};
export type Member = {
  id: string;
  tenantId: string;
  name: string;
  email: string;
  role: string;
  active: boolean;
  permissions: string[];
};
export type Point = {
  id: string;
  tenantId: string;
  name: string;
  type: string;
  x: number;
  y: number;
};
export type Plan = { id: string; name: string; price: number; limit: number; features: string };
export type Region = {
  id: string;
  tenantId: string;
  name: string;
  shape: string;
  radius: number;
  points: { x: number; y: number }[];
};
export type DemoData = {
  stores: Store[];
  products: Product[];
  orders: Order[];
  members: Member[];
  points: Point[];
  plans: Plan[];
  regions: Region[];
  categories: { id: string; tenantId: string; name: string }[];
  logs: { date: string; action: string }[];
  settings: Record<string, string>;
  favorites: string[];
};
export const stages = [
  "Recebido",
  "Confirmado",
  "Em preparação",
  "Pronto",
  "Saiu para entrega",
  "Concluído",
  "Cancelado",
];
export const money = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);
export const uid = () => crypto.randomUUID().slice(0, 8);
const baseStores = [
  [
    "tropical",
    "Quiosque Tropical",
    "Mariana Costa",
    "Leblon",
    "Quiosque",
    "Premium",
    "Ativo",
    30,
    60,
  ],
  [
    "onda",
    "Onda do Mar",
    "Pedro Oliveira",
    "Copacabana",
    "Restaurante",
    "Profissional",
    "Ativo",
    68,
    32,
  ],
  ["brisa", "Brisa Beach Bar", "Camila Santos", "Ipanema", "Bar", "Premium", "Teste", 48, 48],
  [
    "sabor",
    "Sabor Carioca",
    "Rafael Lima",
    "Botafogo",
    "Restaurante",
    "Inicial",
    "Suspenso",
    82,
    20,
  ],
  [
    "sol",
    "Sol & Sal",
    "Isabela Rocha",
    "Barra da Tijuca",
    "Barraca de praia",
    "Profissional",
    "Ativo",
    16,
    75,
  ],
];
const stores: Store[] = baseStores.map((s, i) => ({
  id: String(s[0]),
  name: String(s[1]),
  owner: String(s[2]),
  document: `12.345.67${i}/0001-90`,
  email: `contato@${s[0]}.example`,
  phone: "(21) 99999-1000",
  whatsapp: "(21) 99999-1000",
  address: `Av. ${i === 0 ? "Delfim Moreira" : "Atlântica"}, ${100 + i * 200}`,
  city: "Rio de Janeiro",
  state: "RJ",
  country: "Brasil",
  category: String(s[4]),
  plan: String(s[5]),
  status: String(s[6]),
  created: `2026-10-${12 + i * 3}`,
  x: Number(s[7]),
  y: Number(s[8]),
  delivery: true,
  radius: 8,
  fee: 9.9,
  minimum: 30,
  estimate: "35–50 min",
  hours: "10:00–23:00",
  description: "Sabor de praia, ingredientes frescos e bons momentos à beira-mar.",
}));
const menu = [
  [
    "Camarão à Brasileira",
    "Camarões grelhados, arroz de coco e toque de limão.",
    89.9,
    "Grelhados",
    "shrimp",
  ],
  ["Caipirinha clássica", "Limão fresco, cachaça artesanal e gelo.", 24.9, "Bebidas", "drink"],
  ["Burger Tropical", "Pão brioche, carne 180g e queijo, com fritas.", 39.9, "Combos", "burger"],
  ["Peixe & fritas", "Filé crocante, fritas douradas e molho da casa.", 59.9, "Petiscos", "fish"],
  [
    "Porção de camarões",
    "Camarões para compartilhar com molho especial.",
    69.9,
    "Petiscos",
    "shrimp",
  ],
  ["Combo pôr do sol", "Burger Tropical + caipirinha clássica.", 59.9, "Combos", "burger"],
];
const products: Product[] = stores.flatMap((s) =>
  menu.map((p, i) => ({
    id: `${s.id}-p${i}`,
    tenantId: s.id,
    name: String(p[0]),
    description: String(p[1]),
    price: Number(p[2]),
    category: String(p[3]),
    image: `/images/${p[4]}.jpg`,
    available: true,
    extras: "Molho extra:5;Fritas extra:12",
    variations: "Tradicional;Sem pimenta",
    promo: i === 5,
  })),
);
const orders: Order[] = stores.flatMap((s, k) =>
  Array.from({ length: k === 0 ? 8 : 3 }, (_, i) => ({
    id: `${1024 + k * 10 + i}`,
    tenantId: s.id,
    customer: ["Ana Clara", "Lucas Mendes", "Juliana Alves", "Bruno Costa"][i % 4],
    point: i % 3 === 0 ? "Delivery" : `Mesa ${String(i + 1).padStart(2, "0")}`,
    type: i % 3 === 0 ? "Delivery" : "Local",
    status: [
      "Recebido",
      "Em preparação",
      "Pronto",
      "Concluído",
      "Confirmado",
      "Concluído",
      "Recebido",
      "Concluído",
    ][i % 8],
    items: [
      {
        name: menu[i % 6][0] as string,
        qty: (i % 2) + 1,
        price: menu[i % 6][2] as number,
        note: i === 0 ? "Sem pimenta, por favor." : "",
      },
    ],
    total: Math.round((menu[i % 6][2] as number) * ((i % 2) + 1) * 100) / 100,
    payment: i % 2 ? "Pix" : "Cartão",
    paid: i % 2 === 0 ? 0 : Math.round((menu[i % 6][2] as number) * ((i % 2) + 1) * 100) / 100,
    created: "2026-11-07T12:" + String(10 + i * 5).padStart(2, "0") + ":00",
    address: "Av. Atlântica, 1200 — Copacabana",
  })),
);
export const seed: DemoData = {
  stores,
  products,
  orders,
  members: stores.flatMap((s) =>
    ["Gerente", "Atendente", "Garçom", "Caixa", "Cozinha"].map((r, i) => ({
      id: `${s.id}-m${i}`,
      tenantId: s.id,
      name: ["Mariana Costa", "Gabriel Silva", "João Pereira", "Luiza Souza", "Diego Martins"][i],
      email: `equipe${i}@${s.id}.example`,
      role: r,
      active: true,
      permissions:
        r === "Gerente"
          ? ["Pedidos", "Cardápio", "Financeiro", "Equipe"]
          : r === "Caixa"
            ? ["Pedidos", "Financeiro"]
            : ["Pedidos"],
    })),
  ),
  points: stores.flatMap((s) =>
    Array.from({ length: 6 }, (_, i) => ({
      id: `${s.id}-pt${i}`,
      tenantId: s.id,
      name: `${i < 3 ? "Mesa" : "Guarda-sol"} ${String(i + 1).padStart(2, "0")}`,
      type: i < 3 ? "Mesa" : "Guarda-sol",
      x: 20 + i * 10,
      y: 38 + (i % 2) * 16,
    })),
  ),
  plans: [
    {
      id: "inicial",
      name: "Inicial",
      price: 99,
      limit: 100,
      features: "Cardápio digital;QR Codes;Pedidos locais",
    },
    {
      id: "profissional",
      name: "Profissional",
      price: 199,
      limit: 1000,
      features: "Tudo do Inicial;Delivery;Equipe;Relatórios",
    },
    {
      id: "premium",
      name: "Premium",
      price: 349,
      limit: 10000,
      features: "Tudo do Profissional;5 idiomas;Divisão de contas;Suporte prioritário",
    },
  ],
  regions: stores.map((s) => ({
    id: `${s.id}-r`,
    tenantId: s.id,
    name: "Zona sul",
    shape: "Círculo",
    radius: 8,
    points: [{ x: s.x, y: s.y }],
  })),
  categories: stores.flatMap((s) =>
    ["Grelhados", "Bebidas", "Petiscos", "Combos"].map((name) => ({
      id: uid(),
      tenantId: s.id,
      name,
    })),
  ),
  logs: [{ date: "07/11/2026, 12:10", action: "Demonstração inicializada com dados fictícios." }],
  settings: {
    languages: "Português;Inglês;Espanhol;Francês;Alemão",
    categories: "Quiosque;Restaurante;Bar;Barraca de praia",
    support: "suporte@qiosq.example",
    currency: "BRL",
    timezone: "America/Sao_Paulo",
    notifications: "Ativas",
  },
  favorites: [],
};
const Context = createContext<any>(null);
export function DemoProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<DemoData>(() => {
    try {
      const saved = localStorage.getItem("qiosq-demo-v1");
      return saved ? JSON.parse(saved) : seed;
    } catch {
      return seed;
    }
  });
  const [toast, setToast] = useState("");
  useEffect(() => {
    try {
      localStorage.setItem("qiosq-demo-v1", JSON.stringify(data));
    } catch {
      setToast("Limite de armazenamento do navegador atingido. A alteração está apenas nesta sessão; reduza o tamanho das fotografias.");
    }
  }, [data]);
  useEffect(() => {
    const sync = (e: StorageEvent) => {
      if (e.key !== "qiosq-demo-v1" || !e.newValue) return;
      try {
        const incoming = JSON.parse(e.newValue);
        if (Array.isArray(incoming.stores) && Array.isArray(incoming.orders)) setData(incoming);
      } catch { /* Keep the working state if another tab has invalid data. */ }
    };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);
  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(""), 4000);
      return () => clearTimeout(t);
    }
  }, [toast]);
  function mutate(fn: (d: DemoData) => DemoData, action: string) {
    setData((d) => ({
      ...fn(d),
      logs: [{ date: new Date().toLocaleString("pt-BR"), action }, ...d.logs].slice(0, 100),
    }));
    setToast(action);
  }
  return (
    <Context.Provider value={{ data, mutate, notify: setToast }}>
      {children}
      {toast && (
        <output className="toast" aria-live="polite">
          ✓ {toast}
        </output>
      )}
    </Context.Provider>
  );
}
export function useDemo(): {
  data: DemoData;
  mutate: (fn: (d: DemoData) => DemoData, action: string) => void;
  notify: (s: string) => void;
} {
  return useContext(Context);
}
export function downloadCSV(name: string, rows: Record<string, unknown>[]) {
  const keys = Object.keys(rows[0] || {});
  const csv =
    "﻿" +
    [
      keys.join(";"),
      ...rows.map((r) =>
        keys.map((k) => '"' + String(r[k] ?? "").replaceAll('"', '""') + '"').join(";"),
      ),
    ].join("\n");
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  a.download = name + ".csv";
  a.click();
  URL.revokeObjectURL(a.href);
}
