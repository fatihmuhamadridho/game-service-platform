export type CheckoutGame = { id: string; slug: string; name: string; mark: string; art: string };
export type CheckoutService = { id: string; name: string; estimate: string; price?: number; custom?: boolean };
export type CheckoutFieldErrors = string[];

export type CheckoutApiResponse<T> = {
  status: { code: string; message: string };
  data: T | null;
};

export type CheckoutCreatedOrder = {
  order: {
    id: string;
    orderNumber: string;
    orderStatus: string;
    paymentStatus: string;
    totalAmount: number;
    currency: string;
    expiresAt: string;
    game: { name: string };
    service: { id: string; name: string };
    quantity: number;
  };
  payment: {
    id: string;
    method: string;
    status: string;
    amount: number;
    instructions: {
      qrImageUrl: string | null;
      bankName: string | null;
      accountNumber: string | null;
      accountHolder: string | null;
      reference: string | null;
    };
  };
  nextAction: string;
  idempotentReplay: boolean;
};
