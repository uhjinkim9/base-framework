import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

// ERP API 기본 설정
const erpApiClient = axios.create({
  baseURL: process.env.ERP_BASE_URL, // ERP 서버 기본 URL
  timeout: 10000, // 10초 타임아웃
});

// ERP API 요청 함수
const erpApiRequest = async <T = any>(
  method: 'get' | 'post' | 'put' | 'delete',
  url: string,
  data: any = {},
  config: AxiosRequestConfig = {},
): Promise<T> => {
  try {
    // console.log(`=== ERP API 요청 시작 ===`);
    // console.log(`Method: ${method.toUpperCase()}`);
    // console.log(
    // `Full URL: ${(process.env.ERP_BASE_URL || 'http://localhost:8080') + url}`,
    // );
    // console.log(`Data:`, data);
    // console.log(`ERP_API_KEY:`, process.env.ERP_API_KEY ? '설정됨' : '미설정');

    const requestConfig = {
      method,
      url,
      data: method === 'get' ? undefined : data,
      params: method === 'get' ? data : undefined,
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': process.env.ERP_API_KEY, // ERP API 키
        ...config.headers,
      },
      ...config,
    };

    const response: AxiosResponse<T> = await erpApiClient(requestConfig);

    // console.log(`=== ERP API 응답 ===`);
    // console.log(`Status: ${response.status}`);
    // console.log(`Headers:`, response.headers);
    // console.log(`Data:`, response.data);

    return response.data;
  } catch (error) {
    console.error(`=== ERP API 요청 실패 ===`);
    console.error(`Method: ${method.toUpperCase()}`);
    console.error(`URL: ${url}`);
    console.error(`Error:`, error);

    if (error.response) {
      console.error(`Response Status: ${error.response.status}`);
      console.error(`Response Data:`, error.response.data);
      console.error(`Response Headers:`, error.response.headers);
    } else if (error.request) {
      console.error(`Request:`, error.request);
    } else {
      console.error(`Error Message:`, error.message);
    }

    console.error(`ERP API 요청 실패 [${method.toUpperCase()}] ${url}:`, error);
    throw error;
  }
};

// ERP POST 요청
export const externalPost = <T = any>(
  url: string,
  data: any = {},
  config: AxiosRequestConfig = {},
) => erpApiRequest<T>('post', url, data, config);

// ERP GET 요청
export const externalGet = <T = any>(
  url: string,
  params: any = {},
  config: AxiosRequestConfig = {},
) => erpApiRequest<T>('get', url, params, config);

// ERP PUT 요청
export const externalPut = <T = any>(
  url: string,
  data: any = {},
  config: AxiosRequestConfig = {},
) => erpApiRequest<T>('put', url, data, config);

// ERP DELETE 요청
export const externalDelete = <T = any>(
  url: string,
  params: any = {},
  config: AxiosRequestConfig = {},
) => erpApiRequest<T>('delete', url, params, config);

// ==================== 내부 서비스 통신 ====================

// 서비스별 기본 URL 매핑
const SERVICE_URLS = {
  auth: process.env.AUTH_BASE_URL,
  menu: process.env.MENU_BASE_URL,
  board: process.env.BOARD_BASE_URL,
  draft: process.env.DRAFT_BASE_URL,
  plan: process.env.PLAN_BASE_URL,
  poll: process.env.POLL_BASE_URL,
  mail: process.env.MAIL_BASE_URL,
  file: process.env.FILE_BASE_URL,
  docs: process.env.DOCS_BASE_URL,
};

