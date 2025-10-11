/**
 * 3D 건물 뷰어 상수 정의
 *
 * 건물의 크기, 층 수, 색상 등 프로젝트 전반에 사용되는 상수를 정의합니다.
 */

// GLTF 모델 이름 배열
export const MODELS = ["f1", "f2", "f3", "f4", "top"];

// 모델 이름 -> 층 번호 매핑
export const MODEL_TO_FLOOR = {
  f1: 0,
  f2: 1,
  f3: 2,
  f4: 3,
  top: 4,
};

/**
 * 건물 구조 관련 상수
 */
export const FLOOR_COUNT = 5; // 총 층 수
export const FLOOR_HEIGHT = 2; // 각 층의 높이 (Y축 간격)
export const FLOOR_WIDTH = 10; // 각 층의 가로 크기 (X축)
export const FLOOR_DEPTH = 10; // 각 층의 세로 크기 (Z축)
export const FLOOR_THICKNESS = 0.3; // 각 층 바닥/천장의 두께

/**
 * 층별 색상 배열
 * 각 층을 시각적으로 구분하기 위한 고유 색상
 *
 * @type {string[]}
 */

/**
 * 카메라 설정
 */
export const CAMERA_CONFIG = {
  // 기본 카메라 위치 (전체 뷰)
  DEFAULT_POSITION: [-15, 70, 30],
  // 기본 카메라 타겟 (바라보는 지점) - FLOOR_HEIGHT(2) * 2 = 4
  DEFAULT_TARGET: [0, 8, 0],
  // 시야각 (Field of View)
  DEFAULT_FOV: 50, // 첫 화면 (아무것도 안 눌렀을 때)
  ACTIVE_FOV: 40, // 층 클릭 시 (하나의 층만 볼 때)
  // 층 선택 시 카메라 높이 오프셋
  FLOOR_VIEW_HEIGHT: 40,
  // 층 선택 시 카메라 Z축 오프셋 (약간 비스듬하게)
  FLOOR_VIEW_Z_OFFSET: 0.5,
};

/**
 * 애니메이션 설정
 */
export const ANIMATION_CONFIG = {
  // 투명도 애니메이션 설정
  OPACITY: {
    mass: 1,
    tension: 280,
    friction: 60,
  },
  // 스케일 애니메이션 설정
  SCALE: {
    tension: 300,
    friction: 30,
  },
  // 카메라 애니메이션 설정
  CAMERA: {
    mass: 1,
    tension: 80,
    friction: 40,
  },
};

/**
 * IOT 기기 타입 정의
 */
export const DEVICE_TYPES = {
  COMPUTER: {
    name: "컴퓨터",
    icon: "💻",
  },
  AIRCON: {
    name: "냉난방",
    icon: "❄️",
  },
  LIGHT: {
    name: "조명",
    icon: "💡",
  },
};

/**
 * 층별 IOT 기기 위치 데이터
 * position: [x, y, z] - 각 층 모델 내에서의 상대적 위치
 */
export const FLOOR_DEVICES = {
  f1: [
    {
      id: "f1-computer-1",
      type: "COMPUTER",
      position: [3, 0.5, 2],
      name: "1층 데스크 PC",
      status: "정상",
      specs: "Intel i5, 16GB RAM",
      lastCheck: "2025-10-01",
    },
    {
      id: "f1-aircon-1",
      type: "AIRCON",
      position: [0, 2, -3],
      name: "1층 중앙 에어컨",
      status: "가동중",
      specs: "18,000 BTU",
      temperature: "22°C",
    },
    {
      id: "f1-light-1",
      type: "LIGHT",
      position: [-3, 2.5, 0],
      name: "1층 조명 #1",
      status: "켜짐",
      brightness: "80%",
    },
  ],
  f2: [
    {
      id: "f2-computer-1",
      type: "COMPUTER",
      position: [2, 0.5, 1],
      name: "2층 업무용 PC",
      status: "정상",
      specs: "Intel i7, 32GB RAM",
      lastCheck: "2025-09-28",
    },
    {
      id: "f2-aircon-1",
      type: "AIRCON",
      position: [0, 2, -2],
      name: "2층 에어컨",
      status: "대기",
      specs: "24,000 BTU",
      temperature: "24°C",
    },
    {
      id: "f2-light-1",
      type: "LIGHT",
      position: [-2, 2.5, 2],
      name: "2층 조명 #1",
      status: "켜짐",
      brightness: "100%",
    },
  ],
  f3: [
    {
      id: "f3-computer-1",
      type: "COMPUTER",
      position: [1, 0.5, -1],
      name: "3층 개발용 PC",
      status: "정상",
      specs: "AMD Ryzen 9, 64GB RAM",
      lastCheck: "2025-10-05",
    },
    {
      id: "f3-aircon-1",
      type: "AIRCON",
      position: [-1, 2, 2],
      name: "3층 에어컨",
      status: "가동중",
      specs: "18,000 BTU",
      temperature: "20°C",
    },
    {
      id: "f3-light-1",
      type: "LIGHT",
      position: [2, 2.5, 1],
      name: "3층 조명 #1",
      status: "꺼짐",
      brightness: "0%",
    },
  ],
  f4: [
    {
      id: "f4-computer-1",
      type: "COMPUTER",
      position: [-2, 0.5, 0],
      name: "4층 회의실 PC",
      status: "점검필요",
      specs: "Intel i5, 8GB RAM",
      lastCheck: "2025-08-15",
    },
    {
      id: "f4-aircon-1",
      type: "AIRCON",
      position: [1, 2, -1],
      name: "4층 에어컨",
      status: "정상",
      specs: "24,000 BTU",
      temperature: "23°C",
    },
    {
      id: "f4-light-1",
      type: "LIGHT",
      position: [0, 2.5, 2],
      name: "4층 조명 #1",
      status: "켜짐",
      brightness: "60%",
    },
  ],
  top: [],
};
