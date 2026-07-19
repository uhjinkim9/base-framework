import Header from "@/components/common/layout/Header";
import Link from "next/link";
import styles from "./page.module.scss";

export default function HomePage() {
  return (
    <>
      <Header />
      <main className={styles.page}>
        <section className={styles.hero}>
          <p className={styles.eyebrow}>MONOLITHIC STARTER</p>
          <h1>Build your next project from a practical foundation.</h1>
          <p className={styles.description}>
            Authentication, PostgreSQL, modular NestJS APIs, React Query, and a
            reusable frontend structure are ready for your product.
          </p>
          <div className={styles.actions}>
            <Link className={styles.primaryAction} href="/signup">
              Get started
            </Link>
            <Link className={styles.secondaryAction} href="/login">
              Sign in
            </Link>
          </div>
        </section>

        <section className={styles.features} aria-label="Template features">
          <article>
            <span>01</span>
            <h2>Modular backend</h2>
            <p>Keep auth, menus, schedules, files, and boards in one deployable API.</p>
          </article>
          <article>
            <span>02</span>
            <h2>Modern data flow</h2>
            <p>Use PostgreSQL on the server and React Query in the client.</p>
          </article>
          <article>
            <span>03</span>
            <h2>Ready to customize</h2>
            <p>Replace the neutral branding and starter pages with your product.</p>
          </article>
        </section>
      </main>
    </>
  );
}
