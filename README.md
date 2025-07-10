# WhereLive - 거주지 추천 서비스

사용자가 입력한 출근지와 자주 가는 장소를 기반으로 교통 편의성이 높은 거주지를 추천하는 서비스입니다.

## 기술 스택

- **Backend**: Node.js, Express
- **Frontend**: React (예정)
- **API**: 교통 정보 API (카카오 모빌리티 API 예정)

## 주요 기능

- 사용자 입력 장소 기반 거주지 추천
- 교통 편의성 점수 계산
- 가중치 기반 추천 알고리즘

## 설치 및 실행

```bash
# 의존성 설치
npm install

# 개발 서버 실행
node index.js
```

서버는 http://localhost:3000 에서 실행됩니다.

## API 엔드포인트

- `GET /` - 메인 페이지
- `GET /health` - 서버 상태 확인
- `POST /recommend` - 거주지 추천 API

### 추천 API 요청 예시

```json
{
  "location1": "강남역",
  "location2": "홍대입구역",
  "weight1": 0.7,
  "weight2": 0.3
}
```

## 개발 환경

- Node.js v24.4.0
- Express
- ES6 모듈 사용 