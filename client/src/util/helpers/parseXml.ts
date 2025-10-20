import {XMLParser} from "fast-xml-parser";

export function parseXmlToJson(xml: string): any {
	const parser = new XMLParser({
		// XML 요소의 속성(Attribute)을 무시하고 파싱할지 여부
		// false: 무시하지 않고 파싱 결과에 포함 (대부분 이 옵션)
		// true: 완전히 무시하고 결과에 포함시키지 않음
		ignoreAttributes: false,

		// attributeNamePrefix: XML 속성 이름 앞에 붙일 접두사 설정
		// 비어있는 문자열("")로 설정하면 접두사 없이 속성 이름만 사용
		// "@_": 일반적으로 속성 이름 앞에 붙여서 일반 요소 이름과 구분하기 위해 사용
		attributeNamePrefix: "@_",

		// allowBooleanAttributes: HTML처럼 값이 없는 불리언 속성을 true로 파싱할지
		// false: 값이 없으면 속성을 무시하거나 빈 문자열 등으로 처리
		// true: 값이 없는 속성을 true로 처리
		allowBooleanAttributes: true,

		// parseTagValue: XML 태그 내부의 텍스트 값을 자동으로 파싱할지 여부
		// false: 태그 값을 무조건 문자열로 파싱
		// true: 태그 값을 숫자, 불리언 등 적절한 타입으로 자동 파싱 시도
		parseTagValue: true,

		// parseAttributeValue: XML 속성 값을 자동으로 파싱할지 여부
		parseAttributeValue: true,

		// trimValues: XML 태그 내부의 텍스트 값이나 속성 값의 앞뒤 공백을 제거할지
		trimValues: true,
	});

	try {
		return parser.parse(xml);
	} catch (err) {
		console.error("XML 파싱 실패:", err);
		throw err;
	}
}
