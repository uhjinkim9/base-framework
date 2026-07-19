import Header from "@/components/common/layout/Header";
import Link from "next/link";

export default function SignupPage() {
  return (
    <>
      <Header />
      <main style={{maxWidth: 560, margin: "0 auto", padding: "170px 24px 80px"}}>
        <p style={{color: "#ff6900", fontWeight: 700}}>CREATE ACCOUNT</p>
        <h1 style={{fontSize: 42, margin: "16px 0"}}>회원가입</h1>
        <p style={{color: "#667085", lineHeight: 1.7}}>
          프로젝트의 사용자 정책에 맞는 가입 필드와 승인 절차를 이 화면에 연결하세요.
          인증 모듈의 공개 가입 API는 다음 구현 단계에서 추가할 수 있습니다.
        </p>
        <Link href="/login" style={{display: "inline-block", marginTop: 28, fontWeight: 600}}>
          이미 계정이 있다면 로그인
        </Link>
      </main>
    </>
  );
}
