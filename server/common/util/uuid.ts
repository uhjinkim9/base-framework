import {v4 as uuidv4} from "uuid";

// UUID 생성 함수
export const generateUUID = (): string => {
	return uuidv4();
};

// 예시 사용
// const myUUID = generateUUID();
// 예: "3b19d6ac-a3a7-435c-891a-a57f4cfd4d7d"
