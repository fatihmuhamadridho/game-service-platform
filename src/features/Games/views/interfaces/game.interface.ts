export type GameCardView = {
  id?: string;
  slug?: string;
  name: string;
  art: string;
  tags: string[];
  count: number;
  rating: string;
  reviews: number;
};
export type GameFilter = { label: string; count: number; icon: string };
