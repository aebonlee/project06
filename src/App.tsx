import { useState } from 'react';
import { AppLayout, Stack, Field, Chip, type Meta } from './ui';
import { ask, hasKey } from './lib/ai';

const M: Meta = {
  id: 6, icon: '🗂️', title: '청년정책 자격 진단기 (2팀)', tagline: '몇 가지 질문에 답하면 정책별 자격 매칭률을 계산하고, AI가 추천 이유를 설명해 줘요',
  members: ['한승우', '박정우'], color: '#3b82f6', ai: true,
  problem:
    '“나는 이 정책을 받을 수 있을까?”가 가장 큰 장벽입니다. 본 진단기는 소득·주거·고용·학적 등 프로필을 입력하면 ' +
    '규칙 기반 엔진이 정책별 자격 조건을 항목별로 대조해 매칭률(%)을 계산하고, 충족·미충족 조건을 투명하게 보여 줍니다. ' +
    'AI는 그 결과에 “왜 추천하는지”와 신청 팁을 덧붙여 설명합니다.',
  features: [
    { icon: '📊', title: '자격 매칭률', desc: '정책별 조건 충족도를 % 게이지로 계산·정렬' },
    { icon: '🔍', title: '조건 투명 공개', desc: '어떤 조건을 충족/미충족했는지 항목별 표시' },
    { icon: '🤖', title: 'AI 추천 이유', desc: '매칭 결과에 맞춘 추천 사유·신청 팁 생성' },
    { icon: '🧮', title: '규칙 기반 엔진', desc: 'API 없이도 동작하는 결정적 자격 판정 로직' },
    { icon: '🗓️', title: '신청 우선순위', desc: '매칭률 높은 순으로 먼저 챙길 정책 안내' },
    { icon: '🏷️', title: '분야 태그', desc: '주거·취업·금융·교육 분야별 색상 구분' },
  ],
  howto: [
    '소득 구간·주거 형태·고용/학적 상태 등 프로필을 고릅니다',
    '“자격 진단”을 누르면 정책별 매칭률이 계산됩니다',
    '충족/미충족 조건을 확인하고 우선순위를 정합니다',
    '(선택) AI 키를 넣으면 추천 이유·신청 팁이 추가됩니다',
  ],
  facts: [
    { value: '%', label: '매칭률' }, { value: '규칙', label: '판정 엔진' }, { value: '6', label: '내장 정책' },
    { value: 'AI', label: '추천 이유' }, { value: '투명', label: '조건 공개' }, { value: '무키', label: '기본 동작' },
  ],
  info: [
    { title: '왜 매칭률인가요?', body: '“해당/비해당”의 이분법보다, 조건별 충족도를 비율로 보여 주면 “무엇을 더 갖추면 자격이 되는지”가 명확해집니다.' },
    { title: '소득 기준의 이해', body: '많은 청년정책이 기준 중위소득의 일정 % 이하를 봅니다. 건강보험료 납부액으로 간편 추정할 수 있어, 미리 확인해 두면 좋습니다.' },
    { title: '결정적 엔진 + AI', body: '자격 판정은 재현 가능해야 하므로 규칙 기반 엔진이 담당하고, 설명·동기부여는 AI가 보조합니다. 역할을 분리해 신뢰성과 친절함을 모두 잡았습니다.' },
    { title: '주의', body: '실제 자격은 연도·예산·세부지침에 따라 달라집니다. 최종 확인은 공식 공고를 따르세요.' },
  ],
  pipeline: [
    '프로필 입력 — 나이·소득·주거·고용·학적·관심을 구조화',
    '규칙 평가 — 정책별 조건을 프로필과 대조해 충족/미충족 산출',
    '매칭률 계산 — 충족 조건 비율을 % 점수로 환산·정렬',
    'AI 보강(선택) — 상위 정책의 추천 이유·신청 팁 생성',
    '시각화 — 매칭 게이지 + 조건 체크 + 분야 태그',
    '안내 — 우선순위 순으로 신청 가이드 제공',
  ],
  techNotes: [
    { title: '결정적 판정 엔진', body: '각 정책을 조건 술어(predicate) 배열로 정의하고 프로필에 적용해 매칭 비율을 계산합니다. 동일 입력은 항상 동일 결과를 냅니다.' },
    { title: '설명-판정 분리', body: '자격 판정(규칙)과 설명(AI)을 분리해, API 키가 없어도 핵심 진단은 완전하게 동작합니다.' },
    { title: '투명한 근거', body: '충족·미충족 조건을 그대로 노출해 블랙박스가 아닌, 검증 가능한 추천을 제공합니다.' },
    { title: '정적 배포', body: 'Vite + React + TS, GitHub Pages 자동 배포. 백엔드 없이 클라이언트에서 완결됩니다.' },
  ],
  targets: ['자격 여부가 헷갈리는 청년', '여러 청년정책을 비교하려는 사람', '신청 우선순위를 정하려는 사람'],
  goals: [
    '프로필로 정책별 자격 매칭률을 투명하게 계산한다',
    '충족·미충족 조건을 항목별로 공개한다',
    'API 키가 없어도 규칙 엔진으로 완전히 동작하게 한다',
  ],
  scenarios: [
    '소득·주거·고용·학적 프로필을 고르고 자격 진단을 받는다',
    '정책별 매칭률과 충족/미충족 조건을 확인한다',
    '(선택) AI로 추천 이유·신청 팁을 보강한다',
  ],
  screens: [
    { name: '프로필 입력', desc: '나이·소득 구간·주거·고용/학적·관심 분야 선택' },
    { name: '진단 결과', desc: '정책별 매칭률 게이지 + 충족/미충족 조건 + 분야 태그' },
    { name: 'AI 추천 이유', desc: '(선택) 상위 정책의 추천 사유·신청 팁' },
  ],
  pipelineDetail: [
    { step: '프로필 입력', detail: '나이·소득·주거·고용·학적·관심을 구조화한다.' },
    { step: '규칙 평가', detail: '각 정책을 조건 술어(predicate) 배열로 정의해 프로필에 적용, 충족/미충족을 산출한다.' },
    { step: '매칭률 계산', detail: '충족 조건 비율을 % 점수로 환산해 정렬한다.' },
    { step: 'AI 보강(선택)', detail: '키가 있으면 상위 정책의 추천 이유·신청 팁을 생성한다.' },
    { step: '시각화', detail: '매칭 게이지 + 조건 체크 + 분야 태그로 표시한다.' },
    { step: '안내', detail: '우선순위 순으로 신청 가이드를 제공한다.' },
  ],
  promptNotes: [
    '자격 판정은 규칙 엔진이 결정적으로 수행하고, AI는 설명·신청 팁만 보조해 역할을 분리한다.',
    'system 프롬프트에 매칭 결과(충족/미충족 조건)를 넣어 근거에 맞는 추천 사유를 생성한다.',
    'API 키가 없어도 규칙 엔진만으로 핵심 진단이 완전하게 동작한다.',
  ],
  architecture:
    '백엔드 없는 React SPA. 공통 레이아웃·5탭은 src/ui.tsx, 진단 기능은 src/App.tsx가 담당한다. ' +
    '자격 판정은 결정적 규칙 엔진(조건 술어)으로 App.tsx 안에서 계산하고, 설명·팁은 src/lib/ai.ts의 OpenAI 호출로 보강한다. 백엔드·DB 없이 완결된다.',
  structure: [
    { path: 'src/App.tsx', desc: '규칙 기반 자격 판정·매칭률·결과 + 메타(M)' },
    { path: 'src/ui.tsx', desc: '공통 레이아웃·5탭·UI 헬퍼' },
    { path: 'src/lib/ai.ts', desc: 'OpenAI chat 헬퍼(추천 이유·신청 팁)' },
    { path: 'src/index.css', desc: '테마·게이지/태그 스타일' },
  ],
  dataModel: [
    { name: 'Profile', desc: '나이·소득·주거·고용·학적·관심 등 사용자 프로필' },
    { name: 'Cond', desc: '정책 자격 조건 술어(충족 여부 판정 단위)' },
    { name: 'Policy / Result', desc: '정책 정의와 매칭률·충족/미충족 조건을 담은 진단 결과' },
  ],
  deploy:
    'Vite 빌드(base: "./") 후 GitHub Actions(deploy.yml)가 main push 시 GitHub Pages로 자동 배포 → aebonlee.github.io/project06/',
  scope: {
    include: ['프로필 → 정책별 매칭률·충족/미충족 조건', '우선순위 안내·AI 추천 이유(선택)', '규칙 엔진 결정적 판정 + AI 설명 보조'],
    exclude: ['실제 신청·연동', '연도별 예산·세부지침 자동 갱신', '로그인·저장 동기화'],
  },
  pitch: [
    '"해당/비해당" 대신 매칭률(%)로 무엇을 더 갖추면 되는지 보여주는 점',
    '판정(규칙)과 설명(AI)을 분리해 키 없이도 완전 동작',
    '충족/미충족 조건을 투명 공개하는 화이트박스 방식',
  ],
  stack: ['React 18', 'TypeScript', 'Vite', 'Rule Engine', 'OpenAI GPT', 'localStorage'],
  links: [
    { label: '온라인청년센터', url: 'https://www.youthcenter.go.kr' },
    { label: '복지로', url: 'https://www.bokjiro.go.kr' },
  ],
};

