import {AxiosRequestConfig} from "axios";
import {api, externalApi, fileApi} from "./axios-instance";

/**
 * @fileoverview API 요청 유틸리티
 * @module api-service
 * @description 서버와의 GET 및 POST 요청을 처리하는 유틸리티 함수 제공
 *
 * @function request - 서버에 HTTP 요청을 보내는 범용 함수 (제네릭)
 * @function requestGet - 서버에 GET 요청을 보내는 함수
 * @function requestPost - 서버에 POST 요청을 보내는 함수(주로 사용)
 * @function requestPut - 서버에 PUT 요청을 보내는 함수
 * @function requestDelete - 서버에 DELETE 요청을 보내는 함수
 * @function externalApiRequest - 외부 API 요청을 처리하는 함수 (제네릭)
 * @function externalGet - 외부 API에 GET 요청을 보내는 함수
 * @function externalPost - 외부 API에 POST 요청을 보내는 함수(주로 사용)
 * @function fileRequest - 파일 관련 API 요청을 처리하는 함수 (제네릭)
 * @function filePost - 파일 업로드용 POST 요청을 처리하는 함수
 *
 * @dependencies
 * - axios: HTTP 요청을 위한 라이브러리
 *
 * @author 김어진
 * @created 2025-03-18
 *
 * @example
 * const data = await requestPost("/api/data", {key: "value"});
 * const response = await requestGet("/api/data");
 * const fileResponse = await filePost("/api/upload", formData);
 * const externalData = await externalGet("/api/externalData");
 * const externalResponse = await externalPost("/api/externalData", formData);
 */

type Method = "get" | "post" | "put" | "delete";

export async function request<T = any>(
	method: Method,
	url: string,
	data?: any,
	config: AxiosRequestConfig = {}
): Promise<T> {
	try {
		const response = await api.request<T>({
			method,
			url,
			...(method === "get" ? {params: data} : {data}),
			...config,
		});
		return response.data;
	} catch (error: any) {
		throw error?.response?.data || error;
	}
}

// 개별 메서드로 래핑
export const requestGet = <T = any>(
	url: string,
	params: any = {},
	config = {}
) => request<T>("get", url, params, config);

export const requestPost = <T = any>(
	url: string,
	data: any = {},
	config = {}
) => request<T>("post", url, data, config);

export const requestPut = <T = any>(url: string, data: any = {}, config = {}) =>
	request<T>("put", url, data, config);

export const requestDelete = <T = any>(
	url: string,
	data: any = {},
	config = {}
) => request<T>("delete", url, data, config);

// 외부로 API 요청을 보내는 함수
export async function externalApiRequest<T = any>(
	method: Method,
	url: string,
	data?: any,
	config: AxiosRequestConfig = {}
): Promise<T> {
	try {
		const response = await externalApi.request<T>({
			method,
			url,
			...(method === "get" ? {params: data} : {data}),
			...config,
		});
		return response.data;
	} catch (error: any) {
		throw error?.response?.data || error;
	}
}

export const externalGet = <T = any>(
	url: string,
	params: any = {},
	config: AxiosRequestConfig = {}
) => externalApiRequest<T>("get", url, params, config);

export const externalPost = <T = any>(
	url: string,
	data: any = {},
	config: AxiosRequestConfig = {}
) => externalApiRequest<T>("post", url, data, config);

// 외부로 API 요청을 보내는 함수
export async function fileRequest<T = any>(
	method: Method,
	url: string,
	data?: any,
	config: AxiosRequestConfig = {}
): Promise<T> {
	try {
		const response = await fileApi.request<T>({
			method,
			url,
			...(method === "get" ? {params: data} : {data}),
			...config,
		});
		return response.data;
	} catch (error: any) {
		throw error?.response?.data || error;
	}
}

export const filePost = <T = any>(
	url: string,
	data: any = {},
	config: AxiosRequestConfig = {}
) => fileRequest<T>("post", url, data, config);

/**
 * 서버에서 Blob 데이터를 받아오는 함수 (예: PDF, 이미지, 오디오 등)
 * @function requestBlob
 * @param method HTTP 메서드 ("get" 또는 "post" 등)
 * @param url 요청 URL
 * @param data 요청 시 전송할 데이터 (GET이면 params)
 * @param config 추가 axios 설정 (예: headers, responseType 등)
 */
export async function requestBlob(
	method: Method,
	url: string,
	data?: any,
	config: AxiosRequestConfig = {}
): Promise<Blob> {
	try {
		const response = await api.request<Blob>({
			method,
			url,
			...(method === "get" ? {params: data} : {data}),
			responseType: "blob",
			...config,
		});
		return response.data;
	} catch (error: any) {
		throw error?.response?.data || error;
	}
}

/**
 * 서버에서 Blob 데이터를 GET으로 받아오는 함수
 * @function requestGetBlob
 */
export const requestGetBlob = (
	url: string,
	params: any = {},
	config: AxiosRequestConfig = {}
) => requestBlob("get", url, params, config);
