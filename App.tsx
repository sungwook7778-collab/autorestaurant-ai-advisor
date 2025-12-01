import React, { useState, useEffect } from "react";
import { generateGemini } from "./services/geminiService";
import {
  AnalysisStatus,
  StoreInputData,
  AnalysisResult
} from "./types";
import ResultDashboard from "./components/ResultDashboard";
import {
  UploadCloud,
  ChefHat,
  DollarSign,
  Layout,
  Loader2
} from "lucide-react";

const App: React.FC = () => {
  const [status, setStatus] = useState<AnalysisStatus>("idle");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [images, setImages] = useState<File[]>([]);
  const [inputData, setInputData] = useState<StoreInputData>({
    monthlySales: 0,
    monthlyFixedCost: 0,
    employeeCountFT: 0,
    employeeCostFT: 0,
    employeeCountPT: 0,
    employeeCostPT: 0,
  });

  /** ------------------------------
   *   이미지 붙여넣기(Ctrl+V) 처리
   *  ------------------------------ */
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      const pasted: File[] = [];
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith("image")) {
          const file = items[i].getAsFile();
          if (file) pasted.push(file);
        }
      }

      if (pasted.length > 0) {
        e.preventDefault();
        setImages((prev) => [...prev, ...pasted]);
      }
    };

    document.addEventListener("paste", handlePaste);
    return () => document.removeEventListener("paste", handlePaste);
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImages(Array.from(e.target.files));
    }
  };

  /** ------------------------------
   *    AI 분석 시작
   *  ------------------------------ */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (images.length === 0) {
      alert("매장 이미지를 최소 1장 이상 업로드해주세요.");
      return;
    }

    setStatus("analyzing_env");
    setErrorMsg(null);

    try {
      const prompt = `
📌 매장 자동화 분석 요청

- 월 매출: ${inputData.monthlySales}만원
- 월 고정비: ${inputData.monthlyFixedCost}만원
- 정규직: ${inputData.employeeCountFT}명 / ${inputData.employeeCostFT}만원
- 아르바이트: ${inputData.employeeCountPT}명 / ${inputData.employeeCostPT}만원
- 업로드된 이미지 수: ${images.length}

위 데이터를 기반으로 업종 추정, 규모·테이블 수 분석, 자동화 포인트, 추천 로봇·장비 조합, ROI 분석을 상세 리포트로 작성하세요.
      `;

      /** Cloudflare Worker → Gemini 호출 */
      const aiResult = await generateGemini(prompt);

      /** Worker는 raw Gemini response를 그대로 줌 → 여기서 result만 추출 */
      setResult({
        summary: JSON.stringify(aiResult, null, 2), // 필요하면 구조화 가능
      });

      setStatus("success");
    } catch (err: any) {
      setStatus("error");
      setErrorMsg(err.message || "AI 분석 중 오류가 발생했습니다.");
    }
  };

  /** 초기화 */
  const handleReset = () => {
    setStatus("idle");
    setImages([]);
    setResult(null);
    setInputData({
      monthlySales: 0,
      monthlyFixedCost: 0,
      employeeCountFT: 0,
      employeeCostFT: 0,
      employeeCountPT: 0,
      employeeCostPT: 0,
    });
  };

  /** ------------------------------
   *   결과 화면
   *  ------------------------------ */
  if (status === "success" && result) {
    return <ResultDashboard result={result} onReset={handleReset} />;
  }

  /** ------------------------------
   *   메인 입력 화면
   *  ------------------------------ */
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* 헤더 */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg">
            <ChefHat className="text-white w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            AutoRestaurant <span className="text-blue-600">AI Advisor</span>
          </h1>
        </div>
      </header>

      {/* 메인 */}
      <main className="flex-grow flex items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">

          {/* 타이틀 */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-8 text-white">
            <h2 className="text-2xl font-bold mb-2">매장 자동화 진단 시작하기</h2>
            <p className="text-slate-300">
              AI가 사진과 비용구조를 분석하여 자동화 포트폴리오와 ROI 리포트를 제공합니다.
            </p>
          </div>

          <div className="p-8">

            {/* 오류 */}
            {status === "error" && (
              <div className="mb-6 bg-red-50 text-red-700 p-4 rounded-lg border border-red-200 flex items-center gap-2">
                <Loader2 className="w-5 h-5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* 로딩 화면 */}
            {status === "analyzing_env" ? (
              <div className="py-20 flex flex-col items-center text-center">
                <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mb-4"></div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">AI 분석 중...</h3>
                <p className="text-slate-500 max-w-md">
                  업로드된 이미지와 비용 구조를 기반으로 자동화를 분석하고 있습니다.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-8">

                {/* 이미지 업로드 */}
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <Layout className="w-4 h-4 text-blue-600" />
                    1. 매장 이미지
                  </label>

                  <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center relative">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageChange}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <UploadCloud className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                    <p>이미지를 업로드하거나 붙여넣기(Ctrl+V) 하세요</p>

                    {images.length > 0 && (
                      <p className="mt-2 text-blue-600 font-medium">
                        {images.length}개의 이미지 선택됨
                      </p>
                    )}
                  </div>
                </div>

                {/* 비용 입력 */}
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-blue-600" />
                    2. 월 운영 비용
                  </label>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    {/* 월 고정비 */}
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-500">
                        월 고정비 (임대료 등)
                      </label>
                      <input
                        type="number"
                        required
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                        placeholder="500"
                        value={inputData.monthlyFixedCost || ""}
                        onChange={(e) =>
                          setInputData({
                            ...inputData,
                            monthlyFixedCost: Number(e.target.value),
                          })
                        }
                      />
                    </div>

                    {/* 월 매출 */}
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-500">
                        월 매출
                      </label>
                      <input
                        type="number"
                        required
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                        placeholder="6000"
                        value={inputData.monthlySales || ""}
                        onChange={(e) =>
                          setInputData({
                            ...inputData,
                            monthlySales: Number(e.target.value),
                          })
                        }
                      />
                    </div>
                  </div>

                  {/* 인건비 입력 */}
                  <div className="bg-slate-50 p-4 rounded-xl space-y-4">
                    {/* 정규직 */}
                    <div>
                      <h4 className="text-sm font-bold text-slate-700 mb-2">
                        정규직 (Full-time)
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-xs text-slate-500">
                            인원수 (명)
                          </label>
                          <input
                            type="number"
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                            value={inputData.employeeCountFT || ""}
                            onChange={(e) =>
                              setInputData({
                                ...inputData,
                                employeeCountFT: Number(e.target.value),
                              })
                            }
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs text-slate-500">
                            월 총 인건비 (만원)
                          </label>
                          <input
                            type="number"
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                            value={inputData.employeeCostFT || ""}
                            onChange={(e) =>
                              setInputData({
                                ...inputData,
                                employeeCostFT: Number(e.target.value),
                              })
                            }
                          />
                        </div>
                      </div>
                    </div>

                    {/* 아르바이트 */}
                    <div className="border-t border-slate-200 pt-3">
                      <h4 className="text-sm font-bold text-slate-700 mb-2">
                        아르바이트 (Part-time)
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-xs text-slate-500">
                            인원수 (명)
                          </label>
                          <input
                            type="number"
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                            value={inputData.employeeCountPT || ""}
                            onChange={(e) =>
                              setInputData({
                                ...inputData,
                                employeeCountPT: Number(e.target.value),
                              })
                            }
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs text-slate-500">
                            월 총 인건비 (만원)
                          </label>
                          <input
                            type="number"
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                            value={inputData.employeeCostPT || ""}
                            onChange={(e) =>
                              setInputData({
                                ...inputData,
                                employeeCostPT: Number(e.target.value),
                              })
                            }
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <button className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700">
                  AI 분석 시작하기
                </button>
              </form>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;