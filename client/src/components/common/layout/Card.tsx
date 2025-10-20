"use client";

import styles from "./styles/Card.module.scss";

interface CardProps {
  children: React.ReactNode;
}

export default function Card({ children }: CardProps) {
  return (
    <div className={styles.card}>
      <div className={styles.cardMain}> {children}</div>
    </div>
  );
}