// 내부 서비스 axios 클라이언트
const createServiceClient = (baseURL: string) => {
  return axios.create({
    baseURL,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

// 내부 서비스 요청 함수
const serviceRequest = async <T = any>(
  serviceName: keyof typeof SERVICE_URLS,
  method: 'get' | 'post' | 'put' | 'delete',
  url: string,
  data: any = {},
  config: AxiosRequestConfig = {},
): Promise<T> => {
  try {
    const serviceClient = createServiceClient(SERVICE_URLS[serviceName]);

    const requestConfig = {
      method,
      url,
      data: method === 'get' ? undefined : data,
      params: method === 'get' ? data : undefined,
      ...config,
    };

    const response: AxiosResponse<T> = await serviceClient(requestConfig);
    return response.data;
  } catch (error) {
    console.error(`=== ${serviceName.toUpperCase()} 서비스 요청 실패 ===`);
    console.error(`Method: ${method.toUpperCase()}`);
    console.error(`URL: ${url}`);
    console.error(`Error:`, error);
    throw error;
  }
};

// 서비스별 요청 함수들
export const menuService = {
  get: <T = any>(
    url: string,
    params: any = {},
    config: AxiosRequestConfig = {},
  ) => serviceRequest<T>('menu', 'get', url, params, config),
  post: <T = any>(
    url: string,
    data: any = {},
    config: AxiosRequestConfig = {},
  ) => serviceRequest<T>('menu', 'post', url, data, config),
  put: <T = any>(
    url: string,
    data: any = {},
    config: AxiosRequestConfig = {},
  ) => serviceRequest<T>('menu', 'put', url, data, config),
  delete: <T = any>(
    url: string,
    params: any = {},
    config: AxiosRequestConfig = {},
  ) => serviceRequest<T>('menu', 'delete', url, params, config),
};

export const boardService = {
  get: <T = any>(
    url: string,
    params: any = {},
    config: AxiosRequestConfig = {},
  ) => serviceRequest<T>('board', 'get', url, params, config),
  post: <T = any>(
    url: string,
    data: any = {},
    config: AxiosRequestConfig = {},
  ) => serviceRequest<T>('board', 'post', url, data, config),
  put: <T = any>(
    url: string,
    data: any = {},
    config: AxiosRequestConfig = {},
  ) => serviceRequest<T>('board', 'put', url, data, config),
  delete: <T = any>(
    url: string,
    params: any = {},
    config: AxiosRequestConfig = {},
  ) => serviceRequest<T>('board', 'delete', url, params, config),
};

export const draftService = {
  get: <T = any>(
    url: string,
    params: any = {},
    config: AxiosRequestConfig = {},
  ) => serviceRequest<T>('draft', 'get', url, params, config),
  post: <T = any>(
    url: string,
    data: any = {},
    config: AxiosRequestConfig = {},
  ) => serviceRequest<T>('draft', 'post', url, data, config),
  put: <T = any>(
    url: string,
    data: any = {},
    config: AxiosRequestConfig = {},
  ) => serviceRequest<T>('draft', 'put', url, data, config),
  delete: <T = any>(
    url: string,
    params: any = {},
    config: AxiosRequestConfig = {},
  ) => serviceRequest<T>('draft', 'delete', url, params, config),
};

export const planService = {
  get: <T = any>(
    url: string,
    params: any = {},
    config: AxiosRequestConfig = {},
  ) => serviceRequest<T>('plan', 'get', url, params, config),
  post: <T = any>(
    url: string,
    data: any = {},
    config: AxiosRequestConfig = {},
  ) => serviceRequest<T>('plan', 'post', url, data, config),
  put: <T = any>(
    url: string,
    data: any = {},
    config: AxiosRequestConfig = {},
  ) => serviceRequest<T>('plan', 'put', url, data, config),
  delete: <T = any>(
    url: string,
    params: any = {},
    config: AxiosRequestConfig = {},
  ) => serviceRequest<T>('plan', 'delete', url, params, config),
};

export const pollService = {
  get: <T = any>(
    url: string,
    params: any = {},
    config: AxiosRequestConfig = {},
  ) => serviceRequest<T>('poll', 'get', url, params, config),
  post: <T = any>(
    url: string,
    data: any = {},
    config: AxiosRequestConfig = {},
  ) => serviceRequest<T>('poll', 'post', url, data, config),
  put: <T = any>(
    url: string,
    data: any = {},
    config: AxiosRequestConfig = {},
  ) => serviceRequest<T>('poll', 'put', url, data, config),
  delete: <T = any>(
    url: string,
    params: any = {},
    config: AxiosRequestConfig = {},
  ) => serviceRequest<T>('poll', 'delete', url, params, config),
};

export const mailService = {
  get: <T = any>(
    url: string,
    params: any = {},
    config: AxiosRequestConfig = {},
  ) => serviceRequest<T>('mail', 'get', url, params, config),
  post: <T = any>(
    url: string,
    data: any = {},
    config: AxiosRequestConfig = {},
  ) => serviceRequest<T>('mail', 'post', url, data, config),
  put: <T = any>(
    url: string,
    data: any = {},
    config: AxiosRequestConfig = {},
  ) => serviceRequest<T>('mail', 'put', url, data, config),
  delete: <T = any>(
    url: string,
    params: any = {},
    config: AxiosRequestConfig = {},
  ) => serviceRequest<T>('mail', 'delete', url, params, config),
};

export const fileService = {
  get: <T = any>(
    url: string,
    params: any = {},
    config: AxiosRequestConfig = {},
  ) => serviceRequest<T>('file', 'get', url, params, config),
  post: <T = any>(
    url: string,
    data: any = {},
    config: AxiosRequestConfig = {},
  ) => serviceRequest<T>('file', 'post', url, data, config),
  put: <T = any>(
    url: string,
    data: any = {},
    config: AxiosRequestConfig = {},
  ) => serviceRequest<T>('file', 'put', url, data, config),
  delete: <T = any>(
    url: string,
    params: any = {},
    config: AxiosRequestConfig = {},
  ) => serviceRequest<T>('file', 'delete', url, params, config),
};

export const docsService = {
  get: <T = any>(
    url: string,
    params: any = {},
    config: AxiosRequestConfig = {},
  ) => serviceRequest<T>('docs', 'get', url, params, config),
  post: <T = any>(
    url: string,
    data: any = {},
    config: AxiosRequestConfig = {},
  ) => serviceRequest<T>('docs', 'post', url, data, config),
  put: <T = any>(
    url: string,
    data: any = {},
    config: AxiosRequestConfig = {},
  ) => serviceRequest<T>('docs', 'put', url, data, config),
  delete: <T = any>(
    url: string,
    params: any = {},
    config: AxiosRequestConfig = {},
  ) => serviceRequest<T>('docs', 'delete', url, params, config),
};
