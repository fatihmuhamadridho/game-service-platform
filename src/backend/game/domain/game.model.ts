import type { GameDataProps } from './game.interface';

export class Game implements GameDataProps {
  readonly id!: string;
  name!: string;
  slug!: string;
  serviceSummary!: string | null;
  artworkKey!: string | null;
  serviceCount!: number;
  active!: boolean;
  popular!: boolean;
  sortOrder!: number;
  updatedAt!: string;

  constructor(props?: GameDataProps) {
    Object.assign(this, props);
  }
}
