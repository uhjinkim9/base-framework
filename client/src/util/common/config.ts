// 주의: 'NEXT_PUBLIC_' 접두어를 붙여야 넥스트에서 환경 변수를 읽을 수 있음

export const GATEWAY_URL: string | undefined =
  process.env.NEXT_PUBLIC_SERVER_URL;

export const ERP_API_BASE_URL: string | undefined =
  process.env.NEXT_PUBLIC_ERP_API_BASE_URL;

export const ERP_API_KEY: string | undefined =
  process.env.NEXT_PUBLIC_ERP_API_KEY;

/*************************** VAPID ***************************/
export const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
