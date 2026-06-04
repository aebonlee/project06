import { useState } from 'react';
import { Hero, Stack, Pill, type Meta } from './ui';

const M: Meta = { id: 6, icon: '🗂️', title: '청년지원정책 안내 챗봇 (2팀)', tagline: '자격 요건 체크리스트로 받을 수 있는 정책 진단', members: ['한승우', '박정우'], color: '#3b82f6', note: '동일 주제 2팀' };

interface Q { id: string; text: string; }
const QUESTIONS: Q[] = [
  { id: 'youth', text: '만 19~34세 청년인가요?' },
  { id: 'nojob', text: '현재 미취업 상태인가요?' },
  { id: 'nohome', text: '무주택자인가요?' },
  { id: 'lowincome', text: '중위소득 150% 이하인가요?' },
  { id: 'startup', text: '창업에 관심이 있거나 준비 중인가요?' },
  { id: 'study', text: '직업훈련·자격 취득을 계획 중인가요?' },
];

interface Policy { name: string; needs: string[]; summary: string; link: string; }
const POLICIES: Policy[] = [
  { name: '청년월세 특별지원', needs: ['youth', 'nohome', 'lowincome'], summary: '월 최대 20만원, 최대 12개월 월세 지원.', link: 'https://www.bokjiro.go.kr' },
  { name: '국민취업지원제도', needs: ['youth', 'nojob'], summary: '구직촉진수당 + 취업지원서비스.', link: 'https://www.kua.go.kr' },
  { name: '청년도약계좌', needs: ['youth', 'lowincome'], summary: '정부기여금+비과세 5년 자산형성.', link: 'https://www.fsc.go.kr' },
  { name: '청년창업사관학교', needs: ['youth', 'startup'], summary: '사업화 자금·공간·멘토링.', link: 'https://start.kosmes.or.kr' },
  { name: '내일배움카드(K-디지털)', needs: ['study'], summary: '직업훈련비/AI·SW 부트캠프 지원.', link: 'https://www.hrd.go.kr' },
  { name: '청년내일채움공제', needs: ['youth', 'nojob'], summary: '중소기업 취업 청년 목돈 마련.', link: 'https://www.work24.go.kr' },
];

export default function App() {
  const [ans, setAns] = useState<Record<string, boolean>>({});
  const [done, setDone] = useState(false);
  const set = (id: string, v: boolean) => setAns((p) => ({ ...p, [id]: v }));
  const yes = Object.entries(ans).filter(([, v]) => v).map(([k]) => k);
  const eligible = POLICIES.filter((p) => p.needs.every((n) => yes.includes(n)));
  const allAnswered = QUESTIONS.every((q) => ans[q.id] !== undefined);

  return (
    <div className="wrap">
      <Hero m={M} />
      <main style={{ marginTop: 22 }}>
        <Stack>
          <p style={{ margin: 0, color: 'var(--sub)' }}>아래 질문에 예/아니오로 답하면 받을 수 있는 정책을 진단해 드려요.</p>
          {QUESTIONS.map((q) => (
            <div key={q.id} className="box" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 14.5, fontWeight: 600 }}>{q.text}</span>
              <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                {[['예', true], ['아니오', false]].map(([l, v]) => (
                  <button key={String(l)} onClick={() => set(q.id, v as boolean)} style={{
                    padding: '7px 14px', fontSize: 13, fontWeight: 700, cursor: 'pointer', borderRadius: 8, border: '1px solid var(--border)',
                    background: ans[q.id] === v ? M.color : 'transparent', color: ans[q.id] === v ? '#fff' : 'var(--sub)',
                  }}>{l}</button>
                ))}
              </div>
            </div>
          ))}
          <button className="btn" disabled={!allAnswered} onClick={() => setDone(true)}>🔎 받을 수 있는 정책 진단</button>

          {done && (
            <Stack gap={12}>
              <div style={{ fontWeight: 700 }}>진단 결과 — <span style={{ color: M.color }}>{eligible.length}건</span> 해당</div>
              {eligible.length === 0 ? <p style={{ color: 'var(--sub)' }}>현재 조건에 딱 맞는 정책이 없어요. 자격 요건을 더 충족하면 늘어납니다.</p> :
                eligible.map((p) => (
                  <div key={p.name} className="box">
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}><Pill color={M.color}>해당</Pill><strong>{p.name}</strong></div>
                    <p style={{ margin: '8px 0 6px', fontSize: 14, lineHeight: 1.7 }}>{p.summary}</p>
                    <a href={p.link} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, fontWeight: 600, color: M.color, textDecoration: 'none' }}>자세히 보기 →</a>
                  </div>
                ))}
            </Stack>
          )}
        </Stack>
      </main>
    </div>
  );
}
