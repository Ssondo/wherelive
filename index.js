import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import axios from 'axios';

const app = express();
const PORT = 3000;

// 미들웨어 설정
app.use(cors());
app.use(bodyParser.json());

// 기본 라우팅
app.get('/', (req, res) => {
  res.send('웰컴! 거주지 추천 서비스 백엔드입니다.');
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// /recommend POST API
app.post('/recommend', (req, res) => {
  const { location1, location2, weight1, weight2 } = req.body;
  console.log('추천 요청:', { location1, location2, weight1, weight2 });
  // TODO: 추천 로직 구현 예정
  res.json({ success: true });
});

// mock 지역 데이터
const REGION_LIST = ['강남', '송파', '분당', '여의도', '마포', '노원', '용산'];

// mock 이동 시간(분) 생성 함수
function mockTravelTime(region, location) {
  // 단순히 지역명+장소명 조합으로 seed를 만들어 일관된 mock 값 생성
  let hash = 0;
  const str = region + location;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  // 15~60분 사이 값
  return 15 + Math.abs(hash) % 46;
}

// 추천 로직 함수
export async function recommendRegions({ location1, location2, weight1, weight2 }) {
  const results = REGION_LIST.map(region => {
    const time1 = mockTravelTime(region, location1);
    const time2 = location2 ? mockTravelTime(region, location2) : 0;
    const w1 = weight1 ?? 0.5;
    const w2 = location2 ? (weight2 ?? 0.5) : 0;
    // location2가 없으면 w2=0, w1=1로 처리
    const normW1 = location2 ? w1 / (w1 + w2) : 1;
    const normW2 = location2 ? w2 / (w1 + w2) : 0;
    const score = time1 * normW1 + time2 * normW2;
    return { region, score };
  });
  // 점수 오름차순(이동시간이 적을수록 추천)
  results.sort((a, b) => a.score - b.score);
  return results.slice(0, 3);
}

// 출발지~도착지 이동 시간(분) 반환 목업 함수
export async function getRoute(start, end) {
  // 실제로는 axios로 외부 API 호출 예정
  // 현재는 15~60분 사이 무작위 값 반환
  const randomMinutes = Math.floor(Math.random() * (60 - 15 + 1)) + 15;
  return {
    start,
    end,
    duration: randomMinutes // 분 단위
  };
}

app.listen(PORT, () => {
  console.log(`서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
}); 