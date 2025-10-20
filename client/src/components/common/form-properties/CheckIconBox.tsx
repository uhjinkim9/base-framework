"use client";
import styles from "./styles/CheckBox.module.scss";
import IconNode from "@/components/common/segment/IconNode";

type Props = {
  name?: string;
  value?: boolean; // boolean
  checkValue?: any; // checkBox를 선택하면 가질 값
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  componentType?: "star" | "exclamation";
  children?: React.ReactNode;
  readOnly?: boolean;
  size?: number;
};

const CheckIconBox = ({
  name,
  value,
  checkValue,
  onChange,
  componentType = "star",
  children,
  readOnly = false,
  size = 26,
}: Props) => {
  // 아이콘 타입별 맵(확장 시 여기에 추가)
  const iconMap = {
    star: "star",
    exclamation: "circleExclamation",
    goBookmarkFill: "goBookmarkFill",
    goBookmark: "goBookmark",
    fiCopy: "fiCopy",
    fiDelete: "fiDelete",
    fiEdit: "fiEdit",
    fiPrinter: "fiPrinter",
  } as const;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) {
      const fakeEvent = {
        ...e,
        target: {
          ...e.target,
          name: name ?? "",
          checkValue: checkValue,
          value: e.target.checked,
          type: "checkbox",
        },
      };
      onChange(fakeEvent as unknown as React.ChangeEvent<HTMLInputElement>);
    }
  };

  return (
    <label className={`${styles.checkbox} ${styles[componentType]}`}>
      <input
        type="checkbox"
        name={name}
        checked={value}
        value={checkValue}
        onChange={handleChange}
        className={styles.input}
        disabled={readOnly}
      />
      <span className={styles.iconCheckmark}>
        <IconNode
          iconName={iconMap[componentType]}
          color={value ? "orange" : "gray4"}
          filled={value}
          size={size}
          cursorPointer={true}
        />
      </span>
      {children && <span className={styles.label}>{children}</span>}
    </label>
  );
};

export default CheckIconBox;
