// 파일: autorestaurant-ai-advisor_v1/services/geminiService.ts

import { AnalysisResult, InitialAnalysisResult, ConfirmedStoreData } from "../types";
import { ENVIRONMENT_PROMPT, PLANNING_PROMPT } from "../constants";   // ★ 필수 import 추가

// Netlify 함수 엔드포인트
const API_FUNCTION_URL = '/.netlify/functions/generate';

/**
 * File → Base64 (Netlify 서버리스 함수에서 사용 가능 형태)
 */
const fileToBase64Part = async (file: File) => {
    const base64EncodedData = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve((reader.result as string).split(',')[1]); 
        reader.readAsDataURL(file);
    });

    return {
        data: base64EncodedData,
        mimeType: file.type,
    };
};

/**
 * Netlify serverless function 호출 공통 함수
 */
const callGeminiFunction = async (
    images: File[],
    prompt: string,
    config: any
): Promise<any> => {

    // 이미지 Base64 변환
    const imageParts = await Promise.all(images.map(fileToBase64Part));

    const response = await fetch(API_FUNCTION_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            prompt,
            images: imageParts,
            config,
        }),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Netlify Function Error:", errorData);
        throw new Error(
            `API Function failed (status ${response.status}): ${errorData.message || "Unknown error"}`
        );
    }

    const data = await response.json();

    if (!data.result) {
        throw new Error("Function returned an empty result.");
    }

    return JSON.parse(data.result);
};

/**
 * 🟦 1단계: 환경 분석 (Environment Analysis)
 */
export const analyzeEnvironment = async (
    images: File[]
): Promise<InitialAnalysisResult> => {
    
    // 서버리스 함수에 전달할 설정값
    const config = {
        systemInstruction: ENVIRONMENT_PROMPT,
        responseMimeType: "application/json",
        temperature: 0.4,
    };

    const result = await callGeminiFunction(images, "", config);

    return result as InitialAnalysisResult;
};

/**
 * 🟩 2단계: 자동화 계획 + ROI 보고서 생성 (Automation Plan + ROI)
 */
export const generateAutomationPlan = async (
    confirmedData: ConfirmedStoreData,
    images: File[]
): Promise<AnalysisResult> => {

    const totalLaborCost = confirmedData.employeeCostFT + confirmedData.employeeCostPT;

    const promptText = `
        [CONFIRMED DATA - USE AS FACTS]
        Store Category: ${confirmedData.store_category}
        Hall Size: ${confirmedData.estimated_hall_size} Pyung
        Kitchen Size: ${confirmedData.estimated_kitchen_size} Pyung
        Table Count: ${confirmedData.estimated_tables} EA
        Existing Table Order Tablets: ${confirmedData.has_table_tablets ? "YES" : "NO"}

        Monthly Sales: ${confirmedData.monthlySales} 만원
        Monthly Fixed Cost: ${confirmedData.monthlyFixedCost} 만원

        [LABOR DATA]
        Full-time Employees (FT): ${confirmedData.employeeCountFT}명 (Total Cost: ${confirmedData.employeeCostFT} 만원)
        Part-time Employees (PT): ${confirmedData.employeeCountPT}명 (Total Cost: ${confirmedData.employeeCostPT} 만원)
        Total Labor Cost: ${totalLaborCost} 만원

        Please detect specific equipment from images (fryers, woks, machines)
        and generate the automation plan and ROI report.
    `;

    const config = {
        systemInstruction: PLANNING_PROMPT,
        responseMimeType: "application/json",
        temperature: 0.5,
    };

    const result = await callGeminiFunction(images, promptText, config);

    // AI 응답 후, 수동 입력값 덮어쓰기 (최종 결과 정확도 유지)
    result.current_cost.employee_count_ft = confirmedData.employeeCountFT;
    result.current_cost.employee_cost_ft = confirmedData.employeeCostFT;
    result.current_cost.employee_count_pt = confirmedData.employeeCountPT;
    result.current_cost.employee_cost_pt = confirmedData.employeeCostPT;
    result.current_cost.monthly_labor_cost = totalLaborCost;

    return result as AnalysisResult;
};