interface Profile { age: number; income: string; housing: string; employ: string; student: boolean }
interface Cond { label: string; ok: (p: Profile) => boolean }
interface Policy { name: string; agency: string; category: string; benefit: string; conds: Cond[] }
interface Result { name: string; agency: string; category: string; benefit: string; pct: number; met: string[]; unmet: string[] }

const TOPIC_COLOR: Record<string, string> = { 주거: '#0ea5e9', 취업: '#16a34a', '금융·자산': '#f59e0b', '교육·역량': '#8b5cf6' };
const INCOMES = ['중위 60% 이하', '중위 100% 이하', '중위 150% 이하', '150% 초과'];
const HOUSINGS = ['무주택(임차)', '무주택(부모거주)', '자가'];
const EMPLOYS = ['구직 중', '재직(중소기업)', '재직(그 외)', '예비창업'];

const isYouth = (p: Profile) => p.age >= 19 && p.age <= 34;
const incomeRank = (p: Profile) => INCOMES.indexOf(p.income); // 0=가장 낮음

const POLICIES: Policy[] = [
  { name: '청년월세 한시 특별지원', agency: '국토교통부', category: '주거', benefit: '월 최대 20만원 × 12개월', conds: [
    { label: '만 19~34세', ok: isYouth }, { label: '무주택 임차', ok: (p) => p.housing === '무주택(임차)' }, { label: '중위소득 60% 이하', ok: (p) => incomeRank(p) <= 0 } ] },
  { name: '청년도약계좌', agency: '금융위원회', category: '금융·자산', benefit: '5년 목돈(정부기여+비과세)', conds: [
    { label: '만 19~34세', ok: isYouth }, { label: '소득 활동 있음', ok: (p) => p.employ.startsWith('재직') }, { label: '중위 150% 이하', ok: (p) => incomeRank(p) <= 2 } ] },
  { name: '국민취업지원제도', agency: '고용노동부', category: '취업', benefit: '구직촉진수당 월 50만원×6', conds: [
    { label: '구직 중', ok: (p) => p.employ === '구직 중' }, { label: '중위 100% 이하', ok: (p) => incomeRank(p) <= 1 }, { label: '취업 의사', ok: () => true } ] },
  { name: '청년내일채움공제', agency: '고용노동부', category: '취업', benefit: '만기 공제금(본인+기업+정부)', conds: [
    { label: '만 19~34세', ok: isYouth }, { label: '중소기업 재직', ok: (p) => p.employ === '재직(중소기업)' }, { label: '정규직', ok: () => true } ] },
  { name: '예비창업패키지', agency: '중소벤처기업부', category: '교육·역량', benefit: '사업화 자금+멘토링', conds: [
    { label: '예비창업자', ok: (p) => p.employ === '예비창업' }, { label: '업종 요건', ok: () => true }, { label: '만 39세 이하', ok: (p) => p.age <= 39 } ] },
  { name: '국가장학금', agency: '한국장학재단', category: '교육·역량', benefit: '등록금 지원(소득연계)', conds: [
    { label: '대학 재학생', ok: (p) => p.student }, { label: '중위 150% 이하', ok: (p) => incomeRank(p) <= 2 }, { label: '성적 요건', ok: () => true } ] },
];

