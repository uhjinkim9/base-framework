"use client";
import clsx from "clsx";
import styles from "./styles/ContentCard.module.scss";

interface ContentCardProps {
  children: React.ReactNode;
  fullHeight?: boolean;
  noPadding?: boolean;
}

export default function ContentCard({
  children,
  fullHeight = true,
  noPadding = false,
}: ContentCardProps) {
  return (
    <div
      className={clsx(
        styles.card,
        fullHeight ? styles.fullHeight : "",
        noPadding ? styles.noPadding : "",
      )}
    >
      {children}
    </div>
  );
}
