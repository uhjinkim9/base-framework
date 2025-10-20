import React, {
  useEffect,
  useState,
  useImperativeHandle,
  forwardRef,
} from "react";
import parse, { DOMNode, Element } from "html-react-parser";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface Props {
  templateHtml: string | null | undefined;
  onSave: (finalHtml: string) => void;
}

interface FormDataMap {
  [key: string]: string;
}

// ref로 노출할 메서드들의 타입 정의
export interface DraftWriterRef {
  handleSubmit: () => void;
  getFormData: () => FormDataMap;
  generateFinalHtml: () => string;
}

// CSS 문자열을 React CSSProperties 객체로 변환하는 유틸리티 함수
const parseCssString = (cssString: string): React.CSSProperties => {
  const styles: React.CSSProperties = {};

  if (!cssString) return styles;

  cssString.split(";").forEach((declaration) => {
    const [property, value] = declaration.split(":").map((s) => s.trim());
    if (property && value) {
      // CSS 속성명을 camelCase로 변환 (예: text-align -> textAlign)
      const camelCaseProperty = property.replace(/-([a-z])/g, (match, letter) =>
        letter.toUpperCase()
      );
      (styles as any)[camelCaseProperty] = value;
    }
  });

  return styles;
};

const DraftWriterComponent = forwardRef<DraftWriterRef, Props>(
  ({ templateHtml, onSave }, ref) => {
    const [formData, setFormData] = useState<FormDataMap>({});

    // 초기값 설정: templateHtml에서 value를 추출하여 formData에 저장
    useEffect(() => {
      const initialFormData: FormDataMap = {};
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = templateHtml || "";

      const elements = tempDiv.querySelectorAll("input, textarea, select");
      elements.forEach((element) => {
        const name = element.getAttribute("name");
        const type = element.getAttribute("type");

        if (name) {
          if (type === "radio") {
            // radio 버튼의 경우 checked 속성이 있는 것만 초기값으로 설정
            if (element.hasAttribute("checked")) {
              const value = element.getAttribute("value") || "";
              initialFormData[name] = value;
            }
          } else if (type === "checkbox") {
            // checkbox의 경우 checked 속성이 있으면 "true", 없으면 "false"
            initialFormData[name] = element.hasAttribute("checked")
              ? "true"
              : "false";
          } else {
            // 일반 input, textarea, select
            const value =
              element.getAttribute("value") || element.textContent || "";
            initialFormData[name] = value;
          }
        }
      });

      // select의 경우 selected option 확인
      const selects = tempDiv.querySelectorAll("select");
      selects.forEach((select) => {
        const name = select.getAttribute("name");
        if (name) {
          const selectedOption = select.querySelector("option[selected]");
          if (selectedOption) {
            initialFormData[name] = selectedOption.getAttribute("value") || "";
          }
        }
      });

      setFormData(initialFormData);
    }, [templateHtml]);

    const handleChange = (name: string, value: string) => {
      setFormData((prev) => ({ ...prev, [name]: value }));
    };

    // HTML을 React 컴포넌트로 파싱
    const parsedHtml = templateHtml
      ? parse(templateHtml, {
          replace: (domNode: DOMNode) => {
            if (domNode instanceof Element) {
              const name = domNode.attribs.name;
              const type = domNode.attribs.type || "text";
              const style = domNode.attribs.style || "";
              const className = domNode.attribs.class || "";
              const width = domNode.attribs.width || "100%";
              const height = domNode.attribs.height || "auto";

              const dataAttributesObject = Object.keys(domNode.attribs)
                .filter((attr) => attr.startsWith("data-"))
                .reduce((acc, attr) => {
                  acc[attr] = domNode.attribs[attr];
                  return acc;
                }, {} as Record<string, string>);
              const isReadOnly = domNode.attribs.readonly === "true";

              if (className === "datePicker") {
                return (
                  <DatePicker
                    selected={
                      formData[name] ? new Date(formData[name] as string) : null
                    }
                    onChange={(date) =>
                      handleChange(
                        name,
                        date ? date.toISOString().split("T")[0] : ""
                      )
                    }
                    dateFormat={"yyyy-MM-dd"}
                    className="datePicker"
                    name={name}
                    placeholderText="YYYY-MM-DD"
                  />
                );
              } else if (domNode.name === "input" && type === "checkbox") {
                const isChecked = formData[name] === "true";
                return (
                  <input
                    type="checkbox"
                    name={name}
                    checked={isChecked}
                    className={className}
                    style={style ? parseCssString(style) : undefined}
                    {...dataAttributesObject}
                    onChange={(e) =>
                      handleChange(name, e.target.checked.toString())
                    }
                  />
                );
              } else if (domNode.name === "input" && type === "radio") {
                // radio 버튼의 value는 domNode.attribs.value에서 가져옴
                const radioValue = domNode.attribs.value || "";
                const isChecked = formData[name] === radioValue;

                return (
                  <input
                    type="radio"
                    name={name}
                    value={radioValue}
                    checked={isChecked}
                    className={className}
                    style={style ? parseCssString(style) : undefined}
                    {...dataAttributesObject}
                    onChange={(e) => {
                      console.log(`Radio changed: ${name} = ${e.target.value}`);
                      handleChange(name, e.target.value);
                    }}
                  />
                );
              } else if (domNode.name === "input") {
                const value = formData[name] || "";
                return (
                  <input
                    type={type}
                    name={name}
                    value={value}
                    className={className}
                    style={style ? parseCssString(style) : undefined}
                    width={width}
                    height={height}
                    readOnly={isReadOnly}
                    {...dataAttributesObject}
                    onChange={(e) => handleChange(name, e.target.value)}
                  />
                );
              }

              if (domNode.name === "select") {
                const options = domNode.children
                  .filter(
                    (child) =>
                      child instanceof Element && child.name === "option"
                  )
                  .map((option) => {
                    const optionElement = option as Element;
                    return (
                      <option
                        key={optionElement.attribs.value}
                        value={optionElement.attribs.value}>
                        {optionElement.children[0] &&
                        "data" in optionElement.children[0]
                          ? optionElement.children[0].data
                          : ""}
                      </option>
                    );
                  });

                return (
                  <select
                    name={name}
                    className={className}
                    style={style ? parseCssString(style) : undefined}
                    value={formData[name] || ""}
                    onChange={(e) => handleChange(name, e.target.value)}>
                    {options}
                  </select>
                );
              }

              if (domNode.name === "textarea") {
                return (
                  <textarea
                    name={name}
                    value={formData[name] || ""}
                    className={className}
                    style={style ? parseCssString(style) : undefined}
                    readOnly={isReadOnly}
                    {...dataAttributesObject}
                    onChange={(e) => handleChange(name, e.target.value)}
                  />
                );
              }
            }

            return undefined;
          },
        })
      : null;

    // 최종 HTML 변환 함수는 기존과 동일하게 유지
    const generateFinalHtml = (): string => {
      let finalHtml = templateHtml || "";

      Object.keys(formData).forEach((key) => {
        const value = formData[key];

        // input 치환 (일반 input, checkbox 제외)
        finalHtml = finalHtml.replace(
          new RegExp(
            `<input[^>]*name=["']${key}["'][^>]*type=["'](?!radio|checkbox)[^"']*["'][^>]*>`,
            "g"
          ),
          (match) => {
            // 기존 속성들을 추출
            const existingStyle =
              match.match(/style=["']([^"']*)["']/)?.[1] || "";
            const existingClass =
              match.match(/class=["']([^"']*)["']/)?.[1] || "";
            const existingType =
              match.match(/type=["']([^"']*)["']/)?.[1] || "text";

            // 다른 속성들도 보존
            const otherAttribs = match
              .replace(/name=["'][^"']*["']/, "")
              .replace(/value=["'][^"']*["']/, "")
              .replace(/style=["'][^"']*["']/, "")
              .replace(/class=["'][^"']*["']/, "")
              .replace(/type=["'][^"']*["']/, "")
              .replace(/<input/, "")
              .replace(/>/, "")
              .trim();

            // 새로운 input 태그 생성
            return `<input type="${existingType}" name="${key}" value="${value}"${
              existingClass ? ` class="${existingClass}"` : ""
            }${existingStyle ? ` style="${existingStyle}"` : ""}${
              otherAttribs ? ` ${otherAttribs}` : ""
            }>`;
          }
        );

        // checkbox 치환
        finalHtml = finalHtml.replace(
          new RegExp(
            `<input[^>]*name=["']${key}["'][^>]*type=["']checkbox["'][^>]*>`,
            "g"
          ),
          (match) => {
            const existingStyle =
              match.match(/style=["']([^"']*)["']/)?.[1] || "";
            const existingClass =
              match.match(/class=["']([^"']*)["']/)?.[1] || "";
            const checkboxValue =
              match.match(/value=["']([^"']*)["']/)?.[1] || "true";

            const otherAttribs = match
              .replace(/name=["'][^"']*["']/, "")
              .replace(/value=["'][^"']*["']/, "")
              .replace(/style=["'][^"']*["']/, "")
              .replace(/class=["'][^"']*["']/, "")
              .replace(/type=["'][^"']*["']/, "")
              .replace(/checked=["']?[^"'\s]*["']?/, "")
              .replace(/<input/, "")
              .replace(/>/, "")
              .trim();

            const isChecked = value === "true";

            return `<input type="checkbox" name="${key}" value="${checkboxValue}"${
              existingClass ? ` class="${existingClass}"` : ""
            }${existingStyle ? ` style="${existingStyle}"` : ""}${
              isChecked ? ` checked` : ""
            }${otherAttribs ? ` ${otherAttribs}` : ""}>`;
          }
        );

        // radio 치환
        finalHtml = finalHtml.replace(
          new RegExp(
            `<input[^>]*name=["']${key}["'][^>]*type=["']radio["'][^>]*>`,
            "g"
          ),
          (match) => {
            // 기존 속성들을 추출
            const existingStyle =
              match.match(/style=["']([^"']*)["']/)?.[1] || "";
            const existingClass =
              match.match(/class=["']([^"']*)["']/)?.[1] || "";
            const radioValue = match.match(/value=["']([^"']*)["']/)?.[1] || "";

            // 다른 속성들도 보존
            const otherAttribs = match
              .replace(/name=["'][^"']*["']/, "")
              .replace(/value=["'][^"']*["']/, "")
              .replace(/style=["'][^"']*["']/, "")
              .replace(/class=["'][^"']*["']/, "")
              .replace(/type=["'][^"']*["']/, "")
              .replace(/checked=["']?[^"'\s]*["']?/, "")
              .replace(/<input/, "")
              .replace(/>/, "")
              .trim();

            // radio 버튼이 선택되었는지 확인
            const isChecked = value === radioValue;

            // 새로운 radio input 태그 생성
            return `<input type="radio" name="${key}" value="${radioValue}"${
              existingClass ? ` class="${existingClass}"` : ""
            }${existingStyle ? ` style="${existingStyle}"` : ""}${
              isChecked ? ` checked` : ""
            }${otherAttribs ? ` ${otherAttribs}` : ""}>`;
          }
        );

        // textarea 치환
        finalHtml = finalHtml.replace(
          new RegExp(
            `<textarea[^>]*name=["']${key}["'][^>]*>[\\s\\S]*?<\\/textarea>`,
            "g"
          ),
          (match) => {
            const existingStyle =
              match.match(/style=["']([^"']*)["']/)?.[1] || "";
            const existingClass =
              match.match(/class=["']([^"']*)["']/)?.[1] || "";

            const otherAttribs = match
              .replace(/name=["'][^"']*["']/, "")
              .replace(/style=["'][^"']*["']/, "")
              .replace(/class=["'][^"']*["']/, "")
              .replace(/<textarea/, "")
              .replace(/>[\s\S]*?<\/textarea>/, "")
              .trim();

            return `<textarea name="${key}"${
              existingClass ? ` class="${existingClass}"` : ""
            }${
              existingStyle
                ? ` style="${existingStyle};resize:none;"`
                : ` style="resize:none;"`
            }${otherAttribs ? ` ${otherAttribs}` : ""}>${value}</textarea>`;
          }
        );

        // select 치환
        finalHtml = finalHtml.replace(
          new RegExp(
            `<select[^>]*name=["']${key}["'][^>]*>[\\s\\S]*?<\\/select>`,
            "g"
          ),
          (match) => {
            const existingStyle =
              match.match(/style=["']([^"']*)["']/)?.[1] || "";
            const existingClass =
              match.match(/class=["']([^"']*)["']/)?.[1] || "";

            const optionsSection =
              match.match(/>([\s\S]*?)<\/select>/)?.[1] || "";
            const updatedOptions = optionsSection.replace(
              /<option[^>]*value=["']([^"']*)["'][^>]*>/g,
              (optionMatch, optionValue) => {
                if (optionValue === value) {
                  return `<option value="${optionValue}" selected>`;
                }
                return `<option value="${optionValue}">`;
              }
            );

            const otherAttribs = match
              .replace(/name=["'][^"']*["']/, "")
              .replace(/value=["'][^"']*["']/, "")
              .replace(/style=["'][^"']*["']/, "")
              .replace(/class=["'][^"']*["']/, "")
              .replace(/<select/, "")
              .replace(/>[\s\S]*?<\/select>/, "")
              .trim();

            return `<select name="${key}"${
              existingClass ? ` class="${existingClass}"` : ""
            }${existingStyle ? ` style="${existingStyle}"` : ""}${
              otherAttribs ? ` ${otherAttribs}` : ""
            }>${updatedOptions}</select>`;
          }
        );
      });

      return finalHtml;
    };

    const handleSubmit = () => {
      const finalHtml = generateFinalHtml();
      console.log("Final HTML:", finalHtml);
      onSave(finalHtml);
    };

    // useImperativeHandle로 부모 컴포넌트에 메서드 노출
    useImperativeHandle(ref, () => ({
      handleSubmit,
      getFormData: () => formData,
      generateFinalHtml,
    }));

    return <div>{parsedHtml}</div>;
  }
);

DraftWriterComponent.displayName = "DraftWriterComponent";

export default DraftWriterComponent;
