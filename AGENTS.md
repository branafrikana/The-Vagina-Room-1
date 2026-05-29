# Project Rules for The Vagina Room

## Product Ordering System
- **Signature Preparations**: Can use 3 ordering methods: `cart`, `affiliate` (external link), or `whatsapp`.
- **WhatsApp Sync**: WhatsApp links are dynamically generated using the phone number in `generalSettingsJson`. 
- **Auto-Update**: When editing products in the admin panel, changing the title/price/description should trigger a re-sync of the WhatsApp message link to keep it accurate.
- **Cart Persistence**: The shopping cart is persisted in `localStorage` (`tvr_cart`) to prevent loss on refresh.

## Multi-Source Integration
- The storefront aggregates products from multiple external JSON API sources configured in the admin panel.
- All external sources are proxied via `/api/proxy-products` to avoid CORS issues.

## Visual Identity
- **Theme**: "Cosmic Obsidian" - Deep blacks, brand gold (#D4AF37), and elegant serif typography (Playfair Display) paired with JetBrains Mono for data.
- **Micro-interactions**: Every button and card should have smooth hover states and entry animations using `motion`.
