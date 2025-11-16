export type PaymentScanResult = {
  status: 'ok' | 'error';
  message: string;
  payment_type: 'instant' | 'standard' | 'standing_order';
  recipient_name: string | null;
  recipient_account: string | null;
  amount: number | null;
  reference: string | null;
  due_date: string | null;
};

const BASE_URL =
  (import.meta as any).env?.VITE_PAYMENT_SCAN_API_BASE_URL ?? 'http://localhost:8001';

export async function scanPaymentDocument(imagePath: string): Promise<PaymentScanResult> {
  const response = await fetch(`${BASE_URL}/api/payment/scan`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ image_path: imagePath }),
  });

  if (!response.ok) {
    return {
      status: 'error',
      message: `HTTP ${response.status}`,
      payment_type: 'standard',
      recipient_name: null,
      recipient_account: null,
      amount: null,
      reference: null,
      due_date: null,
    };
  }

  const data = (await response.json()) as PaymentScanResult;
  return data;
}


