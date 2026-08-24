/* ============================================================
   STATE
   ============================================================ */
const output   = document.getElementById('output');
const input    = document.getElementById('cmdInput');
const terminal = document.getElementById('terminal');
const inputLine= document.getElementById('inputLine');

let cwd = '~';
let history = [];
let histIdx = -1;
let activeGame = null; // 'maze' or 'gap' when a game is running

/* ============================================================
   DATA
   ============================================================ */
const FS = {
  '~': {
    type: 'dir',
    children: ['about.txt', 'experience/', 'projects/', 'skills/', 'games/', 'contact.txt', 'resume.pdf'],
  },
  '~/experience': {
    type: 'dir',
    children: ['gemini.md', 'ciena.md', 'marsa.md', 'brainracers.md'],
  },
  '~/projects': {
    type: 'dir',
    children: ['sonar.md', 'echo.md', 'consensus.md'],
  },
  '~/skills': {
    type: 'dir',
    children: ['languages/', 'frameworks/', 'infra/', 'databases/'],
  },
  '~/games': {
    type: 'dir',
    children: ['maze-memory', 'thru-the-gap'],
  },
};

const FILES = {
  'about.txt': () => [
    { text: '' },
    { text: '  hey, i\'m lathu.', cls: 'bold white' },
    { text: '' },
    { html: '  <img class="about-logo" src="img/waterloo.png" alt="University of Waterloo" /> <span style="color:var(--white)">cs student @ university of waterloo (sept 2024 – apr 2028)</span>' },
    { text: '  just wrapped an internship at gemini in nyc, building real-time', cls: 'muted' },
    { text: '  trading infrastructure — websockets, grpc microservices,', cls: 'muted' },
    { text: '  cdn migrations, the whole deal.', cls: 'muted' },
    { text: '' },
    { text: '  i focus on building fast, reliable systems. i\'ve gone from', cls: 'muted' },
    { text: '  writing forex bots that secured real investment capital, to', cls: 'muted' },
    { text: '  optimizing packet processing at a telecom company, to shipping', cls: 'muted' },
    { text: '  production services at one of crypto\'s most trusted exchanges.', cls: 'muted' },
    { text: '' },
    { text: '  outside of work — shipping hackathon projects (3rd @ anthropic\'s', cls: 'muted' },
    { text: '  claude hackathon, finalist @ ramp\'s builder cup), building games,', cls: 'muted' },
    { text: '  and studying market microstructure.', cls: 'muted' },
    { text: '' },
  ],

  'contact.txt': () => [
    { text: '' },
    { html: '<div class="contact-item">email  <a href="mailto:l2thavar@uwaterloo.ca">l2thavar@uwaterloo.ca</a></div>' },
    { html: '<div class="contact-item">linkedin  <a href="https://linkedin.com/in/lathuthavarajah" target="_blank">linkedin.com/in/lathuthavarajah</a></div>' },
    { html: '<div class="contact-item">github  <a href="https://github.com/lathuthavarajah" target="_blank">github.com/lathuthavarajah</a></div>' },
    { text: '' },
  ],

  'resume.pdf': () => [
    { text: '' },
    { text: '  can\'t render a pdf in a terminal.', cls: 'yellow' },
    { text: '  → reach out at l2thavar@uwaterloo.ca for a copy.', cls: 'muted' },
    { text: '' },
  ],

  'gemini.md': () => [
    { html: buildExpCard(
      'Software Engineering Intern', 'Jan 2026 — May 2026',
      'Gemini · New York, NY',
      [
        'Led migration of NFT image and metadata serving from Cloudinary/Django to S3-backed CloudFront CDN, preserving ~6,000 smart contract URLs via DNS and on-chain metadata updates — saving ~$119K in annual spend.',
        'Rewrote a failing C++ candlestick service in Go, consuming live trades from Kafka and caching in Redis sorted sets with S3 historical fallback; added a batch gRPC endpoint consolidating three downstream API surfaces.',
        'Engineered a full-stack USD-to-ETH cashout system for non-US users during the Nifty Gateway shutdown, with hold-based accounting, on-chain settlement, eligibility gating, and notifications — covering ~$1M in user funds.',
      ],
      ['Go', 'gRPC', 'Kafka', 'Redis', 'AWS', 'CloudFront', 'S3', 'WebSockets', 'Docker'],
      'gemini'
    )},
  ],
  'ciena.md': () => [
    { html: buildExpCard(
      'Software Engineering Intern', 'May — Aug 2025',
      'Ciena Corporation · Burlington, MA',
      [
        'Applied TDD by automating unit tests for 44 BNG functions, achieving 85% code coverage on critical packet processing software.',
        'Tuned CMocka unit tests for ultra-fast networking code — tightened benchmarks and caught regressions early.',
        'Embedded LLMs into testing frameworks to accelerate root-cause analysis and streamline debugging workflows.',
      ],
      ['C/C++', 'CMocka', 'TDD', 'LLMs', 'Networking', 'Linux'],
      'ciena'
    )},
  ],
  'marsa.md': () => [
    { html: buildExpCard(
      'Software Development Intern', 'May — Aug 2024',
      'Marsa Software Solutions · Toronto, ON',
      [
        'Developed and live-demoed Python FOREX trading bots, directly contributing to $50,000 in secured investments.',
        'Engineered market analysis engines leveraging MACD, RSI, and custom risk management models for volatile conditions.',
        'Debugged latency bottlenecks in real-time API feeds, keeping execution tight when the market was not.',
      ],
      ['Python', 'FOREX', 'APIs', 'Algorithms', 'Risk Models'],
      'marsa'
    )},
  ],
  'brainracers.md': () => [
    { html: buildExpCard(
      'Core Development Volunteer', 'May — Aug 2025',
      'Brain Racers View Games',
      [
        'Built two cognitive bonus games (Maze Game + Thru the Gap) in TypeScript — Maze Game hit #1 trending at a regional esports event.',
        'Implemented progressive difficulty, collision detection, memory tracking, multiple lives, and responsive controls.',
        'Shipped a leaderboard with external DB, brand-consistent UI, and rigorous QA for a polished launch.',
      ],
      ['TypeScript', 'Game Dev', 'HTML/CSS', 'UI Design', 'Leaderboards'],
      'brainracers'
    )},
  ],

  'sonar.md': () => [
    { html: buildProjCard(
      'Sonar',
      'An engine catching cross-vendor cloud waste at the payment layer, where every vendor\'s invoice lands. Ships 4 detectors (z-score, OLS slope, tripwire, change-point) in DuckDB; OpenAI API drafts remediation. Selected as a finalist from 62 teams in the Save Money Save Time track at Ramp\'s Builder Cup Hackathon.',
      ['Python', 'DuckDB', 'Streamlit', 'OpenAI API', 'pandas', 'NumPy', 'pytest'],
      'Jul 2026',
      'https://github.com/JKLTCreations/ramp-sonar'
    )},
  ],
  'echo.md': () => [
    { html: buildProjCard(
      'Echo',
      'An internal Go CLI that detects documentation drift across GitHub, Confluence, and Linear by comparing PR timelines against doc freshness, then generates draft PRs and comments to keep docs in sync. Distributed via Homebrew with a Slack bot for daily drift reports, cron-scheduled staleness checks, and Claude MCP integration for context-aware update generation. Uses git activity history to auto-map repositories to their associated docs and team channels, filtering by developer ownership for zero-config onboarding.',
      ['Go', 'Claude MCP', 'GitHub', 'Confluence', 'Linear', 'Slack', 'Homebrew'],
      'May 2026'
    )},
  ],
  'consensus.md': () => [
    { html: buildProjCard(
      'Consensus',
      'Orchestrates 5 AI agents through a 4-round debate protocol with mandatory concessions and consensus synthesis. Built programmatic claim extraction, discrepancy detection, and web-search-based fact verification pipelines. Placed 3rd at Anthropic\'s Claude Hackathon, earning $500 in API credits for transparent policy analysis.',
      ['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'Anthropic Claude API', 'Node.js'],
      'Mar 2026',
      'https://github.com/JKLTCreations/consensus'
    )},
  ],
};

/* ============================================================
   HTML BUILDERS
   ============================================================ */
const LOGOS = {
  'gemini':      'img/gemini-color.svg',
  'ciena':       'img/ciena-color.svg',
  'marsa':       'img/marsa.png',
  'brainracers': null,
};

function buildExpCard(role, date, company, details, tags, logoKey) {
  const logo = logoKey && LOGOS[logoKey]
    ? `<img class="exp-logo" src="${LOGOS[logoKey]}" alt="${company}" />`
    : '';
  return `<div class="exp-card">
  <div class="exp-top">${logo}<div class="exp-top-text"><div class="exp-header"><span class="exp-role">${role}</span><span class="exp-date">${date}</span></div>
  <div class="exp-company">${company}</div></div></div>
  ${details.map(d => `<div class="exp-detail">${d}</div>`).join('')}
  <div class="exp-tags">${tags.map(t => `<span class="exp-tag">${t}</span>`).join('')}</div>
</div>`;
}

function buildProjCard(name, desc, tags, meta, url) {
  const link = url ? ` <a class="proj-link" href="${url}" target="_blank">repo →</a>` : '';
  const metaText = meta ? ` <span class="proj-meta">· ${meta}</span>` : '';
  return `<div class="proj-card">
  <div class="proj-name">${name}${link}${metaText}</div>
  <div class="proj-desc">${desc}</div>
  <div class="exp-tags">${tags.map(t => `<span class="exp-tag">${t}</span>`).join('')}</div>
</div>`;
}

/* skill bar colors */
function barColor(pct) {
  if (pct >= 85) return 'var(--green)';
  if (pct >= 70) return 'var(--cyan)';
  if (pct >= 55) return 'var(--purple)';
  return 'var(--orange)';
}

function buildSkillBars(skills) {
  return skills.map(([name, pct]) =>
    `<div class="skill-row">
      <span class="skill-label">${name}</span>
      <div class="skill-bar"><div class="skill-fill" data-w="${pct}" style="background:${barColor(pct)}"></div></div>
    </div>`
  ).join('');
}

const SKILL_DATA = {
  'languages': [['Python',90],['Go',82],['C/C++',80],['Rust',65],['JavaScript',80],['TypeScript',85],['Java',70],['Scala',55],['SQL',78],['HTML/CSS',88],['Racket',50]],
  'frameworks': [['React',85],['Node.js',80],['Flask',90],['Django',75],['Celery',65],['CMocka',70],['Datadog',80],['Linear',75]],
  'infra': [['AWS',85],['Docker',85],['Kubernetes',78],['Terraform',70],['Jenkins',72],['Harness',65],['Kafka',75],['Redis',78],['gRPC',78],['WebSocket',80],['REST',88]],
  'databases': [['MySQL',85],['PostgreSQL',82],['Titan II',60]],
};

/* ============================================================
   ASCII ART
   ============================================================ */
const BIG_NAME = [
  ' ██╗      █████╗ ████████╗██╗  ██╗██╗   ██╗',
  ' ██║     ██╔══██╗╚══██╔══╝██║  ██║██║   ██║',
  ' ██║     ███████║   ██║   ███████║██║   ██║',
  ' ██║     ██╔══██║   ██║   ██╔══██║██║   ██║',
  ' ███████╗██║  ██║   ██║   ██║  ██║╚██████╔╝',
  ' ╚══════╝╚═╝  ╚═╝   ╚═╝   ╚═╝  ╚═╝ ╚═════╝',
];

const BIG_LAST = [
  ' ████████╗██╗  ██╗ █████╗ ██╗   ██╗ █████╗ ██████╗  █████╗      ██╗ █████╗ ██╗  ██╗',
  ' ╚══██╔══╝██║  ██║██╔══██╗██║   ██║██╔══██╗██╔══██╗██╔══██╗     ██║██╔══██╗██║  ██║',
  '    ██║   ███████║███████║██║   ██║███████║██████╔╝███████║     ██║███████║███████║',
  '    ██║   ██╔══██║██╔══██║╚██╗ ██╔╝██╔══██║██╔══██╗██╔══██║██   ██║██╔══██║██╔══██║',
  '    ██║   ██║  ██║██║  ██║ ╚████╔╝ ██║  ██║██║  ██║██║  ██║╚█████╔╝██║  ██║██║  ██║',
  '    ╚═╝   ╚═╝  ╚═╝╚═╝  ╚═╝  ╚═══╝  ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝ ╚════╝ ╚═╝  ╚═╝╚═╝  ╚═╝',
];

/* ============================================================
   HELP
   ============================================================ */
function helpText() {
  return [
    { text: '' },
    { text: '  available commands:', cls: 'bold white' },
    { text: '' },
    { text: '  help              show this message', cls: 'muted' },
    { text: '  ls                list files in current directory', cls: 'muted' },
    { text: '  cd <dir>          change directory', cls: 'muted' },
    { text: '  cat <file>        read a file', cls: 'muted' },
    { text: '  pwd               print working directory', cls: 'muted' },
    { text: '  whoami            who am i?', cls: 'muted' },
    { text: '  skills            show all skills with bars', cls: 'muted' },
    { text: '  experience        show all work experience', cls: 'muted' },
    { text: '  projects          show all projects', cls: 'muted' },
    { text: '  contact           show contact info', cls: 'muted' },
    { text: '  tree              show full directory tree', cls: 'muted' },
    { text: '  play              pick a game to play', cls: 'muted' },
    { text: '  play maze         play maze memory game', cls: 'muted' },
    { text: '  play gap          play thru the gap', cls: 'muted' },
    { text: '  clear             clear the terminal', cls: 'muted' },
    { text: '  history           show command history', cls: 'muted' },
    { text: '  date              current date', cls: 'muted' },
    { text: '  echo <text>       echo text', cls: 'muted' },
    { text: '  sudo hire-lathu   try it', cls: 'muted' },
    { text: '' },
    { text: '  tip: use ↑/↓ arrows to navigate command history', cls: 'yellow' },
    { text: '' },
  ];
}

/* ============================================================
   RESOLVE PATH
   ============================================================ */
function resolve(path) {
  if (path === '~' || path === '/') return '~';
  if (path.startsWith('~/')) return path;
  if (path.startsWith('/')) return '~' + path;
  if (cwd === '~') return '~/' + path;
  return cwd + '/' + path;
}

function stripTrailingSlash(s) {
  return s.endsWith('/') ? s.slice(0, -1) : s;
}

function prettyDir(d) {
  return d === '~' ? '~' : d.replace('~/', '');
}

/* ============================================================
   PRINT HELPERS
   ============================================================ */
function print(lines) {
  for (const l of lines) {
    const div = document.createElement('div');
    div.classList.add('line');
    if (l.cls) l.cls.split(' ').forEach(c => div.classList.add(c));
    if (l.html) {
      div.innerHTML = l.html;
    } else {
      div.textContent = l.text ?? '';
    }
    output.appendChild(div);
  }
  scrollBottom();
  // animate any new skill bars
  requestAnimationFrame(() => {
    output.querySelectorAll('.skill-fill[data-w]').forEach(el => {
      const w = el.getAttribute('data-w');
      if (el.style.width === '0px' || el.style.width === '0%') {
        el.style.width = w + '%';
      }
    });
  });
}

function printPromptEcho(cmd) {
  const div = document.createElement('div');
  div.classList.add('line');
  div.innerHTML = `<span class="prompt-echo"><span class="user">lathu</span>@<span class="host">waterloo</span> <span class="dir">${prettyDir(cwd)}</span> <span class="dollar">$</span></span> <span class="cmd-echo">${escapeHtml(cmd)}</span>`;
  output.appendChild(div);
}

function escapeHtml(s) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function scrollBottom() {
  terminal.scrollTop = terminal.scrollHeight;
}

function updatePrompt() {
  document.querySelector('.input-line .dir').textContent = prettyDir(cwd);
}

/* ============================================================
   COMMAND EXECUTION
   ============================================================ */
function exec(raw) {
  const trimmed = raw.trim();
  if (!trimmed) { printPromptEcho(''); return; }

  history.push(trimmed);
  histIdx = history.length;
  printPromptEcho(trimmed);

  const parts = trimmed.split(/\s+/);
  const cmd = parts[0].toLowerCase();
  const args = parts.slice(1);

  switch (cmd) {
    case 'help': print(helpText()); break;
    case 'clear': cmdClear(); break;
    case 'pwd': print([{ text: cwd, cls: 'cyan' }]); break;
    case 'date': print([{ text: '  ' + new Date().toString(), cls: 'muted' }]); break;
    case 'whoami': print([
      { text: '' },
      { text: '  lathu thavarajah', cls: 'bold green' },
      { text: '  cs @ university of waterloo · 3x engineering intern', cls: 'muted' },
      { text: '  currently building real-time trading infra at gemini.', cls: 'muted' },
      { text: '' },
    ]); break;

    case 'echo':
      print([{ text: args.join(' ') || '' }]);
      break;

    case 'history':
      print(history.map((h, i) => ({ text: `  ${String(i + 1).padStart(4)}  ${h}`, cls: 'muted' })));
      break;

    case 'ls': cmdLs(args[0]); break;
    case 'cd': cmdCd(args[0]); break;
    case 'cat': cmdCat(args[0]); break;

    case 'tree': cmdTree(); break;
    case 'skills': cmdSkills(); break;
    case 'experience': cmdExperience(); break;
    case 'projects': cmdProjects(); break;
    case 'contact': cmdCat('contact.txt'); break;

    case 'play': cmdPlay(args[0]); break;

    case 'sudo':
      if (args.join(' ').toLowerCase() === 'hire-lathu') {
        print([
          { text: '' },
          { text: '  REQUEST APPROVED', cls: 'bold green' },
          { text: '' },
          { text: '  lathu has been added to the team.', cls: 'green' },
          { text: '  solid choice.', cls: 'muted' },
          { text: '' },
          { text: '  → send the offer to l2thavar@uwaterloo.ca', cls: 'cyan' },
          { text: '' },
        ]);
      } else {
        print([{ text: `  sudo: only "hire-lathu" is authorized.`, cls: 'red' }]);
      }
      break;

    case 'vim': case 'nano': case 'code':
      print([{ text: `  read-only filesystem.`, cls: 'yellow' }]);
      break;

    case 'rm':
      print([{ text: `  permission denied: read-only filesystem`, cls: 'red' }]);
      break;

    case 'exit':
      print([
        { text: '' },
        { text: '  thanks for visiting.', cls: 'green' },
        { text: '  → l2thavar@uwaterloo.ca if you want to chat.', cls: 'cyan' },
        { text: '' },
      ]);
      break;

    case 'npm':
      print([{ text: '  npm: not available in this environment.', cls: 'yellow' }]);
      break;

    case 'neofetch':
      print([{ text: '  did you mean: play', cls: 'yellow' }, { text: '  type "play" to see available games.', cls: 'muted' }]);
      break;

    case 'git':
      if (args[0] === 'log') {
        print([
          { text: '  * a78bfa2  (HEAD -> main) add websocket optimizations', cls: 'muted' },
          { text: '  * 34d399f  build grpc candlestick service', cls: 'muted' },
          { text: '  * fb923cc  migrate nft serving to cloudfront', cls: 'muted' },
          { text: '  * 22d3eef  initial commit: lathu.exe', cls: 'muted' },
        ]);
      } else {
        print([{ text: `  fatal: not a git repository`, cls: 'red' }]);
      }
      break;

    default:
      print([{ text: `  zsh: command not found: ${cmd}`, cls: 'red' }, { text: '  type "help" to see available commands', cls: 'muted' }]);
  }
}

/* ============================================================
   LS
   ============================================================ */
function cmdLs(arg) {
  const target = arg ? stripTrailingSlash(resolve(arg)) : cwd;
  const dir = FS[target];
  if (!dir) {
    print([{ text: `  ls: no such directory: ${arg || target}`, cls: 'red' }]);
    return;
  }
  const lines = [{ text: '' }];
  let html = '  ';
  for (const item of dir.children) {
    if (item.endsWith('/')) {
      html += `<span class="ls-item ls-dir">${item.slice(0, -1)}</span>`;
    } else if (item.endsWith('.pdf')) {
      html += `<span class="ls-item ls-exec">${item}</span>`;
    } else {
      html += `<span class="ls-item ls-file">${item}</span>`;
    }
  }
  lines.push({ html });
  lines.push({ text: '' });
  print(lines);
}

/* ============================================================
   CD
   ============================================================ */
function cmdCd(arg) {
  if (!arg || arg === '~') { cwd = '~'; updatePrompt(); return; }
  if (arg === '..') {
    if (cwd === '~') return;
    const parts = cwd.split('/');
    parts.pop();
    cwd = parts.join('/') || '~';
    updatePrompt();
    return;
  }
  const target = stripTrailingSlash(resolve(arg));
  if (FS[target]) {
    cwd = target;
    updatePrompt();
    cmdLs();
  } else {
    print([{ text: `  cd: no such directory: ${arg}`, cls: 'red' }]);
  }
}

/* ============================================================
   CAT
   ============================================================ */
function cmdCat(arg) {
  if (!arg) { print([{ text: '  usage: cat <filename>', cls: 'yellow' }]); return; }
  const filename = arg.includes('/') ? arg.split('/').pop() : arg;

  if (FILES[filename]) { print(FILES[filename]()); return; }
  for (const ext of ['.txt', '.md', '.pdf']) {
    if (FILES[filename + ext]) { print(FILES[filename + ext]()); return; }
  }
  print([{ text: `  cat: ${arg}: no such file`, cls: 'red' }]);
}

/* ============================================================
   TREE
   ============================================================ */
function cmdTree() {
  print([
    { text: '' },
    { text: '  ~/', cls: 'bold cyan' },
    { text: '  ├── about.txt', cls: 'white' },
    { text: '  ├── contact.txt', cls: 'white' },
    { text: '  ├── resume.pdf', cls: 'green' },
    { text: '  ├── experience/', cls: 'bold cyan' },
    { text: '  │   ├── gemini.md', cls: 'white' },
    { text: '  │   ├── ciena.md', cls: 'white' },
    { text: '  │   ├── marsa.md', cls: 'white' },
    { text: '  │   └── brainracers.md', cls: 'white' },
    { text: '  ├── projects/', cls: 'bold cyan' },
    { text: '  │   ├── sonar.md', cls: 'white' },
    { text: '  │   ├── echo.md', cls: 'white' },
    { text: '  │   └── consensus.md', cls: 'white' },
    { text: '  ├── games/', cls: 'bold cyan' },
    { text: '  │   ├── maze-memory', cls: 'green' },
    { text: '  │   └── thru-the-gap', cls: 'green' },
    { text: '  └── skills/', cls: 'bold cyan' },
    { text: '      ├── languages/', cls: 'cyan' },
    { text: '      ├── frameworks/', cls: 'cyan' },
    { text: '      ├── infra/', cls: 'cyan' },
    { text: '      └── databases/', cls: 'cyan' },
    { text: '' },
    { text: '  5 directories, 12 files', cls: 'muted' },
    { text: '' },
  ]);
}

/* ============================================================
   SKILLS
   ============================================================ */
function cmdSkills() {
  const lines = [{ text: '' }];
  for (const [cat, skills] of Object.entries(SKILL_DATA)) {
    lines.push({ html: `<div style="color:var(--purple);font-weight:700;margin:12px 0 6px">  ${cat}/</div>` });
    lines.push({ html: buildSkillBars(skills) });
  }
  lines.push({ text: '' });
  print(lines);
}

/* ============================================================
   EXPERIENCE
   ============================================================ */
function cmdExperience() {
  print([{ text: '' }]);
  for (const f of ['gemini.md', 'ciena.md', 'marsa.md', 'brainracers.md']) print(FILES[f]());
  print([{ text: '' }]);
}

/* ============================================================
   PROJECTS
   ============================================================ */
function cmdProjects() {
  print([{ text: '' }]);
  print(FILES['sonar.md']());
  print(FILES['echo.md']());
  print(FILES['consensus.md']());
  print([{ text: '' }]);
}

/* ============================================================
   CLEAR — keep the splash header
   ============================================================ */
let splashHTML = '';

function cmdClear() {
  output.innerHTML = '';
  if (splashHTML) {
    const div = document.createElement('div');
    div.innerHTML = splashHTML;
    output.appendChild(div);
  }
}

/* ============================================================
   PLAY COMMAND — game picker
   ============================================================ */
function cmdPlay(arg) {
  if (!arg) {
    print([
      { text: '' },
      { html: '  <span style="color:var(--purple);font-weight:700;font-size:1rem">games i built</span>' },
      { text: '  these shipped in production for brain racers view games.', cls: 'muted' },
      { text: '  maze game hit #1 trending at a regional esports event.', cls: 'muted' },
      { text: '' },
      { html: `<div class="game-picker">
        <div class="game-option" onclick="exec('play maze')">
          <div class="game-option-icon" style="font-size:1.2rem;color:var(--accent);font-weight:700">[1]</div>
          <div class="game-option-info">
            <div class="game-option-name">maze memory</div>
            <div class="game-option-desc">memorize the path, then recreate it. grids get bigger. lives are limited.</div>
            <div class="game-option-hint">play maze</div>
          </div>
        </div>
        <div class="game-option" onclick="exec('play gap')">
          <div class="game-option-icon" style="font-size:1.2rem;color:var(--accent);font-weight:700">[2]</div>
          <div class="game-option-info">
            <div class="game-option-name">thru the gap</div>
            <div class="game-option-desc">dodge falling walls. speed increases. gaps shrink. survive as long as you can.</div>
            <div class="game-option-hint">play gap</div>
          </div>
        </div>
      </div>` },
      { text: '' },
    ]);
    return;
  }

  const game = arg.toLowerCase();
  if (game === 'maze' || game === 'maze-memory') {
    launchMazeGame();
  } else if (game === 'gap' || game === 'thru-the-gap') {
    launchGapGame();
  } else {
    print([{ text: `  unknown game: ${arg}. try "play maze" or "play gap"`, cls: 'red' }]);
  }
}

/* ============================================================
   MAZE MEMORY GAME
   ============================================================ */
function launchMazeGame() {
  activeGame = 'maze';
  inputLine.style.display = 'none';

  const LEVELS = [
    { grid: 4, time: 3000 }, { grid: 4, time: 3000 },
    { grid: 5, time: 2500 }, { grid: 5, time: 2500 }, { grid: 5, time: 2500 },
    { grid: 6, time: 2000 }, { grid: 6, time: 2000 },
    { grid: 7, time: 2000 }, { grid: 7, time: 2000 },
    { grid: 8, time: 1800 },
  ];

  let level = 0, lives = 3, clickIdx = 0;
  let path = [], showing = false;

  const wrapper = document.createElement('div');
  wrapper.className = 'game-container';
  wrapper.innerHTML = `
    <div class="maze-header">
      <span class="maze-title">maze memory</span>
      <span class="maze-lives" id="mazeLives"></span>
      <span class="maze-level" id="mazeLevel"></span>
      <button class="maze-quit" id="mazeQuit">esc to quit</button>
    </div>
    <div class="maze-status" id="mazeStatus">memorize the path...</div>
    <div class="maze-grid" id="mazeGrid"></div>
  `;
  output.appendChild(wrapper);
  scrollBottom();

  const grid = wrapper.querySelector('#mazeGrid');
  const status = wrapper.querySelector('#mazeStatus');
  const livesEl = wrapper.querySelector('#mazeLives');
  const levelEl = wrapper.querySelector('#mazeLevel');
  const quitBtn = wrapper.querySelector('#mazeQuit');

  function quit() {
    activeGame = null;
    inputLine.style.display = 'flex';
    input.focus();
    print([{ text: '  game exited.', cls: 'muted' }]);
  }
  quitBtn.onclick = quit;

  function updateHUD() {
    livesEl.textContent = Array(lives).fill('●').join(' ');
    levelEl.textContent = `level ${level + 1}/10`;
  }

  function genPath(size) {
    const p = [];
    let r = Math.floor(Math.random() * size);
    p.push({ r, c: 0 });
    for (let c = 1; c < size; c++) {
      const moves = [r];
      if (r > 0) moves.push(r - 1);
      if (r < size - 1) moves.push(r + 1);
      r = moves[Math.floor(Math.random() * moves.length)];
      p.push({ r, c });
    }
    return p;
  }

  function buildGrid(size) {
    grid.innerHTML = '';
    grid.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        const cell = document.createElement('div');
        cell.className = 'maze-cell';
        cell.dataset.r = r;
        cell.dataset.c = c;
        cell.onclick = () => cellClick(r, c, cell);
        grid.appendChild(cell);
      }
    }
  }

  function getCell(r, c) {
    return grid.querySelector(`.maze-cell[data-r="${r}"][data-c="${c}"]`);
  }

  function startLevel() {
    const { grid: size, time } = LEVELS[level];
    clickIdx = 0;
    showing = true;
    path = genPath(size);
    buildGrid(size);
    updateHUD();
    status.textContent = 'watch the path...';
    status.style.color = 'var(--yellow)';

    // reveal path cell by cell
    let i = 0;
    const revealTimer = setInterval(() => {
      if (i < path.length) {
        const cell = getCell(path[i].r, path[i].c);
        cell.classList.add('maze-path');
        i++;
      } else {
        clearInterval(revealTimer);
        // hold for memory time
        setTimeout(() => {
          grid.querySelectorAll('.maze-path').forEach(c => c.classList.remove('maze-path'));
          showing = false;
          status.textContent = 'now recreate it! click the cells in order.';
          status.style.color = 'var(--cyan)';
        }, time);
      }
    }, 350);
  }

  function cellClick(r, c, cell) {
    if (showing || activeGame !== 'maze') return;
    const expected = path[clickIdx];
    if (r === expected.r && c === expected.c) {
      cell.classList.add('maze-correct');
      clickIdx++;
      if (clickIdx === path.length) {
        // level complete
        status.textContent = 'correct.';
        status.style.color = 'var(--green)';
        level++;
        if (level >= LEVELS.length) {
          status.textContent = 'all 10 levels cleared.';
          setTimeout(quit, 2500);
          return;
        }
        setTimeout(startLevel, 1200);
      }
    } else {
      cell.classList.add('maze-wrong');
      lives--;
      updateHUD();
      // flash correct path
      path.forEach(p => getCell(p.r, p.c).classList.add('maze-flash'));
      if (lives <= 0) {
        status.textContent = `game over — made it to level ${level + 1}`;
        status.style.color = 'var(--red)';
        setTimeout(quit, 2000);
      } else {
        status.textContent = `wrong! lost a life. watch again...`;
        status.style.color = 'var(--red)';
        setTimeout(startLevel, 1800);
      }
    }
  }

  // escape key to quit
  function escHandler(e) {
    if (e.key === 'Escape' && activeGame === 'maze') {
      document.removeEventListener('keydown', escHandler);
      quit();
    }
  }
  document.addEventListener('keydown', escHandler);

  startLevel();
}

