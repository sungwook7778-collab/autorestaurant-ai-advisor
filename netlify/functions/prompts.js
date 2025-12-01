// netlify/functions/prompts.js

// --- 로봇/장비 가격표 구성 (constants.ts 기반 복사본) ---

const AVAILABLE_EQUIPMENT = [
  { category: "서빙로봇", maker: "푸두봇", model: "푸두봇", price_one_time: 1600, price_rental: 30 },
  { category: "서빙로봇", maker: "베어로보틱스", model: "서비(Servi)", price_one_time: 2200, price_rental: 45 },
  { category: "서빙로봇", maker: "로보와이드", model: "서브봇 S1", price_one_time: 1300, price_rental: 19 },

  { category: "테이블오더", maker: "KT", model: "KT오더", price_one_time: 200, price_rental: 3 },
  { category: "테이블오더", maker: "페이히어", model: "페이히어오더", price_one_time: 160, price_rental: 2 },

  { category: "키오스크", maker: "아임유", model: "KIOSK T-series", price_one_time: 200, price_rental: 2.5 },
  { category: "키오스크", maker: "삼성전자", model: "KM24A 키오스크", price_one_time: 230, price_rental: 2.7 },

  { category: "자동후라이어", maker: "경일주방", model: "경일 후라이어 - 대형", price_one_time: 16000, price_rental: 399 },
  { category: "자동후라이어", maker: "경일주방", model: "경일 후라이어 - 소형", price_one_time: 2000, price_rental: 50 },

  { category: "자동볶음기", maker: "경일주방", model: "경일 자동볶음기 - 소형", price_one_time: 2000, price_rental: 50 },
  { category: "자동볶음기", maker: "경일주방", model: "경일 자동볶음기 - 중형", price_one_time: 4000, price_rental: 100 },

  { category: "청소로봇", maker: "가우시움", model: "가우시움 (청소봇)", price_one_time: 2000, price_rental: 50 },
  { category: "청소로봇", maker: "클린테크", model: "클린테크 (청소봇)", price_one_time: 3000, price_rental: 60 },
  { category: "청소로봇", maker: "푸두청소봇", model: "푸두청소봇 (청소봇)", price_one_time: 1500, price_rental: 40 },

  { category: "맥주자동디스펜서", maker: "히오자키", model: "맥주자동디스펜서 4구", price_one_time: 1400, price_rental: 35 },

  { category: "초음파세척기", maker: "경일주방", model: "초음파세척 모듈형", price_one_time: 1500, price_rental: 38 },
  { category: "초음파세척기", maker: "경일주방", model: "초음파세척 중형", price_one_time: 3200, price_rental: 180 },

  { category: "커피 자동화로봇", maker: "Teatime", model: "Teatime-1", price_one_time: 3500, price_rental: 85 },
];

const generatePriceListString = () => {
  let str = `| 장비군 | Maker | 모델 | 일시불 가격(만원) | Rental(36개월, 월 만원) |\n|---|---|---|---|---|\n`;
  AVAILABLE_EQUIPMENT.forEach(eq => {
    str += `| ${eq.category} | ${eq.maker} | ${eq.model} | ${eq.price_one_time.toLocaleString()} | ${eq.price_rental} |\n`;
  });
  return str;
};

const EQUIPMENT_PRICE_LIST = generatePriceListString();


// --- 프롬프트 묶음 ---

exports.ENVIRONMENT_PROMPT = `
당신은 매장 환경 분석 전문가입니다.
제공된 이미지를 기반으로 업종, 규모, 테이블 수, 좌석 구조, 주방 형태 등을 정밀 분석하십시오.
결과는 JSON 형식으로 출력하십시오.
`;

exports.PLANNING_PROMPT = `
당신은 외식업 운영 효율화 및 ROI 분석 전문 AI 어드바이저입니다.
사용자가 입력한 Confirmed Data(고정비/인건비/매출/이미지 데이터)를 기반으로
최적의 로봇·자동화 장비 포트폴리오를 구성하여 ROI 분석 결과를 제공하십시오.

[장비 및 가격표]
${EQUIPMENT_PRICE_LIST}

JSON 형태로만 응답하십시오.
`;