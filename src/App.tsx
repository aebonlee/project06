import { useState } from 'react';
import { AppLayout, Stack, Pill, type Meta } from './ui';
import { ask, hasKey } from './lib/ai';

const M: Meta = {
  id: 6, icon: '🗂️', title: '청년지원정책 안내 챗봇 (2팀)', tagline: '자격 요건 체크리스트로 받을 수 있는 정책 진단', members: ['한승우', '박정우'], color: '#3b82f6', note: '동일 주제 2팀', ai: true,
  problem: '“내가 받을 수 있는 정책”이 가장 궁금하지만 자격 요건 판단이 어렵습니다. 예/아니오 체크리스트로 자격을 진단하고, AI가 우선순위와 신청 전략을 정리해 줍니다.',
  features: [
    { icon: '✅', title: '자격 체크리스트', desc: '6가지 질문으로 받을 수 있는 정책 자동 진단' },
    { icon: '🧭', title: 'AI 신청 전략', desc: 'OpenAI가 우선순위·준비물·순서를 조언' },
    { icon: '📋', title: '맞춤 결과', desc: '조건을 모두 충족하는 정책만 정확히 매칭' },
    { icon: '🔗', title: '바로 신청', desc: '공식 신청 페이지로 연결' },
  ],
  howto: ['6개 질문에 예/아니오로 답해요', '받을 수 있는 정책을 진단받아요', 'AI에게 신청 우선순위·전략을 물어봐요'],
  facts: [{ value: '6', label: '자격 질문' }, { value: '6', label: '진단 정책' }, { value: 'GPT', label: 'AI 전략' }, { value: '100%', label: '조건 매칭' }],
  info: [
    { title: '자격 요건의 핵심', body: '나이(만 19~34), 무주택, 소득(중위 150% 이하), 취업/창업/학습 여부가 주요 기준입니다. 본인 상황을 정확히 입력할수록 결과가 정확합니다.' },
    { title: '중복 수혜 주의', body: '일부 정책은 동시에 받을 수 없거나 우선순위가 있습니다. 마감·예산 소진 전 신청이 중요합니다.' },
    { title: '증빙 서류', body: '주민등록등본, 소득 증빙(건강보험료), 무주택 확인서 등이 자주 필요합니다. 미리 준비하면 빠릅니다.' },
  ],
  stack: ['React', 'TypeScript', 'OpenAI API', 'Vite'],
  links: [{ label: '온통청년', url: 'https://www.youthcenter.go.kr' }],
};

const QUESTIONS = [
  { id: 'youth', text: '만 19~34세 청년인가요?' }, { id: 'nojob', text: '현재 미취업 상태인가요?' },
  { id: 'nohome', text: '무주택자인가요?' }, { id: 'lowincome', text: '중위소득 150% 이하인가요?' },
  { id: 'startup', text: '창업에 관심이 있거나 준비 중인가요?' }, { id: 'study', text: '직업훈련·자격 취득을 계획 중인가요?' },
];
interface Policy { name: string; needs: string[]; summary: string; link: string; }
const POLICIES: Policy[] = [
  { name: '청년월세 특별지원', needs: ['youth', 'nohome', 'lowincome'], summary: '월 최대 20만원, 최대 12개월.', link: 'https://www.bokjiro.go.kr' },
  { name: '국민취업지원제도', needs: ['youth', 'nojob'], summary: '구직촉진수당 + 취업지원.', link: 'https://www.kua.go.kr' },
  { name: '청년도약계좌', needs: ['youth', 'lowincome'], summary: '정부기여금+비과세 자산형성.', link: 'https://www.fsc.go.kr' },
  { name: '청년창업사관학교', needs: ['youth', 'startup'], summary: '사업화 자금·공간·멘토링.', link: 'https://start.kosmes.or.kr' },
  { name: '내일배움카드(K-디지털)', needs: ['study'], summary: '직업훈련/AI·SW 부트캠프.', link: 'https://www.hrd.go.kr' },
  { name: '청년내일채움공제', needs: ['youth', 'nojob'], summary: '중소기업 취업 청년 목돈 마련.', link: 'https://www.work24.go.kr' },
];

function Feature() {
  const [ans, setAns] = useState<Record<string, boolean>>({});
  const [done, setDone] = useState(false);
  const [strategy, setStrategy] = useState('');
  const [loading, setLoading] = useState(false);
  const set = (id: string, v: boolean) => setAns((p) => ({ ...p, [id]: v }));
  const yes = Object.entries(ans).filter(([, v]) => v).map(([k]) => k);
  const eligible = POLICIES.filter((p) => p.needs.every((n) => yes.includes(n)));
  const allAnswered = QUESTIONS.every((q) => ans[q.id] !== undefined);

  const strategize = async () => {
    setLoading(true); setStrategy('');
    try {
      const r = await ask('너는 청년정책 신청 코치야. 해당 정책 목록을 보고 신청 우선순위와 준비 팁을 3~5문장으로 조언해.', `해당 정책: ${eligible.map((e) => e.name).join(', ') || '없음'}`, { temperature: 0.5, max_tokens: 350 });
      setStrategy(r);
    } catch { setStrategy(hasKey() ? '전략 생성 실패. 다시 시도해 주세요.' : '상단에서 OpenAI API 키를 입력하면 AI 신청 전략이 켜집니다.'); }
    setLoading(false);
  };

  return (
    <Stack>
      <p style={{ margin: 0, color: 'var(--sub)' }}>예/아니오로 답하면 받을 수 있는 정책을 진단해 드려요.</p>
      {QUESTIONS.map((q) => (
        <div key={q.id} className="box" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 14.5, fontWeight: 600 }}>{q.text}</span>
          <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>{[['예', true], ['아니오', false]].map(([l, v]) => <button key={String(l)} onClick={() => set(q.id, v as boolean)} style={{ padding: '7px 14px', fontSize: 13, fontWeight: 700, cursor: 'pointer', borderRadius: 8, border: '1px solid var(--border)', background: ans[q.id] === v ? M.color : 'transparent', color: ans[q.id] === v ? '#fff' : 'var(--sub)' }}>{l}</button>)}</div>
        </div>
      ))}
      <button className="btn" style={{ background: M.color }} disabled={!allAnswered} onClick={() => setDone(true)}>🔎 받을 수 있는 정책 진단</button>
      {done && (
        <Stack gap={12}>
          <div style={{ fontWeight: 700 }}>진단 결과 — <span style={{ color: M.color }}>{eligible.length}건</span> 해당</div>
          {eligible.map((p) => (<div key={p.name} className="box"><div style={{ display: 'flex', gap: 8, alignItems: 'center' }}><Pill color={M.color}>해당</Pill><strong>{p.name}</strong></div><p style={{ margin: '8px 0 6px', fontSize: 14 }}>{p.summary}</p><a href={p.link} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, fontWeight: 600, color: M.color, textDecoration: 'none' }}>자세히 →</a></div>))}
          {eligible.length > 0 && <button className="btn btn-ghost" disabled={loading} onClick={strategize}>{loading ? '전략 생성 중…' : '🧭 AI 신청 전략 받기'}</button>}
          {strategy && <div className="box" style={{ borderLeft: `4px solid ${M.color}` }}><p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>🤖 {strategy}</p></div>}
        </Stack>
      )}
    </Stack>
  );
}

export default function App() { return <AppLayout m={M} feature={<Feature />} />; }
