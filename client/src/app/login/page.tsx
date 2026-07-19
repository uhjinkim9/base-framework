"use client";
import styles from "./page-login.module.scss";
import AlertService from "@/services/alert.service";
import Input from "@/components/common/form-properties/Input";
import Button from "@/components/common/form-properties/Button";
import CheckBox from "@/components/common/form-properties/CheckBox";
import HeaderText from "@/components/common/layout/HeaderText";

import {useState, ChangeEvent, useEffect} from "react";
import {useRouter} from "next/navigation";
import {isEmpty, isNotEmpty} from "@/util/validators/check-empty";
import {generateUUID} from "@/util/helpers/random-generator";
import {requestPost} from "@/util/api/api-service";
import {LocalStorage} from "@/util/common/storage";
import {useMutation} from "@tanstack/react-query";

type LoginInfoInterface = {
  userId: string;
  userPw: string;
  rememberId: boolean;
  deviceId: string;
};

export default function Login() {
  const router = useRouter();
  const [loginInfo, setLoginInfo] = useState<LoginInfoInterface>({
    userId: "",
    userPw: "",
    deviceId: "",
    rememberId: false,
  });

  const loginMutation = useMutation({
    mutationFn: () => requestPost("/auth/doLogin", loginInfo),
    onSuccess: (res) => {
      if (res.statusCode !== 200) {
        AlertService.error(res.message || "로그인에 실패했습니다.");
        return;
      }

      AlertService.success(res.message);
      loginCallback(res.data.accessToken, res.data.existingUser.userNm);
    },
    onError: () => AlertService.error("로그인 중 오류가 발생했습니다."),
  });

  async function submitLogin() {
    if (isEmpty(loginInfo.userId)) {
      AlertService.warn("아이디를 입력해주세요.");
      return;
    }
    if (isEmpty(loginInfo.userPw)) {
      AlertService.warn("비밀번호를 입력해주세요.");
      return;
    }
    loginMutation.mutate();
  }

  function activeEnter(e: KeyboardEvent) {
    if (e.key === "Enter") {
      submitLogin();
    }
  }

  function loginCallback(accessToken: string, userNm: string) {
    localStorage.setItem("userId", loginInfo.userId);
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("userNm", userNm);

    router.push("/dashboard");
  }

  function onChangeLogin(e: ChangeEvent<HTMLInputElement>): void {
    const {name, value, checked} = e.target;
    if (name === "rememberId") {
      localStorage.setItem("rememberId", checked ? "true" : "false");
    }
    setLoginInfo((p) => ({
      ...p,
      [name]: name === "rememberId" ? checked : value,
    }));
  }

  async function isLoginedUser() {
    const userId = LocalStorage.getUserId();
    const deviceId = LocalStorage.getDeviceId();
    const acToken = LocalStorage.getAccessToken();
    if (userId && deviceId && acToken) {
      try {
        const verified = await requestPost("/auth/verifyToken", {
          userId: userId,
          deviceId: deviceId,
        });
        if (verified) router.push("/dashboard");
      } catch (err) {
        console.log("Token verification failed:", err);
      }
    }
  }

  useEffect(() => {
    let isMounted = true;

    isLoginedUser();

    // 기기 구분 식별자
    let deviceId = localStorage.getItem("deviceId");
    if (!deviceId) {
      deviceId = generateUUID();
      localStorage.setItem("deviceId", deviceId);
    }

    if (isMounted) {
      setLoginInfo((prev) => ({
        ...prev,
        deviceId: deviceId ?? "",
      }));
    }

    // 아이디 기억 여부
    const isRemembered = localStorage.getItem("rememberId");
    if (isRemembered === "true") {
      const savedId = LocalStorage.getUserId();
      if (isNotEmpty(savedId) && isMounted) {
        setLoginInfo((prev) => ({
          ...prev,
          userId: savedId || "",
          rememberId: true,
        }));
      }
    }

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <>
      <div className={styles.page}>
        <main className={styles.main}>
          <div className={styles.title}>
            <h2 className={styles.welcome}>Welcome back</h2>
            <hr className={styles.line}></hr>
          </div>
          <HeaderText />

          <Input
            type="text"
              label="User ID"
            name="userId"
            value={loginInfo.userId}
            componentType="underlined"
            onChange={onChangeLogin}
            allowNegative
          />
          <Input
            type="password"
              label="Password"
            name="userPw"
            value={loginInfo.userPw}
            componentType="underlined"
            onChange={onChangeLogin}
            onKeyDown={(e: KeyboardEvent) => activeEnter(e)}
            allowNegative
          />

          <div className={styles.subsidiary}>
            <CheckBox
              name="rememberId"
              value={loginInfo.rememberId}
              componentType="orange"
              onChange={onChangeLogin}
            >
              Remember me
            </CheckBox>
            <Button name="findPw" componentType="text">
              Reset password
            </Button>
          </div>

          <div className={styles["login-button"]}>
            <Button
              name="login"
              componentType="primaryFirst"
              onClick={submitLogin}
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? "로그인 중..." : "로그인"}
            </Button>
          </div>
        </main>
      </div>
    </>
  );
}