/* ============================================================
   THRU THE GAP GAME
   ============================================================ */
function launchGapGame() {
  activeGame = 'gap';
  inputLine.style.display = 'none';

  const wrapper = document.createElement('div');
  wrapper.className = 'game-container';
  wrapper.innerHTML = `
    <div class="maze-header" style="max-width:760px">
      <span class="maze-title">thru the gap</span>
      <span id="gapScore" style="color:var(--green)">score: 0</span>
      <span id="gapSpeed" style="color:var(--cyan)">speed: 1x</span>
      <span id="gapTimer" style="color:var(--muted)">0:00</span>
      <button class="maze-quit" id="gapQuit">esc to quit</button>
    </div>
    <div class="gap-info" id="gapInfo">use ← → arrow keys or mouse to move. dodge the walls!</div>
    <canvas id="gapCanvas" width="760" height="480"></canvas>
  `;
  output.appendChild(wrapper);
  scrollBottom();

  const canvas = wrapper.querySelector('#gapCanvas');
  const ctx = canvas.getContext('2d');
  const scoreEl = wrapper.querySelector('#gapScore');
  const speedEl = wrapper.querySelector('#gapSpeed');
  const timerEl = wrapper.querySelector('#gapTimer');
  const infoEl = wrapper.querySelector('#gapInfo');
  const quitBtn = wrapper.querySelector('#gapQuit');

  const W = canvas.width, H = canvas.height;
  const PLAYER_SIZE = 20;
  const SPEEDS = [2, 3, 5, 7, 9, 12, 15, 19, 23, 28, 34, 40];
  const MAX_TIME = 120; // 2 minutes

  let playerX = W / 2;
  let walls = [];
  let score = 0, speedTier = 0, startTime = 0, elapsed = 0;
  let keys = { left: false, right: false };
  let mouseX = null;
  let running = false, dead = false, won = false;
  let retries = 1;
  let raf;

  function quit() {
    running = false;
    activeGame = null;
    cancelAnimationFrame(raf);
    inputLine.style.display = 'flex';
    input.focus();
    print([{ text: '  game exited.', cls: 'muted' }]);
  }
  quitBtn.onclick = quit;

  function gapWidth() {
    const base = 180;
    const min = 32;
    return Math.max(min, base - elapsed * 1.1);
  }

  function spawnWall() {
    const gw = gapWidth();
    const gapX = Math.random() * (W - gw - 20) + 10;
    walls.push({ y: -12, gapX, gapW: gw, scored: false });
  }

  function start() {
    playerX = W / 2;
    walls = [];
    score = 0; speedTier = 0; elapsed = 0; dead = false; won = false;
    startTime = performance.now();
    running = true;
    infoEl.textContent = 'use ← → arrow keys or mouse to dodge the walls!';
    infoEl.style.color = 'var(--muted)';
    spawnWall();
    loop();
  }

  function loop() {
    if (!running) return;
    const now = performance.now();
    elapsed = (now - startTime) / 1000;

    // speed tier
    speedTier = Math.min(SPEEDS.length - 1, Math.floor(elapsed / 8));
    const speed = SPEEDS[speedTier];

    // time check
    if (elapsed >= MAX_TIME) {
      won = true;
      running = false;
      drawEndScreen('survived. 120s cleared.', 'var(--green)');
      setTimeout(quit, 2500);
      return;
    }

    // move player
    if (mouseX !== null) {
      playerX += (mouseX - playerX) * 0.15;
    }
    if (keys.left) playerX -= 5;
    if (keys.right) playerX += 5;
    playerX = Math.max(PLAYER_SIZE / 2, Math.min(W - PLAYER_SIZE / 2, playerX));

    // update walls
    for (const w of walls) w.y += speed;

    // spawn
    const last = walls[walls.length - 1];
    if (!last || last.y > 180) spawnWall();

    // collision + scoring
    for (const w of walls) {
      if (!w.scored && w.y > H - 40) {
        w.scored = true;
        score += Math.floor(speedTier * 1.5) + 1;
      }
      // collision
      const py = H - 30;
      if (w.y > py - PLAYER_SIZE && w.y < py + PLAYER_SIZE) {
        const inGap = playerX > w.gapX + 8 && playerX < w.gapX + w.gapW - 8;
        if (!inGap) {
          dead = true;
          running = false;
          if (retries > 0) {
            retries--;
            drawEndScreen(`hit — score: ${score}. press enter to retry.`, 'var(--orange)');
          } else {
            drawEndScreen(`game over — final score: ${score}`, 'var(--red)');
            setTimeout(quit, 2500);
          }
          return;
        }
      }
    }

    // remove offscreen walls
    walls = walls.filter(w => w.y < H + 20);

    // HUD
    const m = Math.floor(elapsed / 60), s = Math.floor(elapsed % 60);
    scoreEl.textContent = `score: ${score}`;
    speedEl.textContent = `speed: ${speedTier + 1}x`;
    timerEl.textContent = `${m}:${String(s).padStart(2, '0')}`;

    draw();
    raf = requestAnimationFrame(loop);
  }

  function draw() {
    // bg
    ctx.fillStyle = '#0d1117';
    ctx.fillRect(0, 0, W, H);

    // subtle grid lines
    ctx.strokeStyle = 'rgba(146,180,204,.025)';
    ctx.lineWidth = 1;
    for (let x = 0; x < W; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
    for (let y = 0; y < H; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

    // walls
    for (const w of walls) {
      const grad = ctx.createLinearGradient(0, w.y, W, w.y);
      grad.addColorStop(0, '#1e2229');
      grad.addColorStop(0.5, '#282e38');
      grad.addColorStop(1, '#1e2229');
      ctx.fillStyle = grad;
      ctx.shadowColor = 'rgba(146,180,204,.15)';
      ctx.shadowBlur = 6;
      ctx.fillRect(0, w.y, w.gapX, 10);
      ctx.fillRect(w.gapX + w.gapW, w.y, W - w.gapX - w.gapW, 10);
      ctx.shadowBlur = 0;
      // gap edge glow
      ctx.fillStyle = 'rgba(146,180,204,.3)';
      ctx.fillRect(w.gapX - 1, w.y, 2, 10);
      ctx.fillRect(w.gapX + w.gapW - 1, w.y, 2, 10);
    }

    // player
    const py = H - 30;
    ctx.shadowColor = '#92b4cc';
    ctx.shadowBlur = 14;
    ctx.fillStyle = '#92b4cc';
    ctx.fillRect(playerX - PLAYER_SIZE / 2, py - PLAYER_SIZE / 2, PLAYER_SIZE, PLAYER_SIZE);
    ctx.shadowBlur = 0;
    // player trail
    ctx.fillStyle = 'rgba(146,180,204,.06)';
    ctx.fillRect(playerX - PLAYER_SIZE / 2, py + PLAYER_SIZE / 2, PLAYER_SIZE, 6);

    // gap width indicator
    ctx.fillStyle = '#5a6170';
    ctx.font = '10px JetBrains Mono';
    ctx.fillText(`gap: ${Math.round(gapWidth())}px`, 8, H - 6);
  }

  function drawEndScreen(msg, color) {
    ctx.fillStyle = 'rgba(8,12,21,0.88)';
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = color;
    ctx.font = '700 16px JetBrains Mono';
    ctx.textAlign = 'center';
    ctx.fillText(msg, W / 2, H / 2);
    ctx.textAlign = 'start';
  }

  // controls
  function keyHandler(e) {
    if (activeGame !== 'gap') return;
    if (e.key === 'Escape') {
      document.removeEventListener('keydown', keyHandler);
      document.removeEventListener('keyup', keyUpHandler);
      quit();
      return;
    }
    if (e.key === 'ArrowLeft') { keys.left = true; e.preventDefault(); }
    if (e.key === 'ArrowRight') { keys.right = true; e.preventDefault(); }
    if (e.key === 'Enter' && dead && retries >= 0) {
      dead = false;
      start();
    }
  }
  function keyUpHandler(e) {
    if (e.key === 'ArrowLeft') keys.left = false;
    if (e.key === 'ArrowRight') keys.right = false;
  }
  document.addEventListener('keydown', keyHandler);
  document.addEventListener('keyup', keyUpHandler);

  canvas.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
  });
  canvas.addEventListener('mouseleave', () => { mouseX = null; });

  start();
}

