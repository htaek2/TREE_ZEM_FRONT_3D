import { Canvas } from "@react-three/fiber";
import { Suspense, useState } from "react";
import styled, { keyframes } from "styled-components";
import CameraController from "../three/CameraController";
import Model from "../three/Model";
import { CAMERA_CONFIG, MODELS } from "../constants";
import { OrbitControls } from "@react-three/drei";

const getResponsiveCameraSettings = () => {
  const width = window.innerWidth;

  // 모바일 (768px 미만)
  if (width < 768) {
    return {
      defaultPosition: [-50, 30, 20],
      activePosition: [30, 8, 0],
      defaultFov: 50,
      activeFov: 60,
      minDistance: 30,
      maxDistance: 60,
      target: [13, 8, -8],
    };
  }
  // 태블릿 및 데스크톱 (768px 이상) - 태블릿 설정 적용
  else {
    return {
      defaultPosition: [-65, 22, 15],
      activePosition: [-15, 80, 30],
      defaultFov: 60,
      activeFov: 80,
      minDistance: 35,
      maxDistance: 75,
      target: [45, 0, 0],
    };
  }
};

function Login({ onLoginSuccess }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isFadeOut, setIsFadeOut] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [active, setActive] = useState({ active: false, model: null });
  const modelsToShow = active.active ? [active.model] : MODELS;
  const [cameraSettings, setCameraSettings] = useState(
    getResponsiveCameraSettings()
  );
  const [LoginText, setLoginText] = useState("");
  const [LoginTextSize, setLoginTextSize] = useState(24);

  const AnimationTriggerOn = () => {
    setIsFadeOut(true);
  };

  const validateForm = () => {
    // username 검증
    // if (!username || username.trim().length === 0) {
    //   setErrorMessage("사용자명을 입력해주세요.");
    //   return false;
    // }

    // if (username.trim().length < 3) {
    //   setErrorMessage("사용자명은 최소 3자 이상이어야 합니다.");
    //   return false;
    // }

    // // password 검증
    // if (!password || password.length === 0) {
    //   setErrorMessage("비밀번호를 입력해주세요.");
    //   return false;
    // }

    // if (password.length < 6) {
    //   setErrorMessage("비밀번호는 최소 6자 이상이어야 합니다.");
    //   return false;
    // }

    return true;
  };

  const handleSubmit = async (e, autoMode = false) => {
    e?.preventDefault();

    console.log("로그인 시도:", { username, password });

    if (!validateForm()) {
      return;
    }

    // 로딩 상태 시작
    setLoading(true);
    setLoginTextSize(24);
    setLoginText("로그인 중 입니다...");

    try {
      // const response = await fetch("/dummy_login/users.json");

      // if (!response.ok) {
      //   throw new Error("사용자 데이터를 불러올 수 없습니다.");
      // }

      // const data = await response.json();

      // console.log("사용자 데이터 로드 완료 :", data);

      // const user = data.users.find(
      //   (u) => u.username === username && u.password === password
      // );

      // if (!user) {
      //   console.error("❌ 로그인 실패: 사용자 없음 또는 비밀번호 불일치");
      //   throw new Error("아이디 또는 비밀번호가 올바르지 않습니다.");
      // }

      // // Mock JWT 토큰 생성
      // const timestamp = new Date().getTime();
      // const accessToken = `mock-jwt-token-${username}-${timestamp}`;

      // const userWithToken = {
      //   id: user.id,
      //   username: user.username,
      //   email: user.email,
      //   accessToken: accessToken,
      // };

      // // localStorage에 사용자 정보 저장
      // localStorage.setItem("user", JSON.stringify(userWithToken));
      // console.log(
      //   "[AUTH] 로그인 성공:",
      //   userWithToken.username,
      //   "| Roles:",
      //   userWithToken.roles
      // );

      // document.getElementById('loginForm').addEventListener('submit', function(event) {

      let email = username;
      let userPassword = password;
      let userName = username;

      if (autoMode) {
        email = "ad";
        userPassword = "123";
        userName = "ad";
      }

      const credentials = {
        email: email,
        password: userPassword,
      };

      fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      })
        .then((response) => {
          if (response.ok) {
            const token = response.headers.get("Authorization");
            if (token) {
              localStorage.setItem("authToken", token);

              // 사용자 정보 생성
              const userWithToken = {
                username: userName,
                email: email,
                accessToken: token,
              };
              localStorage.setItem("user", JSON.stringify(userWithToken));

              setTimeout(() => {
                setLoginText("로그인 성공!");
              }, 1000);

              setTimeout(() => {
                setLoading(false);
                AnimationTriggerOn();
              }, 2000);

              setTimeout(() => {
                onLoginSuccess(userWithToken);
              }, 3000);
            } else {
              setLoginText("로그인에 성공했지만 토큰을 받지 못했습니다.");
              setLoginTextSize(12);
              setTimeout(() => {
                setLoading(false);
              }, 3000);
            }
          } else {
            setLoginText(
              "로그인 실패: 이메일 또는 비밀번호가 올바르지 않습니다."
            );
            setLoginTextSize(12);

            setTimeout(() => {
              setLoading(false);
            }, 3000);
          }
        })
        .catch((error) => {
          console.error("Error during login:", error);
          setLoginText("로그인 중 오류가 발생했습니다.");
          setLoading(false);
        });
    } catch (error) {
      console.error("Error during login:", error);
      setLoginText("로그인 중 오류가 발생했습니다.");
      setLoading(false);
    }
  };

  return (
    <Container>
      <Overlay $isFadeOut={isFadeOut} />

      {loading ? (
        <LoadingContainer>
          <LoadingIcon src="/Icon/loading_icon.gif" alt="Loading..." />
          <LodingText $LoginTextSize={LoginTextSize}>{LoginText}</LodingText>
        </LoadingContainer>
      ) : (
        <LoginForm onSubmit={handleSubmit} $isFadeOut={isFadeOut}>
          <Title>ZEM</Title>
          <InputGroup>
            <Input
              type="text"
              placeholder="ID"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <Input
              type="password"
              placeholder="PW"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button type="submit">Login</Button>
            <Button onClick={() => handleSubmit(null, true)}>자동로그인</Button>
          </InputGroup>
          {errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}
        </LoginForm>
      )}
    </Container>
  );
}
export default Login;

