import type { BaseResponse } from '@interfaces/base.interface';

export declare namespace GameResult {
  export type getListGame = BaseResponse<GameDataProps[]>;
}

export declare namespace GameResponse {
  export type getListGame = GameDataProps[];
}

export interface GameDataProps {
  id: string;
  name: string;
  slug: string;
  serviceSummary: string | null;
  artworkKey: string | null;
  serviceCount: number;
  active: boolean;
  popular: boolean;
  sortOrder: number;
  updatedAt: string;
}
