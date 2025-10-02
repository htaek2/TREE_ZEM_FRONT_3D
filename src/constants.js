/**
 * 3D 건물 뷰어 상수 정의
 *
 * 건물의 크기, 층 수, 색상 등 프로젝트 전반에 사용되는 상수를 정의합니다.
 */

/**
 * 건물 구조 관련 상수
 */
export const FLOOR_COUNT = 5          // 총 층 수
export const FLOOR_HEIGHT = 2         // 각 층의 높이 (Y축 간격)
export const FLOOR_WIDTH = 10         // 각 층의 가로 크기 (X축)
export const FLOOR_DEPTH = 10         // 각 층의 세로 크기 (Z축)
export const FLOOR_THICKNESS = 0.3    // 각 층 바닥/천장의 두께

/**
 * 층별 색상 배열
 * 각 층을 시각적으로 구분하기 위한 고유 색상
 *
 * @type {string[]}
 */
export const FLOOR_COLORS = [
  '#FF6B6B', // 1층 - 빨강 계열
  '#4ECDC4', // 2층 - 청록 계열
  '#45B7D1', // 3층 - 파랑 계열
  '#FFA07A', // 4층 - 연어색 계열
  '#98D8C8', // 5층 - 민트 계열
]

/**
 * 카메라 설정
 */
export const CAMERA_CONFIG = {
  // 기본 카메라 위치 (전체 뷰)
  DEFAULT_POSITION: [20, 10, 0],
  // 기본 카메라 타겟 (바라보는 지점) - FLOOR_HEIGHT(2) * 2 = 4
  DEFAULT_TARGET: [1, 2, 1],
  // 시야각 (Field of View)
  FOV: 50,
  // 층 선택 시 카메라 높이 오프셋
  FLOOR_VIEW_HEIGHT: 15,
  // 층 선택 시 카메라 Z축 오프셋 (약간 비스듬하게)
  FLOOR_VIEW_Z_OFFSET: 0.5,
}

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
}

/**
 * 투명도 값
 */
export const OPACITY = {
  SELECTED: 1,        // 선택된 층
  UNSELECTED: 0.1,    // 선택되지 않은 층
  WALL: 0.7,          // 외벽
}

/**
 * UI 관련 상수
 */
export const UI_CONFIG = {
  OUTLINE_COLOR: '#FFD700',     // 선택된 층 외곽선 색상 (금색)
  OUTLINE_OPACITY: 0.8,         // 외곽선 투명도
  OUTLINE_OFFSET: 0.2,          // 외곽선 크기 오프셋
}