function evaluate(p: Profile): Result[] {
  return POLICIES.map((pol) => {
    const met: string[] = []; const unmet: string[] = [];
    pol.conds.forEach((c) => (c.ok(p) ? met : unmet).push(c.label));
    return { name: pol.name, agency: pol.agency, category: pol.category, benefit: pol.benefit, pct: Math.round((met.length / pol.conds.length) * 100), met, unmet };
  }).sort((a, b) => b.pct - a.pct);
}

async function explain(top: Result[], p: Profile): Promise<string> {
  if (!hasKey()) return '';
  try {
    return await ask(
      '너는 청년정책 상담사야. 자격 매칭 결과를 보고 따뜻하게 추천 이유와 신청 팁을 2~3문장으로 설명해. 과장 금지.',
      `프로필: ${p.age}세, 소득 ${p.income}, 주거 ${p.housing}, 고용 ${p.employ}${p.student ? ', 재학생' : ''}. 상위 정책: ${top.slice(0, 3).map((t) => `${t.name}(${t.pct}%)`).join(', ')}.`,
      { temperature: 0.5, max_tokens: 300 },
    );
  } catch { return ''; }
}

function Gauge({ pct, color }: { pct: number; color: string }) {
  const r = 26, c = 2 * Math.PI * r, off = c * (1 - pct / 100);
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" style={{ flexShrink: 0 }}>
      <circle cx="32" cy="32" r={r} fill="none" stroke="var(--soft)" strokeWidth="7" />
      <circle cx="32" cy="32" r={r} fill="none" stroke={color} strokeWidth="7" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={off} transform="rotate(-90 32 32)" />
      <text x="32" y="37" textAnchor="middle" fontSize="15" fontWeight="800" fill="var(--text)">{pct}</text>
    </svg>
  );
}