const Container = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: #bfbfc6;
  touch-action: none;
  z-index: ${(props) => (props.$isFadeOut === true ? 0 : 20)};
`;

const fadeOut = keyframes`
  0% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
`;

const Overlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 5;
  pointer-events: none;
  animation: ${(props) => (props.$isFadeOut === true ? fadeOut : "none")} 3s
    ease-in-out forwards;
`;

const LoginForm = styled.form`
  position: absolute;
  top: 50%;
  left: 70%;
  transform: translate(-50%, -50%);
  display: ${(props) => (props.$isFadeOut === true ? "none" : "flex")};
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 15px;
  background-color: rgba(30, 31, 34, 0.9);
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  width: 340px;
  height: 300px;
  backdrop-filter: blur(10px);
  color: white;
  font-size: 16px;
  z-index: 10;
  pointer-events: auto;

  @media only screen and (max-width: 768px) {
    left: 50%;
  }
`;

/**
 * 입력 필드
 * 텍스트, 비밀번호 등의 입력을 위한 input 스타일
 */
const InputGroup = styled.div`
  width: 168px;
  font-size: 14px;
  display: flex;
  flex-direction: column;

  & > *:nth-child(1) {
    margin-bottom: 14px;
  }

  & > *:nth-child(2) {
    margin-bottom: 26px;
  }
`;

const Input = styled.input`
  width: 100%;
  height: 27px;
  transition: border-color 0.3s ease;

  &:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
  }

  &::placeholder {
    font-weight: 700;
    color: #040b12;
    padding: 4px;
  }
`;

const Button = styled.button`
  width: 100%;
  height: 33px;
  background-color: #00aa6f;
  color: #fafafa;
`;

const Title = styled.h1`
  font-size: 50px;
  color: #fafafa;
  font-weight: 800;
  margin-bottom: 10px;
`;

export const ErrorMessage = styled.div`
  color: #ffffffff;
  background-color: #ff0000;
  padding: 10px;
  border-radius: 4px;
  margin-top: 10px;
  font-size: 12px;
`;

const LoadingContainer = styled.div`
  position: absolute;
  top: 50%;
  left: 70%;
  transform: translate(-50%, -50%);
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(30, 31, 34, 0.9);
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  width: 340px;
  height: 300px;
  backdrop-filter: blur(10px);
  z-index: 10;
  flex-direction: column;
  @media only screen and (max-width: 768px) {
    left: 50%;
  }
`;

const LoadingIcon = styled.img`
  width: 100px;
  height: 100px;
`;

const LodingText = styled.h2`
  font-size: ${(props) => props.$LoginTextSize}px;
  color: white;
  margin-top: 10px;
  font-weight: 800;
  white-space: nowrap;
`;