/* ============================================================
   INPUT HANDLING
   ============================================================ */
input.addEventListener('keydown', e => {
  if (activeGame) return; // don't process input while game is running
  if (e.key === 'Enter') {
    const val = input.value;
    input.value = '';
    exec(val);
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    if (histIdx > 0) { histIdx--; input.value = history[histIdx]; }
  } else if (e.key === 'ArrowDown') {
    e.preventDefault();
    if (histIdx < history.length - 1) { histIdx++; input.value = history[histIdx]; }
    else { histIdx = history.length; input.value = ''; }
  } else if (e.key === 'Tab') {
    e.preventDefault();
    autocomplete();
  } else if (e.key === 'l' && e.ctrlKey) {
    e.preventDefault();
    output.innerHTML = '';
  }
});

// always focus input
terminal.addEventListener('click', () => { if (!activeGame) input.focus(); });
document.addEventListener('keydown', (e) => {
  if (!activeGame && !e.ctrlKey && !e.metaKey && !e.altKey && e.key.length === 1) {
    input.focus();
  }
});

/* ============================================================
   TAB AUTOCOMPLETE
   ============================================================ */
function autocomplete() {
  const val = input.value;
  const parts = val.split(/\s+/);
  const last = parts[parts.length - 1];
  if (!last) return;

  if (parts.length === 1) {
    const cmds = ['help','ls','cd','cat','pwd','whoami','skills','experience','projects','contact','tree','play','clear','history','date','echo','exit','sudo'];
    const match = cmds.filter(c => c.startsWith(last));
    if (match.length === 1) { input.value = match[0] + ' '; }
    return;
  }

  // play subcommands
  if (parts[0] === 'play') {
    const games = ['maze', 'gap'];
    const match = games.filter(g => g.startsWith(last));
    if (match.length === 1) { parts[parts.length - 1] = match[0]; input.value = parts.join(' '); }
    return;
  }

  const dir = FS[cwd];
  if (!dir) return;
  const matches = dir.children.filter(c => c.replace('/','').startsWith(last.replace('/','')));
  if (matches.length === 1) {
    parts[parts.length - 1] = matches[0];
    input.value = parts.join(' ');
  }
}

