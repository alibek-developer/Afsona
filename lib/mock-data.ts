import type { MenuItem, Order } from "./types"

export const mockMenuItems: MenuItem[] = [
  {
    id: "1",
    name: "Achchiq salat",
    description: "Yangi pomidor, bodring, piyoz va ko'katlar bilan",
    price: 25000,
    category: "XAMIRLI TAOMLAR", // Types dagi CATEGORIES ID siga moslandi
    image_url: "/fresh-uzbek-achichuk-tomato-cucumber-onion-salad.jpg",
    available_on_mobile: true,
    available_on_website: true,
    is_active: true
  },
  {
    id: "4",
    name: "Palov",
    description: "An'anaviy o'zbek palovi mol go'shti, sabzi va ziravorlar bilan",
    price: 45000,
    category: "MILLIY GO'SHTLI TAOMLAR",
    image_url: "/uzbek-plov-rice-pilaf-with-beef-carrots-and-spices.jpg",
    available_on_mobile: true,
    available_on_website: true,
    is_active: true
  },
  {
    id: "18",
    name: "Chak-chak",
    description: "Asalli shirinlik",
    price: 22000,
    category: "ICHIMLIKLAR", // Mavjud kategoriyaga vaqtincha biriktirildi
    image_url: "https://images.unsplash.com/photo-1579372786545-d24232daf58c?q=80&w=1000&auto=format&fit=crop",
    available_on_mobile: true,
    available_on_website: true,
    is_active: true
  }
]

export const mockOrders: Order[] = [
  {
    id: "ORD-001",
    created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    customer_name: "Aziz Karimov",
    phone: "+998901234567", // customer_phone -> phone ga o'zgartirildi
    mode: "delivery",
    type: "delivery", // Baza uchun qo'shimcha type maydoni
    delivery_address: "Yunusobod tumani, 12-uy",
    items: [
      { id: "1", name: "Achchiq salat", price: 25000, quantity: 2 },
      { id: "4", name: "Palov", price: 45000, quantity: 1 }
    ],
    total_amount: 95000, // total -> total_amount ga o'zgartirildi
    delivery_fee: 5000,
    status: "preparing",
    source: "website",
    payment_method: "cash"
  },
  {
    id: "ORD-002",
    created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    customer_name: "Malika Rahimova",
    phone: "+998909876543",
    mode: "dine-in",
    type: "restaurant",
    table_number: "5",
    items: [
      { id: "1", name: "Achchiq salat", price: 25000, quantity: 1 }
    ],
    total_amount: 25000,
    status: "new",
    source: "mobile",
    payment_method: "card"
  }
]