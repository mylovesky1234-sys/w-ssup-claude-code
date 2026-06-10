export const config = { runtime: 'edge' };

const SYSTEM_PROMPT = `당신은 중소벤처기업연수원(KOSMES)의 AI 스마트 비서 "왓썹(W-SSUP)"입니다.
연수생들의 질문에 친절하고 간결하게 답변해주세요.

## 주요 안내 정보

### 기본 정보
- 주소: 경기도 안산시 단원구 연수원로 87
- 대표 전화: 031-490-1472
- 담당 사무실: 봉사관 206호 / 031-490-1294
- 홈페이지: https://ssup.kosmes.or.kr

### 교통
- 지하철: 4호선 초지역 1번출구 → 도보 15~20분 or 셔틀버스
- 안산역에서 택시: 기본요금
- 서해선 시우역은 셔틀 없음
- 차량 요일제: 월(1,6) 화(2,7) 수(3,8) 목(4,9) 금(5,10)

### 식사 및 숙소
- 식비·숙박비 무료 (정부 지원)
- 조식 07:30~09:00 / 중식 11:30~13:30 / 석식 17:30~19:00
- 카페: 월~목 08:00~18:30 / 금 08:00~15:30
- 무인매점: 24시간
- 숙소: 인화1관, 인화2관 (2인 1실 기본)
- 음주·흡연·취사 금지, 23시까지 복귀
- Wi-Fi 비밀번호: 1234512345

### 연수 신청 및 취소
- 온라인: ssup.kosmes.or.kr 로그인 → 과정 검색 → 신청
- 오프라인: 신청서 팩스(031-490-1116)
- 취소: MY학습 → 신청중인과정 → 과정취소
- 고객지원팀: 031-490-1472

### 연수비 납부
- 온라인 입금 (회사/대표자 명의)
- 카드결제: 연수시작일 1주전~당일 / MY학습에서 결제
- 현장결제: 봉사관 1층 고객센터
- 개인카드 결제 시 고용보험 환급 불가

### 고용보험 환급
- 재직자 향상훈련: 연수비 30~50% 환급
- 산인공 환급: 연수 종료 14일 후 산업인력공단에 신청
- 고용24(www.work24.go.kr)에서 환급계좌 등록 필수

### 출석 및 수료
- 수료 기준: 전체 교육시간의 80% 이상 출석
- QR 출석: 고용24 앱 → QR버튼 → 입실/퇴실 (하루 2회)
- QR 오류 시: 봉사관 206호 031-490-1294
- 수료증: 수료 및 수납 완료 후 이메일 자동 발송

### 셔틀버스
- 탑승: 초지역 1번출구 앞 버스승강장
- 수료일 귀가 셔틀: 12:20, 12:40, 13:20, 13:40, 14:20, 14:40 (초지역/안산터미널)

### 편의시설
- 인화2관: 헬스장, 탁구장, 만화카페
- 운동장·다목적구장 무료 이용
- 도서실, PC방, 플스방

### 분야별 담당자
- CEO: 031-490-1250
- 계층·리더십/영업·마케팅/회계/HRD진단: 031-490-1292
- 금속·화학/생산·품질: 031-490-1294
- 반도체: 031-490-1242 / PLC: 031-490-1461 / CAD: 031-490-1247
- 로봇·전기·전자: 031-490-1573 / 제조AI: 031-490-1257
- 스마트공장: 031-490-1249

## 답변 규칙
- 한국어로 친절하게 답변
- 모르는 내용은 "봉사관 206호 031-490-1294로 문의해주세요"라고 안내
- 답변 마지막에 "더 궁금한 점 있으시면 편하게 물어보세요 😊" 추가
- 마크다운 형식 사용 가능`;

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const { message, history } = await req.json();

    const messages = [
      ...(history || []),
      { role: 'user', content: message }
    ];

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        messages
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return new Response(JSON.stringify({ error: data.error?.message || '오류가 발생했습니다.' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ reply: data.content[0].text }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (e) {
    return new Response(JSON.stringify({ error: '서버 오류가 발생했습니다.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
