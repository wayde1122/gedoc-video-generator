import React from 'react';
import type {Theme} from './themes';

type ThemeOverlayProps = {
  theme: Theme;
};

const text = (value: string, style: React.CSSProperties = {}) => <span style={style}>{value}</span>;

const TerminalOverlay = ({theme}: ThemeOverlayProps) => {
  const rows = ['ES1 5,841.50 +0.18%', 'BTC 98,420.10 +2.7%', 'WTI 78.94 -0.31%', 'XAU 2,718.40 +0.8%'];
  const news = ['FED rate path data-dependent', 'NVIDIA capex guidance tops', 'WTI inventories build +1.2M', 'PBOC trims RRR by 25 bp'];

  return (
    <div style={styles.terminalRoot}>
      <div style={{...styles.terminalTicker, color: theme.accent2}}>
        {rows.map((row) => text(row, {marginRight: 38}))}
      </div>
      <div style={{...styles.terminalPanel, left: 46, top: 130, width: 520, height: 278}}>
        {['LONG AAPL 1,200  +5,712', 'LONG NVDA 640  +3,033', 'SHORT META 320  -471', 'LONG MSFT 520  +1,872'].map((row, index) => (
          <div key={row} style={styles.terminalRow}>
            <span style={{color: index === 2 ? '#f23645' : theme.accent2}}>{row.slice(0, 5)}</span>
            <span>{row.slice(5)}</span>
          </div>
        ))}
      </div>
      <div style={{...styles.terminalPanel, right: 46, top: 130, width: 440, height: 320}}>
        {news.map((row, index) => (
          <div key={row} style={styles.terminalRow}>
            <span style={{color: theme.accent}}>{String(9 + index).padStart(2, '0')}:4{index}</span>
            <span>{row}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const ToolOverlay = ({theme}: ThemeOverlayProps) => {
  const raycast = theme.recipe === 'raycast';
  const items = raycast
    ? ['Open current triage', 'Translate selection', 'Send to inbox', 'Snippet template']
    : ['Triage cleanup for cycle 21', 'Inline preview for code blocks', 'Sticky filters in board view', 'Restore archived shortcuts'];

  return (
    <div style={{...styles.toolPanel, borderColor: theme.line, background: theme.surface2 ?? theme.panel}}>
      <div style={styles.toolChrome}>
        <span style={{...styles.dot, background: raycast ? '#ff6363' : '#ff5f57'}} />
        <span style={{...styles.dot, background: '#febc2e'}} />
        <span style={{...styles.dot, background: '#28c840'}} />
        <span style={{marginLeft: 12, color: theme.muted}}>{raycast ? 'Search apps, files, snippets...' : 'FND-3142 · Triage cleanup'}</span>
      </div>
      {items.map((item, index) => (
        <div key={item} style={{...styles.toolRow, borderColor: theme.line}}>
          <span style={{...styles.toolPill, background: index === 0 ? theme.accent : theme.accentSoft}} />
          <span>{item}</span>
          <span style={{marginLeft: 'auto', color: theme.muted}}>{index === 0 ? 'high' : 'med'}</span>
        </div>
      ))}
    </div>
  );
};

const HumanistObjectOverlay = ({theme}: ThemeOverlayProps) => {
  if (theme.recipe === 'mailchimp-freddie') {
    return (
      <div style={styles.mailchimpWrap}>
        <div style={styles.mailchimpFace}>
          <div style={{...styles.mailchimpEye, left: 88}} />
          <div style={{...styles.mailchimpEye, right: 88}} />
          <div style={styles.mailchimpSmile} />
          <div style={{...styles.mailchimpCheek, left: 62}} />
          <div style={{...styles.mailchimpCheek, right: 62}} />
        </div>
        <div style={styles.mailchimpHat} />
        <div style={styles.mailchimpWaveA} />
        <div style={styles.mailchimpWaveB} />
      </div>
    );
  }

  if (theme.recipe === 'headspace-meditation') {
    return (
      <div style={styles.headspaceWrap}>
        <div style={styles.headspaceMascot}>
          <div style={{...styles.headspaceEye, left: 104}} />
          <div style={{...styles.headspaceEye, right: 104}} />
          <div style={styles.headspaceMouth} />
        </div>
        <div style={styles.headspaceSage} />
        <div style={styles.headspaceLavender} />
      </div>
    );
  }

  if (theme.recipe === 'notion-pre-ai') {
    return (
      <div style={styles.notionWrap}>
        <div style={styles.notionWindow}>
          <div style={styles.notionLine} />
          <div style={{...styles.notionLine, width: 210}} />
          <div style={{...styles.notionLine, width: 260}} />
          <div style={styles.notionPlant}>
            <div style={styles.notionLeaf} />
            <div style={{...styles.notionLeaf, transform: 'rotate(-28deg)', left: 44}} />
          </div>
        </div>
      </div>
    );
  }

  if (theme.recipe === 'stripe-press') {
    return (
      <div style={{...styles.book, color: theme.accent}}>
        <div style={styles.bookMark} />
        <div style={styles.bookTitle}>Press</div>
        <div style={styles.bookRule} />
        <div style={styles.bookSub}>Reading room</div>
      </div>
    );
  }

  if (theme.recipe === 'aesop') {
    return (
      <div style={styles.bottleWrap}>
        <div style={styles.bottleCap} />
        <div style={{...styles.bottle, background: `linear-gradient(100deg, #5b2b12, ${theme.accent}, #8a512d)`}} />
        <div style={styles.bottleHighlight} />
      </div>
    );
  }

  return null;
};

const RawWebOverlay = ({theme}: ThemeOverlayProps) => (
  <div style={styles.rawWebStack}>
    {['Channels', 'Blocks', 'Index', 'Notes'].map((item, index) => (
      <div key={item} style={{...styles.rawWebBlock, borderColor: theme.line, background: index === 1 ? theme.surface2 : theme.panel}}>
        <span style={{color: index % 2 === 0 ? theme.accent : theme.accent2, textDecoration: 'underline'}}>{item}</span>
        <span style={{color: theme.muted}}>{String(12 + index).padStart(2, '0')}</span>
      </div>
    ))}
  </div>
);

const MinimalObjectOverlay = ({theme}: ThemeOverlayProps) => {
  if (theme.recipe === 'muji-kenya-hara') {
    return (
      <div style={styles.mujiObject}>
        <div style={styles.mujiObjectTop} />
      </div>
    );
  }

  if (theme.recipe === 'apple-hig') {
    return (
      <div style={styles.appleProduct}>
        <div style={styles.appleScreen} />
        <div style={styles.appleGlint} />
      </div>
    );
  }

  return null;
};

const MonocleOverlay = ({theme}: ThemeOverlayProps) => (
  <div style={styles.monocleRoot}>
    <div style={{...styles.monocleStat, borderColor: theme.text}}>
      <strong>173</strong>
      <span>This issue</span>
    </div>
    <div style={{...styles.monocleStat, borderColor: theme.text}}>
      <strong>284</strong>
      <span>Pages</span>
    </div>
    <div style={{...styles.monocleStat, borderColor: theme.text}}>
      <strong>17</strong>
      <span>Cities</span>
    </div>
    <div style={{...styles.monocleStat, borderColor: theme.text}}>
      <strong>£12</strong>
      <span>Kiosk</span>
    </div>
    <div style={{...styles.monoclePhoto, borderColor: theme.line}} />
    <div style={{...styles.monocleFeature, color: theme.text}}>
      <span style={{color: theme.accent}}>FEATURE</span>
      <strong>The slow capital</strong>
    </div>
  </div>
);

const PosterOverlay = ({theme}: ThemeOverlayProps) => {
  if (!['poster', 'brutalist', 'swiss', 'retro'].includes(theme.styleFamily)) {
    return null;
  }

  return (
    <div style={styles.posterMeta}>
      <div style={{...styles.posterNumber, color: theme.accent}}>02</div>
      <div style={{...styles.posterLine, background: theme.text}} />
    </div>
  );
};

export const ThemeOverlay = ({theme}: ThemeOverlayProps) => {
  if (theme.signature === 'newsroom') {
    return null;
  }

  if (theme.styleFamily === 'terminal') {
    return <TerminalOverlay theme={theme} />;
  }

  if (theme.styleFamily === 'tool' || theme.styleFamily === 'glass-tool') {
    return <ToolOverlay theme={theme} />;
  }

  if (theme.recipe === 'are-na') {
    return <RawWebOverlay theme={theme} />;
  }

  if (theme.recipe === 'apple-hig' || theme.recipe === 'muji-kenya-hara') {
    return <MinimalObjectOverlay theme={theme} />;
  }

  if (theme.recipe === 'monocle-magazine') {
    return <MonocleOverlay theme={theme} />;
  }

  if (theme.styleFamily === 'humanist' || theme.styleFamily === 'warm-print') {
    return <HumanistObjectOverlay theme={theme} />;
  }

  return <PosterOverlay theme={theme} />;
};

const styles: Record<string, React.CSSProperties> = {
  terminalRoot: {
    position: 'absolute',
    inset: 0,
    pointerEvents: 'none',
    zIndex: 0,
    fontFamily: '"JetBrains Mono", Consolas, monospace',
    fontSize: 14,
    color: '#e8ecf4',
    opacity: 0.8,
  },
  terminalTicker: {
    position: 'absolute',
    left: 46,
    right: 46,
    top: 68,
    height: 28,
    display: 'flex',
    alignItems: 'center',
    overflow: 'hidden',
    borderBottom: '1px solid rgba(255,255,255,0.08)',
  },
  terminalPanel: {
    position: 'absolute',
    border: '1px solid rgba(255,255,255,0.08)',
    padding: '10px 12px',
    overflow: 'hidden',
  },
  terminalRow: {
    display: 'grid',
    gridTemplateColumns: '72px 1fr',
    gap: 12,
    padding: '7px 0',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
    whiteSpace: 'nowrap',
  },
  toolPanel: {
    position: 'absolute',
    right: 112,
    bottom: 146,
    width: 560,
    minHeight: 260,
    border: '1px solid',
    borderRadius: 14,
    overflow: 'hidden',
    pointerEvents: 'none',
    zIndex: 2,
    boxShadow: '0 32px 90px rgba(0,0,0,0.28)',
    opacity: 0.78,
    color: '#f7f8f8',
    fontFamily: '"Inter", "Microsoft YaHei", sans-serif',
  },
  toolChrome: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    height: 42,
    padding: '0 16px',
    borderBottom: '1px solid rgba(255,255,255,0.08)',
    fontSize: 14,
  },
  dot: {
    width: 11,
    height: 11,
    borderRadius: 999,
    flex: '0 0 auto',
  },
  toolRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    minHeight: 45,
    padding: '0 18px',
    borderBottom: '1px solid',
    fontSize: 15,
  },
  toolPill: {
    width: 12,
    height: 12,
    borderRadius: 999,
    flex: '0 0 auto',
  },
  bottleWrap: {
    position: 'absolute',
    right: 300,
    top: 270,
    width: 190,
    height: 430,
    pointerEvents: 'none',
    zIndex: 0,
    opacity: 0.88,
  },
  bottleCap: {
    position: 'absolute',
    left: 73,
    top: 0,
    width: 44,
    height: 42,
    borderRadius: 5,
    background: '#2d170d',
  },
  bottle: {
    position: 'absolute',
    left: 26,
    top: 38,
    width: 138,
    height: 360,
    borderRadius: '32px 32px 5px 5px',
  },
  bottleHighlight: {
    position: 'absolute',
    left: 58,
    top: 82,
    width: 38,
    height: 150,
    borderRadius: 999,
    background: 'rgba(255,255,255,0.22)',
    filter: 'blur(15px)',
  },
  book: {
    position: 'absolute',
    right: 265,
    top: 275,
    width: 220,
    height: 390,
    padding: 34,
    pointerEvents: 'none',
    zIndex: 0,
    background: 'linear-gradient(90deg, rgba(0,0,0,0.12) 0 10px, #e8dcbf 10px 100%)',
    boxShadow: '0 28px 70px rgba(80, 64, 36, 0.20)',
    fontFamily: '"Noto Serif SC", serif',
  },
  bookMark: {
    width: 22,
    height: 22,
    background: 'currentColor',
    marginBottom: 24,
  },
  bookTitle: {
    fontSize: 36,
    lineHeight: 1.05,
    fontWeight: 800,
    fontStyle: 'italic',
  },
  bookRule: {
    height: 1,
    background: 'currentColor',
    marginTop: 92,
  },
  bookSub: {
    marginTop: 18,
    fontSize: 16,
    fontStyle: 'italic',
  },
  mailchimpWrap: {
    position: 'absolute',
    right: 260,
    top: 218,
    width: 390,
    height: 430,
    pointerEvents: 'none',
    zIndex: 0,
  },
  mailchimpFace: {
    position: 'absolute',
    left: 34,
    top: 72,
    width: 310,
    height: 310,
    borderRadius: '46% 54% 48% 52%',
    background: '#241c15',
    transform: 'rotate(2deg)',
  },
  mailchimpHat: {
    position: 'absolute',
    left: 126,
    top: 48,
    width: 156,
    height: 70,
    background: '#ff4d74',
    clipPath: 'polygon(50% 0, 100% 44%, 100% 74%, 0 74%, 0 44%)',
  },
  mailchimpEye: {
    position: 'absolute',
    top: 94,
    width: 72,
    height: 82,
    borderRadius: '50%',
    background: '#ffffff',
  },
  mailchimpSmile: {
    position: 'absolute',
    left: 96,
    top: 192,
    width: 128,
    height: 56,
    borderBottom: '12px solid #ffe01b',
    borderRadius: '0 0 110px 110px',
  },
  mailchimpCheek: {
    position: 'absolute',
    top: 206,
    width: 42,
    height: 18,
    borderRadius: 999,
    background: '#ff4d74',
    opacity: 0.78,
  },
  mailchimpWaveA: {
    position: 'absolute',
    left: 0,
    top: 84,
    width: 92,
    height: 28,
    borderBottom: '5px solid #241c15',
    borderRadius: '50%',
    transform: 'rotate(18deg)',
  },
  mailchimpWaveB: {
    position: 'absolute',
    right: 0,
    top: 246,
    width: 96,
    height: 30,
    borderBottom: '5px solid #241c15',
    borderRadius: '50%',
    transform: 'rotate(-10deg)',
  },
  headspaceWrap: {
    position: 'absolute',
    right: 300,
    top: 235,
    width: 360,
    height: 360,
    pointerEvents: 'none',
    zIndex: 0,
  },
  headspaceMascot: {
    position: 'absolute',
    inset: 22,
    borderRadius: '50%',
    background: '#f4a573',
    boxShadow: '0 20px 50px rgba(244,165,115,0.18)',
  },
  headspaceEye: {
    position: 'absolute',
    top: 130,
    width: 22,
    height: 22,
    borderRadius: '50%',
    background: '#1b3a47',
  },
  headspaceMouth: {
    position: 'absolute',
    left: 128,
    top: 180,
    width: 72,
    height: 36,
    borderBottom: '7px solid #1b3a47',
    borderRadius: '0 0 80px 80px',
  },
  headspaceSage: {
    position: 'absolute',
    left: 0,
    bottom: 26,
    width: 92,
    height: 92,
    borderRadius: '56% 44% 58% 42%',
    background: '#9db67a',
    opacity: 0.82,
  },
  headspaceLavender: {
    position: 'absolute',
    right: 4,
    top: 18,
    width: 76,
    height: 76,
    borderRadius: '50%',
    background: '#b0a5d1',
    opacity: 0.72,
  },
  notionWrap: {
    position: 'absolute',
    right: 240,
    top: 230,
    width: 420,
    height: 360,
    pointerEvents: 'none',
    zIndex: 0,
  },
  notionWindow: {
    position: 'absolute',
    inset: 20,
    border: '2px solid #37352f',
    background: '#f7f6f3',
    transform: 'rotate(3deg)',
    padding: 42,
  },
  notionLine: {
    width: 300,
    height: 18,
    marginBottom: 20,
    background: '#37352f',
    opacity: 0.15,
  },
  notionPlant: {
    position: 'absolute',
    right: 42,
    bottom: 36,
    width: 92,
    height: 116,
    borderBottom: '36px solid #ffedd5',
  },
  notionLeaf: {
    position: 'absolute',
    left: 18,
    top: 18,
    width: 42,
    height: 72,
    border: '3px solid #37352f',
    borderRadius: '50% 50% 50% 0',
    transform: 'rotate(28deg)',
  },
  rawWebStack: {
    position: 'absolute',
    right: 118,
    top: 210,
    width: 440,
    pointerEvents: 'none',
    zIndex: 1,
    fontFamily: 'Arial, sans-serif',
    fontSize: 25,
  },
  rawWebBlock: {
    height: 92,
    marginBottom: 16,
    border: '1px solid',
    padding: '18px 20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  mujiObject: {
    position: 'absolute',
    right: 310,
    top: 255,
    width: 250,
    height: 250,
    borderRadius: 2,
    background: '#ffffff',
    boxShadow: '0 20px 46px rgba(42,42,40,0.08)',
    pointerEvents: 'none',
    zIndex: 0,
  },
  mujiObjectTop: {
    position: 'absolute',
    left: 44,
    right: 44,
    top: 46,
    height: 1,
    background: '#d9d6cd',
  },
  appleProduct: {
    position: 'absolute',
    right: 260,
    top: 230,
    width: 330,
    height: 330,
    borderRadius: 48,
    background: 'linear-gradient(145deg, #ffffff, #f5f5f7)',
    boxShadow: '0 34px 90px rgba(0,0,0,0.08)',
    pointerEvents: 'none',
    zIndex: 0,
  },
  appleScreen: {
    position: 'absolute',
    inset: 22,
    borderRadius: 34,
    border: '1px solid #e5e5ea',
    background: 'linear-gradient(160deg, #f5f5f7, #ffffff)',
  },
  appleGlint: {
    position: 'absolute',
    right: 58,
    top: 52,
    width: 86,
    height: 160,
    borderRadius: 999,
    background: 'rgba(0,113,227,0.08)',
    filter: 'blur(8px)',
    transform: 'rotate(18deg)',
  },
  monocleRoot: {
    position: 'absolute',
    right: 188,
    top: 225,
    width: 520,
    height: 610,
    pointerEvents: 'none',
    zIndex: 0,
    fontFamily: '"Noto Serif SC", "Times New Roman", serif',
    color: '#1a1a1a',
  },
  monocleStat: {
    position: 'relative',
    display: 'inline-flex',
    flexDirection: 'column',
    width: 190,
    marginRight: 24,
    marginBottom: 22,
    borderTop: '3px solid',
    paddingTop: 12,
  },
  monoclePhoto: {
    position: 'absolute',
    left: 0,
    bottom: 0,
    width: 230,
    height: 265,
    border: '1px solid',
    background: 'linear-gradient(145deg, rgba(199,50,46,0.24), rgba(94,99,71,0.20))',
  },
  monocleFeature: {
    position: 'absolute',
    right: 0,
    bottom: 20,
    width: 245,
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    fontSize: 24,
    lineHeight: 1.08,
  },
  monocleFeatureStrong: {
    fontSize: 34,
  },
  posterMeta: {
    position: 'absolute',
    right: 94,
    top: 170,
    width: 260,
    pointerEvents: 'none',
    zIndex: 0,
  },
  posterNumber: {
    fontFamily: 'Arial, sans-serif',
    fontSize: 150,
    lineHeight: 0.85,
    fontWeight: 900,
    opacity: 0.88,
  },
  posterLine: {
    width: 210,
    height: 6,
    marginTop: 28,
    opacity: 0.8,
  },
};
