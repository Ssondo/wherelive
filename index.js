import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import axios from 'axios';

const app = express();
const PORT = process.env.PORT || 3000;

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
app.post('/recommend', async (req, res) => {
  try {
    const { location1, location2, weight1, weight2 } = req.body;
    console.log('추천 요청:', { location1, location2, weight1, weight2 });
    
    // 추천 로직 실행
    const recommendations = await recommendRegions({ location1, location2, weight1, weight2 });
    
    // 응답 포맷에 맞게 변환
    const formattedResults = recommendations.map((rec, index) => ({
      name: rec.region,
      averageTime: Math.round(rec.score),
      score: Math.max(0, 100 - Math.round(rec.score * 1.5)), // 점수 변환 (이동시간이 짧을수록 높은 점수)
      transport: getTransportInfo(rec.region),
      summary: getRegionSummary(rec.region)
    }));
    
    res.json({ success: true, recommendations: formattedResults });
  } catch (error) {
    console.error('추천 API 에러:', error);
    res.status(500).json({ success: false, error: '추천 처리 중 오류가 발생했습니다.' });
  }
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

// 지역별 교통 정보
function getTransportInfo(region) {
  const transportMap = {
    '강남': '지하철 2호선, 신분당선',
    '송파': '지하철 2호선, 8호선',
    '분당': '분당선, 신분당선',
    '여의도': '지하철 5호선, 9호선',
    '마포': '지하철 2호선, 6호선',
    '노원': '지하철 1호선, 4호선',
    '용산': '지하철 1호선, 4호선'
  };
  return transportMap[region] || '다양한 교통편';
}

// 지역별 요약 정보
function getRegionSummary(region) {
  const summaryMap = {
    '강남': '강남은 서울 주요 업무지구와의 접근성이 뛰어나며, 다양한 교통편이 발달해 있습니다.',
    '송파': '송파는 교통이 편리하고, 다양한 생활 인프라가 잘 갖추어진 지역입니다.',
    '분당': '분당은 쾌적한 주거 환경과 서울 접근성이 모두 우수한 신도시입니다.',
    '여의도': '여의도는 서울의 금융 중심지로 교통이 매우 편리한 지역입니다.',
    '마포': '마포는 젊은 문화가 살아있는 지역으로 교통도 편리합니다.',
    '노원': '노원은 서울 북부의 주요 거주지로 교통이 편리한 지역입니다.',
    '용산': '용산은 서울 중심부에 위치하여 접근성이 좋은 지역입니다.'
  };
  return summaryMap[region] || '교통이 편리하고 생활하기 좋은 지역입니다.';
}

app.listen(PORT, () => {
  console.log(`서버가 포트 ${PORT}에서 실행 중입니다.`);
  console.log(`환경: ${process.env.NODE_ENV || 'development'}`);
}); 