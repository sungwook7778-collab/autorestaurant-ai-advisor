// 파일: autorestaurant-ai-advisor_v1/constants.ts

// -------------------------------
//  EQUIPMENT DEFINITIONS
// -------------------------------

export interface EquipmentDef {
   category: string;
   maker: string;
   model: string;
   price_one_time: number; // Unit: Man-won
   price_rental: number;   // Unit: Man-won/month
 }
 
 export const AVAILABLE_EQUIPMENT: EquipmentDef[] = [
   // 서빙로봇
   { category: '서빙로봇', maker: '푸두봇', model: '푸두봇', price_one_time: 1600, price_rental: 30 },
   { category: '서빙로봇', maker: '베어로보틱스', model: '서비(Servi)', price_one_time: 2200, price_rental: 45 },
   { category: '서빙로봇', maker: '로보와이드', model: '서브봇 S1', price_one_time: 1300, price_rental: 19 },
 
   // 테이블오더
   { category: '테이블오더', maker: 'KT', model: 'KT오더', price_one_time: 200, price_rental: 3 },
   { category: '테이블오더', maker: '페이히어', model: '페이히어오더', price_one_time: 160, price_rental: 2 },
 
   // 키오스크
   { category: '키오스크', maker: '아임유', model: 'KIOSK T-series', price_one_time: 200, price_rental: 2.5 },
   { category: '키오스크', maker: '삼성전자', model: 'KM24A 키오스크', price_one_time: 230, price_rental: 2.7 },
 
   // 자동후라이어
   { category: '자동후라이어', maker: '경일주방', model: '경일 후라이어 - 대형', price_one_time: 16000, price_rental: 399 },
   { category: '자동후라이어', maker: '경일주방', model: '경일 후라이어 - 소형', price_one_time: 2000, price_rental: 50 },
 
   // 자동볶음기
   { category: '자동볶음기', maker: '경일주방', model: '경일 자동볶음기 - 소형', price_one_time: 2000, price_rental: 50 },
   { category: '자동볶음기', maker: '경일주방', model: '경일 자동볶음기 - 중형', price_one_time: 4000, price_rental: 100 },
 
   // 청소로봇
   { category: '청소로봇', maker: '가우시움', model: '가우시움 (청소봇)', price_one_time: 2000, price_rental: 50 },
   { category: '청소로봇', maker: '클린테크', model: '클린테크 (청소봇)', price_one_time: 3000, price_rental: 60 },
   { category: '청소로봇', maker: '푸두청소봇', model: '푸두청소봇 (청소봇)', price_one_time: 1500, price_rental: 40 },
 
   // 맥주자동디스펜서
   { category: '맥주자동디스펜서', maker: '히오자키', model: '맥주자동디스펜서 4구', price_one_time: 1400, price_rental: 35 },
 
   // 초음파세척기
   { category: '초음파세척기', maker: '경일주방', model: '초음파세척 모듈형', price_one_time: 1500, price_rental: 38 },
   { category: '초음파세척기', maker: '경일주방', model: '초음파세척 중형', price_one_time: 3200, price_rental: 180 },
 
   // 커피 자동화로봇
   { category: '커피 자동화로봇', maker: 'Teatime', model: 'Teatime-1', price_one_time: 3500, price_rental: 85 },
 ];
 
 // -------------------------------
 //  PRICE TABLE HELPER
 // -------------------------------
 
 export const generatePriceListString = () => {
   let str = `| 장비군 | Maker | 모델 | 일시불 가격(만원) | Rental(36개월, 월 만원) |\n|---|---|---|---|---|\n`;
   AVAILABLE_EQUIPMENT.forEach(eq => {
     str += `| ${eq.category} | ${eq.maker} | ${eq.model} | ${eq.price_one_time.toLocaleString()} | ${eq.price_rental} |\n`;
   });
   return str;
 };
 
 // -------------------------------
 //  LABOR SAVING DATA
 // -------------------------------
 
 export const LABOR_SAVING_ESTIMATES: Record<
   string,
   { amount: number; type: 'FT' | 'PT' }
 > = {
   '서빙로봇': { amount: 0.4, type: 'PT' }, 
   '테이블오더': { amount: 0.2, type: 'PT' }, 
   '키오스크': { amount: 0.3, type: 'PT' },
   '자동후라이어': { amount: 0.5, type: 'FT' }, 
   '자동볶음기': { amount: 0.4, type: 'FT' }, 
   '청소로봇': { amount: 0.3, type: 'PT' },
   '초음파세척기': { amount: 0.3, type: 'PT' },
   '맥주자동디스펜서': { amount: 0.4, type: 'PT' },
   '커피 자동화로봇': { amount: 0.5, type: 'PT' },
 };
 
 // -------------------------------
 //  STORE CATEGORY LIST
 // -------------------------------
 
 export const STORE_CATEGORIES = [
   '맥주집', 'BAR', '뷔페', '치킨', '족발', '보쌈', '샐러드', '간식',
   '한식', '분식', '돈까스', '탕요리', '구이', '피자', '중식', '일식',
   '회', '양식', '커피 및 디저트', '아시안', '샌드위치 및 버거', '멕시칸',
   '도시락', '죽', '기타'
 ];
 
 // -------------------------------
 //  SYSTEM PROMPTS (필수)
 // -------------------------------
 
 // 1) 환경 분석 프롬프트
 export const ENVIRONMENT_PROMPT = `
 You are an AI assistant that analyzes restaurant environment photos.
 Your tasks:
 - Understand the layout: hall, tables, kitchen, cooking equipment.
 - Detect fryers, woks, grills, POS, ordering tablets, kiosks, robots.
 - Estimate table count, kitchen context, and store style.
 - Output ONLY valid JSON following the required schema.
 - Never include explanations outside JSON.
 `;
 
 // 2) 자동화 계획 + ROI 생성 프롬프트
 export const PLANNING_PROMPT = `
 You are an AI restaurant automation consultant.
 
 Using:
 - Confirmed store data
 - Detected equipment from images
 
 Generate:
 1) A realistic automation plan (robots, kiosks, fryers, etc.)
 2) Estimated labor savings
 3) Full ROI report (monthly savings, payback period, recommended devices)
 
 Strict rules:
 - Output ONLY valid JSON, matching the schema
 - No additional free text outside JSON
 `;