/* ============================================================
   BOOT SEQUENCE
   ============================================================ */
function boot() {
  inputLine.style.display = 'none';

  const seq = [
    { delay: 80,  lines: [{ text: '  [boot] initializing lathu.exe...', cls: 'muted' }] },
    { delay: 300, lines: [{ text: '  [boot] loading internships ██████████ done', cls: 'muted' }] },
    { delay: 480, lines: [{ text: '  [boot] loading projects ████████████ done', cls: 'muted' }] },
    { delay: 640, lines: [{ text: '  [boot] loading skills ██████████████ done', cls: 'muted' }] },
    { delay: 800, lines: [{ text: '  [boot] loading games █████████████░ done', cls: 'muted' }] },
    { delay: 950, lines: [{ text: '' }] },

    // big ASCII name
    { delay: 1050, lines: BIG_NAME.map(l => ({ html: `<span class="ascii-big">${l}</span>` })) },
    { delay: 1100, lines: BIG_LAST.map(l => ({ html: `<span class="ascii-big last">${l}</span>` })) },
    { delay: 1150, lines: [{ text: '' }] },

    // tagline
    { delay: 1250, lines: [
      { html: '  <span style="color:var(--green)">software engineer</span> · <span style="color:var(--cyan)">cs @ university of waterloo</span> · <span style="color:var(--orange)">based in nyc</span>' },
    ]},
    { delay: 1350, lines: [{ text: '' }] },

    // separator
    { delay: 1450, lines: [
      { html: '  <span style="color:var(--border)">──────────────────────────────────────────────────────</span>' },
    ]},
    { delay: 1550, lines: [{ text: '' }] },

    // quick start
    { delay: 1600, lines: [
      { html: '  <span style="color:var(--muted)">  ┌──</span> <span style="color:var(--purple);font-weight:700">quick start</span>' },
      { html: '  <span style="color:var(--muted)">  │</span>' },
      { html: '  <span style="color:var(--muted)">  ├─</span> <span style="color:var(--yellow)">experience</span>  <span style="color:var(--muted)">─── work history</span>' },
      { html: '  <span style="color:var(--muted)">  ├─</span> <span style="color:var(--yellow)">projects</span>    <span style="color:var(--muted)">─── things i\'ve built</span>' },
      { html: '  <span style="color:var(--muted)">  ├─</span> <span style="color:var(--yellow)">skills</span>      <span style="color:var(--muted)">─── languages, frameworks, infra</span>' },
      { html: '  <span style="color:var(--muted)">  ├─</span> <span style="color:var(--yellow)">play</span>        <span style="color:var(--muted)">─── interactive games i shipped</span>' },
      { html: '  <span style="color:var(--muted)">  ├─</span> <span style="color:var(--yellow)">contact</span>     <span style="color:var(--muted)">─── reach out</span>' },
      { html: '  <span style="color:var(--muted)">  └─</span> <span style="color:var(--yellow)">help</span>        <span style="color:var(--muted)">─── all commands</span>' },
    ]},
    { delay: 1800, lines: [{ text: '' }] },
    { delay: 1900, lines: [
      { html: '  <span style="color:var(--green)">→</span> <span style="color:var(--muted)">type a command below or just start exploring. tab to autocomplete.</span>' },
    ]},
    { delay: 1950, lines: [{ text: '' }] },
  ];

  // track which lines are part of the "splash" (before the quick start menu)
  const splashEnd = 6; // after the separator line + blank, ascii + tagline

  let idx = 0;
  function next() {
    if (idx >= seq.length) {
      // save everything up to the tagline as the persistent splash
      const lines = output.querySelectorAll('.line');
      let html = '';
      // grab the ASCII name + tagline (boot lines 0-5 are boot msgs, 6-7 are ascii, 8 blank, 9 tagline, 10 blank)
      for (let i = 0; i < lines.length; i++) {
        const txt = lines[i].textContent;
        // stop after the separator line
        if (txt.includes('──────────────')) { html += lines[i].outerHTML; break; }
        html += lines[i].outerHTML;
      }
      splashHTML = html;
      inputLine.style.display = 'flex';
      input.focus();
      return;
    }
    const step = seq[idx];
    const prev = idx > 0 ? seq[idx - 1].delay : 0;
    const wait = step.delay - prev;
    setTimeout(() => {
      print(step.lines);
      idx++;
      next();
    }, wait);
  }
  next();
}

boot();
