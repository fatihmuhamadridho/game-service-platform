'use client';

import { useMemo, useState } from 'react';
import type { CheckoutGame, CheckoutService } from '../interfaces/checkout.interface';
import { CheckoutTemplate } from '../templates/Checkout.template';

const games: CheckoutGame[] = [
  { name: 'Roblox', mark: 'R', art: 'roblox' },
  { name: 'Mobile Legends', mark: '✦', art: 'ml' },
  { name: 'Free Fire', mark: '◈', art: 'ff' },
  { name: 'PUBG Mobile', mark: 'P', art: 'pubg' },
  { name: 'Valorant', mark: 'V', art: 'valo' },
  { name: 'Genshin Impact', mark: '✧', art: 'genshin' },
];
const services: CheckoutService[] = [
  { name: 'Joki Rank Bronze → Silver', estimate: '1 – 2 hari', price: 25000 },
  { name: 'Joki Rank Silver → Gold', estimate: '1 – 3 hari', price: 40000 },
  { name: 'Joki Rank Gold → Platinum', estimate: '2 – 4 hari', price: 70000 },
  { name: 'Joki Rank Platinum → Diamond', estimate: '3 – 5 hari', price: 120000 },
  { name: 'Joki Star (Custom)', estimate: 'Hubungi admin untuk estimasi', custom: true },
];
const formatPrice = (price: number) => `Rp ${price.toLocaleString('id-ID')}`;

export const CheckoutPage = ({ gameSlug }: { gameSlug: string }) => {
  const initialGame =
    games.find((game) => game.name.toLowerCase().replaceAll(' ', '-') === gameSlug.toLowerCase())?.name ?? 'Roblox';
  const [selectedGame, setSelectedGame] = useState(initialGame);
  const [selectedService, setSelectedService] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<string[]>([]);
  const selected = services[selectedService];
  const total = useMemo(() => (selected.price ? selected.price * quantity : 0), [selected.price, quantity]);

  const continueOrder = () => {
    const form = document.getElementById('order-details') as HTMLFormElement | null;
    const formData = form ? new FormData(form) : new FormData();
    const missing = ['name', 'phone', 'account'].filter((key) => !String(formData.get(key) ?? '').trim());
    setErrors(missing);
    if (selected.custom) {
      document.getElementById('custom-service')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    if (missing.length) {
      document.getElementById('order-details')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    setStep(3);
  };

  return (
    <CheckoutTemplate
      games={games}
      services={services}
      selectedGame={selectedGame}
      selectedService={selectedService}
      quantity={quantity}
      step={step}
      errors={errors}
      total={total}
      formatPrice={formatPrice}
      onGameSelect={(game) => {
        setSelectedGame(game);
        setSelectedService(0);
      }}
      onServiceSelect={setSelectedService}
      onQuantity={setQuantity}
      onContinue={continueOrder}
      onDetailsChange={() => setErrors([])}
    />
  );
};