function Feature() {
  const [age, setAge] = useState(26);
  const [income, setIncome] = useState(INCOMES[0]);
  const [housing, setHousing] = useState(HOUSINGS[0]);
  const [employ, setEmploy] = useState(EMPLOYS[0]);
  const [student, setStudent] = useState(false);
  const [results, setResults] = useState<Result[] | null>(null);
  const [ai, setAi] = useState('');
  const [loading, setLoading] = useState(false);

  const run = async () => {
    const p: Profile = { age, income, housing, employ, student };
    const r = evaluate(p);
    setResults(r); setAi('');
    requestAnimationFrame(() => document.getElementById('res-top')?.scrollIntoView({ behavior: 'smooth' }));
    if (hasKey()) { setLoading(true); setAi(await explain(r, p)); setLoading(false); }
  };

  return (
    <Stack>
      <div className="studio">
        <div className="studio-row">
          <Field label="나이"><input type="number" min={15} max={45} value={age} onChange={(e) => setAge(Number(e.target.value))} /></Field>
          <Field label="소득 구간"><select value={income} onChange={(e) => setIncome(e.target.value)}>{INCOMES.map((x) => <option key={x}>{x}</option>)}</select></Field>
        </div>
        <Field label="주거 형태"><div className="chips">{HOUSINGS.map((h) => <Chip key={h} active={housing === h} color={M.color} onClick={() => setHousing(h)}>{h}</Chip>)}</div></Field>
        <Field label="고용 상태"><div className="chips">{EMPLOYS.map((e) => <Chip key={e} active={employ === e} color={M.color} onClick={() => setEmploy(e)}>{e}</Chip>)}</div></Field>
        <label className="chk"><input type="checkbox" checked={student} onChange={() => setStudent(!student)} /><span>현재 대학(원) 재학 중</span></label>
        <button className="btn" style={{ background: M.color }} onClick={run}>📊 자격 진단</button>
      </div>

      <div id="res-top" />
      {results && (
        <Stack gap={16}>
          {(loading || ai) && (
            <div className="callout-soft" style={{ background: `${M.color}12`, border: `1px solid ${M.color}33` }}>
              <span style={{ fontSize: 20 }}>🤖</span><p style={{ margin: 0 }}>{loading ? 'AI가 추천 이유를 정리하는 중…' : ai}</p>
            </div>
          )}
          <div>
            <h3 className="learn-h" style={{ color: M.color }}>📊 정책별 자격 매칭률</h3>
            <Stack gap={10}>
              {results.map((r, i) => (
                <div key={i} className="rcard" style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                  <Gauge pct={r.pct} color={TOPIC_COLOR[r.category] || M.color} />
                  <div style={{ flex: 1 }}>
                    <span className="tag" style={{ background: TOPIC_COLOR[r.category] || '#64748b' }}>{r.category}</span>
                    <h4 style={{ margin: '4px 0 2px' }}>{r.name}</h4>
                    <p style={{ margin: 0, fontSize: 12.5 }}>{r.agency} · {r.benefit}</p>
                    <div className="chips" style={{ marginTop: 6 }}>
                      {r.met.map((m) => <span key={m} style={{ fontSize: 11.5, color: '#16a34a', fontWeight: 700 }}>✓ {m}</span>)}
                      {r.unmet.map((m) => <span key={m} style={{ fontSize: 11.5, color: 'var(--faint)' }}>✕ {m}</span>)}
                    </div>
                  </div>
                </div>
              ))}
            </Stack>
          </div>
        </Stack>
      )}
    </Stack>
  );
}

export default function App() { return <AppLayout m={M} feature={<Feature />} />; }
