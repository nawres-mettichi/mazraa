import type { Product } from "./types";

// Predefined products that will be automatically added to the database
export const INITIAL_PRODUCTS: Omit<Product, "id">[] = [
  {
    uniqueKey: "1",
    name: " Tote Bag",
    image: "/images/products/tote bag crispy1.png",
    remaining: 10,
    active: true,
    probability: 7.5,
  },

  {
    uniqueKey: "2",
    name: "Friteuse",
    probability: 0.2,
    image: "/images/products/airfryer.png",
    remaining: 2,
    active: true,
  },

  {
    uniqueKey: "3",
    name: "Produit Mazraa",
    image: "/images/products/chiken-nuggets.png",
    remaining: 15,
    active: true,
    probability: 1,
  },
  {
    uniqueKey: "4",
    name: "A la Prochaine",
    probability: 1,
    image:
      "https://imgs.search.brave.com/nsiGlyISticIptpic58hVto5HUTem6f76y5MqA_t5bE/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly90aHVt/YnMuZHJlYW1zdGlt/ZS5jb20vYi9mYWls/ZWQtcmVkLXJ1YmJl/ci1zdGFtcC1vdmVy/LXdoaXRlLWJhY2tn/cm91bmQtODg0MTIz/MTQuanBn",
    remaining: 999999,
    active: true,
  },

  {
    uniqueKey: "5",
    name: "Produit Mazraa",
    probability: 1,
    image: "/images/products/4.png",
    remaining: 15,
    active: true,
  },
  {
    uniqueKey: "6",
    name: "A la Prochaine",
    probability: 40,
    image:
      "https://imgs.search.brave.com/nsiGlyISticIptpic58hVto5HUTem6f76y5MqA_t5bE/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly90aHVt/YnMuZHJlYW1zdGlt/ZS5jb20vYi9mYWls/ZWQtcmVkLXJ1YmJl/ci1zdGFtcC1vdmVy/LXdoaXRlLWJhY2tn/cm91bmQtODg0MTIz/MTQuanBn",
    remaining: 999999,
    active: true,
  },
  {
    uniqueKey: "7",
    probability: 2.8,
    name: "Tablier",
    image: "/images/products/TABLIER street  mazraa.png",
    remaining: 10,
    active: true,
  },
  {
    uniqueKey: "8",
    name: "Produit Mazraa",
    image: "/images/products/boulettes.png",
    remaining: 15,
    active: true,
    probability: 40,
  },
];
