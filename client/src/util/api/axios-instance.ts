/**
 * @fileoverview Axios 인스턴스 설정 및 인터셉터
 * @module axios-instance
 * @description API 요청을 위한 Axios 인스턴스를 생성하고, 요청 및 응답 인터셉터를 설정
 *
 * @author 김어진
 * @created 2025-03-18
 */

import axios, {
	AxiosInstance,
	InternalAxiosRequestConfig,
	AxiosResponse,
} from "axios";

import {GATEWAY_URL, ERP_API_KEY, ERP_API_BASE_URL} from "../common/config";
import {LocalStorage} from "../common/storage";

// API 기본 URL 설정
const baseURL = `${GATEWAY_URL}`;
const erpBaseUrl = `${ERP_API_BASE_URL}`;

// Axios 기본 인스턴스
const api: AxiosInstance = axios.create({
	baseURL,
	withCredentials: true, // 쿠키 전달 허용 (리프레시 토큰 사용 시 필요)
	headers: {
		"Content-Type": "application/json",
	},
});

// 외부(ERP) 요청 시 인스턴스
const externalApi: AxiosInstance = axios.create({
	baseURL: erpBaseUrl,
	withCredentials: true,
	headers: {
		"Content-Type": "application/json",
		"X-API-KEY": ERP_API_KEY, // ERP API 키 추가
	},
});

// 파일 전송 인스턴스
const fileApi: AxiosInstance = axios.create({
	baseURL,
	withCredentials: true,
	headers: {
		"Content-Type": "multipart/form-data",
	},
});

// 공통 요청 인터셉터: 토큰 설정
function setReqAuthInterceptor(instance: AxiosInstance) {
	instance.interceptors.request.use(
		async (config: InternalAxiosRequestConfig) => {
			const accessToken = localStorage.getItem("accessToken");
			if (accessToken) {
				config.headers.Authorization = `Bearer ${accessToken}`;
			}
			return config;
		},
		(error) => Promise.reject(error)
	);
}

function setResAuthInterceptor(instance: AxiosInstance) {
	instance.interceptors.response.use(
		(response: AxiosResponse) => response,
		async (error) => {
			const originalRequest =
				error.config as InternalAxiosRequestConfig & {
					_retry?: boolean;
				};

			// 액세스 토큰 만료 시 리프레시 토큰을 사용하여 갱신
			if (error.response?.status === 401 && !originalRequest._retry) {
				console.log("인터셉터에서 액세스 토큰 갱신 시도");

				originalRequest._retry = true; // 무한 루프 방지

				try {
					const param = {
						userId: localStorage.getItem("userId"),
						deviceId: localStorage.getItem("deviceId"),
					};
					const {data} = await axios.post(
						`${baseURL}/auth/renewToken`,
						param,
						{
							withCredentials: true,
						}
					);

					localStorage.setItem("accessToken", data.accessToken);

					// 갱신된 액세스 토큰으로 기존 요청 재시도
					originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
					return instance(originalRequest);
				} catch (refreshError) {
					console.log("리프레시 토큰 갱신 실패:", refreshError);
					LocalStorage.clearAll();
					window.location.href = "/login"; // 로그인 페이지로 이동
					return Promise.reject(refreshError);
				}
			}
			if (error.request) {
				console.log("요청이 전송되었지만 응답 없음:", error.request);
			}
			return Promise.reject(error);
		}
	);
}

setReqAuthInterceptor(api);
setResAuthInterceptor(api);

setReqAuthInterceptor(fileApi);
setResAuthInterceptor(fileApi);

export {api, externalApi, fileApi};
