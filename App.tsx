import React, { useState, useEffect } from 'react';
import { generateGemini } from './services/geminiService';
import { AnalysisStatus, StoreInputData, AnalysisResult } from './types';
import ResultDashboard from './components/ResultDashboard';
import { UploadCloud, ChefHat, DollarSign, Layout, Loader2 } from 'lucide-react';

const App: React.FC = () => {
  const [status, setStatus] = useState<AnalysisStatus>('idle');
  const [inputData, setInputData] = useState<StoreInputData>({
    monthlySales: 0,
    monthlyFixedCost: 0,
    employeeCountFT: 0,
    employeeCostFT: 0,
    employeeCountPT: 0,
    employeeCostPT: 0,
  });
  const [images, setImages] = useState<File[]>([]);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Paste handler
  useEffect(() => {
    const handleGlobalPaste = (e: ClipboardEvent) => {
      const target = e.target as HTMLElement;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return;

      const items = e.clipboardData?.items;
      if (!items) return;

      const pasted: File[] = [];
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.includes('image')) {
          const file = items[i].getAsFile();
          if (file) pasted.push(file);
        }
      }

      if (pasted.length) {
        e.preventDefault();
        setImages(prev => [...prev, ...pasted]);
      }
    };

    document.addEventListener('paste', handleGlobalPaste);
    return () => document.removeEventListener('paste', handleGlobalPaste);
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setImages(Array.from(e.target.files));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (images.length === 0) {
      alert("이미지를 1장 이상 업로드해주세요.");
      return;
    }

    setStatus('analyzing_env');
    setErrorMsg(null);

    try {
      // 1) 프롬프트 생성
      const prompt = `
      매장 자동화 분석을 시작합니다.
      - 월 매출: ${inputData.monthlySales}만원
      - 월 고정비: ${inputData.monthlyFixedCost}만원
      - 정규직 인원/비용: ${inputData.employeeCountFT}명 / ${inputData.employeeCostFT}만원
      - 알바 인원/비용: ${inputData.employeeCountPT}명 / ${inputData.employeeCostPT}만원
      업로드된 사진은 ${images.length}장입니다.
      매장 업종 추정, 규모 분석, 테이블 수, 자동화 가능 포인트, ROI 계산을 리포트 형식으로 제공해주세요.
      `;

      // 2) Worker API 호출
      const aiResult = await generateGemini(prompt);

      setResult({
        summary: aiResult.result,  // 필요시 구조화 가능
      });

      setStatus('success');

    } catch (err: any) {
      setStatus('error');
      setErrorMsg(err.message);
    }
  };

  const handleReset = () => {
    setStatus('idle');
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

  if (status === 'success' && result) {
    return <ResultDashboard result={result} onReset={handleReset} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
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

      <main className="flex-grow flex items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-8 text-white">
            <h2 className="text-2xl font-bold mb-2">매장 자동화 진단 시작하기</h2>
            <p className="text-slate-300">AI가 매장 사진과 비용 구조를 분석하여 최적의 자동화 포트폴리오와 ROI 리포트를 생성합니다.</p>
          </div>

          <div className="p-8">

            {status === 'error' && (
              <div className="mb-6 bg-red-50 text-red-700 p-4 rounded-lg border border-red-200 flex items-center gap-2">
                <Loader2 className="w-5 h-5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {status === 'analyzing_env' ? (
              <div className="py-20 flex flex-col items-center text-center">
                <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mb-4"></div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">AI 분석 중...</h3>
                <p className="text-slate-500 max-w-md">이미지와 비용 구조를 기반으로 자동화를 분석 중입니다.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-8">

                {/* 이미지 */}
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
                      <p className="mt-2 text-blue-600 font-medium">{images.length}개 선택됨</p>
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
                    {/* ... 기존 코드 동일 ... */}
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