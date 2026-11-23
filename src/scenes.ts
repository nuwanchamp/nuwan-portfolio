import { parseLayoutMarkup, type LayoutNode } from '@encenlab/star-dust/core';

// Layout-mode scenes, written in star-dust's layout markup.
// Tags: Col, Row, Heading, Text, Button, Divider, Spacer, Image, List, Table, Quote, Code, MindMap.
// Button actions handled in App.tsx:
//   scene:<id>  → switch to another scene below
//   wave        → scatter everything back into the dust wave
//   scatter     → blow the current scene apart (it re-forms)
// TODO: replace the placeholder copy with your own.
const MARKUP = {
  // Intro: the logo forms first, then morphs into 'home' (timing in App.tsx INTRO).
  logo: `<Col gap="36" align="center" justify="center">
  <Image src="/logo.png" width="300" label="Nuwan C. Perera logo" />
  <Text size="sm" font="mono">LOADING ...</Text>
</Col>`,

  home: `<Row gap="34" align="center" justify="center">
<Image src="/nuwan.jpeg" width="260" height="260" blur="0" blurStyle="radial" />
<Col gap="18" align="start">
  <Heading size="xl">Hi! I'm Nuwan.</Heading>
  <Text width="420">
    I'm a software engineer and web developer with a passion for creating interactive experiences. I specialize in building responsive and user friendly web applications using modern technologies.
  </Text>
  <Spacer size="6" />
  <Divider length="220" />
  <Spacer size="6" />
  <Row gap="18" align="center">
    <Button action="scene:bio" variant="solid">Know More</Button>
    <Button action="scene:mindmap" variant="solid">Graph View</Button>
    <Button action="scene:projects">Projects</Button>
    <Button action="wave">Release</Button>
  </Row>
  <Spacer size="4" />
  <Row gap="16" align="center">
    <Image src="/icons/linkedin.png" width="16" height="16" label="LinkedIn" action="open:https://linkedin.com/in/nuwan-c-perera" />
    <Image src="/icons/github.png" width="16" height="16" label="GitHub" action="open:https://github.com/nuwanchamp" />
    <Image src="/icons/whatsapp.png" width="16" height="16" label="WhatsApp +971 52 261 8842" action="open:https://wa.me/971522618842" />
    <Image src="/icons/mail.svg" width="16" height="16" label="Email nuwanchamp02@gmail.com" action="open:mailto:nuwanchamp02@gmail.com" />
  </Row>
</Col></Row>`,

  // Full profile from the OKF bundle + generic resume (contact details and references left out).
  bio: `<Col gap="16" align="left">
  <Heading size="lg">Nuwan C. Perera</Heading>
  <Text>Senior Software Engineer | UAE, Sharjah</Text>
  <Quote width="820">
    Senior Software Engineer with 10+ years of experience building backend systems, APIs, and modern web applications with PHP (Symfony, Laravel), Python, React, and Vue.js. Strong track record leading project delivery, mentoring engineers, and driving measurable outcomes and productivity gain through better tooling and process. Comfortable working across the stack, from microservice architecture and CI/CD pipelines to production facing dashboards, with a consistent focus on modular design, testing discipline (TDD), and clean, maintainable code.
  </Quote>
  <Divider length="220" />

  <Heading size="md">Experience</Heading>
  <Col gap="4" align="start">
    <Heading size="sm">Senior Software Engineer - Strategic Partnership Solutions</Heading>
    <Text>May 2026 - Jul 2026 | Sri Lanka</Text>
    <Spacer size="4" />
    <List width="820">
        - Decoupled state tracking logic from three third party courier APIs (DHL, StarTrack, LBC) within a tightly coupled Laravel microservice, improving separation of concerns and extensibility.
        - Pioneered CI/CD pipeline introduction with automated test execution and code quality enforcement in a codebase with no prior pipeline infrastructure.
        - Revamped four Vue.js dashboards with improved data filtering and booking lifecycle visibility.
    </List>
  </Col>
  <Col gap="4" align="start">
    <Heading size="sm">Senior Software Engineer - Synergy Systems Pvt Ltd</Heading>
    <Text>Jun 2025 - May 2026 | Sri Lanka</Text>
    <Spacer size="4" />
    <List width="820">
        - Led the design and development of a plugin based framework for a Symfony 5 enterprise monitoring system using micro frontend and microservice architecture, centralizing 10+ features and improving release cycles by more than 40%.
        - Architected and developed a real time monitoring module for 5,000+ Cisco VoIP devices across multiple CUCM clusters using AXL/SXL APIs, with React based dashboards, improving monitoring productivity by 10%.
        - Refactored a legacy subnet scanning method into an installable, event driven module supporting SNMP and ESXi providers, reducing initial setup workload by over 30%.
        - Mentored junior engineers on modular architecture, microservices, and clean code principles, and delivered internal workshops on system design and debugging.
    </List>
  </Col>
  <Col gap="4" align="start">
    <Heading size="sm">Senior Software Engineer - Intervest Technologies (Pvt) Ltd</Heading>
    <Text>May 2023 - Jun 2025 | Sri Lanka</Text>
    <Spacer size="4" />
    <List width="820">
        - Worked as squad lead for multiple Laravel (8-11) services powering a transactional platform, leading sprint planning, task decomposition, and mentorship for mid and junior engineers.
        - Introduced Test Driven Development, semantic versioning, and release pipelines, decreasing errors and downtime in production.
        - Led the design of a manual policy renewal subsystem for a travel insurance platform, ensuring backward compatibility, modular architecture, and SOLID principles.
        - Implemented a logging subsystem and environment-based content comparison tool, improving debugging productivity for QA and developers by 15%.
    </List>
  </Col>
  <Col gap="4" align="start">
    <Heading size="sm">Senior Application Developer - Seneview Technologies (Pvt) Ltd</Heading>
    <Text>Feb 2017 - Mar 2023 | Sri Lanka</Text>
    <Spacer size="4" />
    <List width="820">
        - Led development of an intranet application using Flutter that contributed to a substantial revenue increase for a consulting firm.
        - Engineered a custom portal for a Purchasing Order System, significantly improving client productivity.
        - Built enterprise applications and Laravel packages, WordPress plugins, and UI components using Vue/React integrated with Laravel APIs.
        - Implemented automated testing workflows using PHPUnit, Selenium, and Postman.
        - Awarded Employee of the Month, 2017.
    </List>
  </Col>
  <Col gap="4" align="start">
    <Heading size="sm">Web Developer - Gloria Solutions (Pvt) Ltd</Heading>
    <Text>Nov 2015 - Dec 2016 | Sri Lanka</Text>
    <Spacer size="4" />
    <List width="820">
        - Developed websites using Bootstrap, PHP OOP, and the CakePHP framework, enhancing user experience and performance.
        - Designed and launched three informative websites using WordPress and Photoshop, significantly increasing brand visibility.
    </List>
  </Col>

  <Divider length="220" />
  <Heading size="md">Skills</Heading>
  <Table width="820">
    | Area | Skills |
    | :--- | :--- |
    | Backend | PHP (Expert), Symfony, Laravel, CakePHP, CodeIgniter, Python, Node.js |
    | Frontend | React.js, Vue.js, TypeScript, JavaScript, HTML5, Tailwind CSS, Alpine.js, Livewire |
    | Databases | MySQL, PostgreSQL, MongoDB, Redis |
    | Testing | PHPUnit, Pest, Laravel Dusk, Cypress, Selenium, Postman, TDD |
    | Architecture | Microservices, Plugin Frameworks, Event-Driven, Micro-Frontend, SOLID, DDD, Clean Architecture |
    | DevOps &amp; Cloud | Docker, CI/CD, Git, Shell, Linux, RHEL, AWS, GCP, Azure DevOps, Oracle Cloud |
    | Protocols &amp; APIs | REST, SOAP, SNMP, Cisco CUCM AXL/SXL |
  </Table>

  <Divider length="220" />
  <Heading size="md">Education</Heading>
  <List width="820">
    - BSc (Hons) Computing - Coventry University, UK (2024)
    - Diploma in Computer System Design - National Institute of Business Management, Sri Lanka (2015)
  </List>

  <Divider length="220" />
  <Heading size="md">Certifications</Heading>
  <List width="820">
    - One Million Prompters (Prompt Engineering) - Dubai Future Foundation (2026)
    - Generative AI - AWS (2025)
    - Career Essentials in GitHub Professional Certificate - GitHub / LinkedIn (2025)
    - Docker Foundation Professional Certificate - Docker / LinkedIn (2025)
    - Toastmaster Certification (Public Speaking) - Readers Toastmasters Club (2024)
  </List>

  <Spacer size="6" />
  <Row gap="16">
    <Button action="scene:home" variant="solid">Back</Button>
    <Button action="scene:mindmap">Graph View</Button>
  </Row>
</Col>`,
// Career graph built from the OKF profile (~/Documents/Obsidian Vault/OKF/OKF/My Profile).
  // Only nested <Branch> tags become nodes. Branches with collapsed="true" start folded and
  // open on click (star-dust handles that itself since 0.3.0).
  // Career graph from the OKF profile (~/Documents/Obsidian Vault/OKF/OKF/My Profile).
  // Tree layout: area → group → details. Branches with collapsed="true" start folded and open on
  // click; star-dust (0.3.0+) handles that and folds/pages anything that doesn't fit the screen.
  mindmap: `<Col gap="14" align="center">
  <MindMap id="okf" title="Nuwan C. Perera" layout="tree" ripple="pulse">
    <Branch label="Experience · 10+ yrs">
      <Branch label="Strategic Partnership Solutions · 2026" collapsed="true">
        <Branch label="Senior Software Engineer" />
        <Branch label="Highlights" collapsed="true">
          <Branch label="Courier APIs (DHL, StarTrack, LBC) behind adapters" />
          <Branch label="First CI/CD pipeline in the codebase" />
          <Branch label="4 Vue.js dashboards revamped" />
          <Branch label="Characterization tests before refactoring" />
        </Branch>
        <Branch label="Stack" collapsed="true">
          <Branch label="Laravel" />
          <Branch label="Vue.js" />
          <Branch label="MySQL" />
          <Branch label="PHPUnit" />
        </Branch>
      </Branch>
      <Branch label="Synergy Systems · 2025–26" collapsed="true">
        <Branch label="Senior Software Engineer" />
        <Branch label="Highlights" collapsed="true">
          <Branch label="Symfony plugin framework: 10+ features, 40% faster releases" />
          <Branch label="VoIP monitoring for 5,000+ Cisco devices" />
          <Branch label="Event-driven subnet scanner: 30% less setup" />
          <Branch label="Workshops on system design &amp; debugging" />
        </Branch>
        <Branch label="Stack" collapsed="true">
          <Branch label="Symfony 5" />
          <Branch label="React · TypeScript" />
          <Branch label="Python" />
          <Branch label="RHEL · Docker" />
          <Branch label="SNMP · AXL/SXL" />
        </Branch>
      </Branch>
      <Branch label="Intervest Technologies · 2023–25" collapsed="true">
        <Branch label="Senior Software Engineer · Squad Lead" />
        <Branch label="Highlights" collapsed="true">
          <Branch label="Led Laravel 8–12 services on a transactional platform" />
          <Branch label="Introduced TDD, semver &amp; release pipelines" />
          <Branch label="Policy renewal subsystem (travel insurance)" />
          <Branch label="Logging &amp; diff tools: 15% faster debugging" />
        </Branch>
        <Branch label="Stack" collapsed="true">
          <Branch label="Laravel" />
          <Branch label="PHPUnit · Pest" />
          <Branch label="Hotjar · Optimizely" />
        </Branch>
      </Branch>
      <Branch label="Seneview Technologies · 2017–23" collapsed="true">
        <Branch label="Senior Application Developer" />
        <Branch label="Highlights" collapsed="true">
          <Branch label="Flutter intranet app: revenue growth for a client" />
          <Branch label="Purchase order portal" />
          <Branch label="Laravel packages &amp; WordPress plugins" />
          <Branch label="Employee of the Month 2017" />
        </Branch>
        <Branch label="Stack" collapsed="true">
          <Branch label="Laravel" />
          <Branch label="Flutter · Dart" />
          <Branch label="Vue · React" />
          <Branch label="Shopify · WordPress" />
        </Branch>
      </Branch>
      <Branch label="Gloria Solutions · 2015–16" collapsed="true">
        <Branch label="Web Developer" />
        <Branch label="Highlights" collapsed="true">
          <Branch label="CakePHP websites" />
          <Branch label="3 WordPress brand sites" />
        </Branch>
        <Branch label="Stack" collapsed="true">
          <Branch label="PHP OOP · CakePHP" />
          <Branch label="Bootstrap" />
          <Branch label="WordPress" />
        </Branch>
      </Branch>
    </Branch>
    <Branch label="Skills" collapsed="true">
      <Branch label="Backend" collapsed="true">
        <Branch label="PHP (Expert)" />
        <Branch label="Symfony · Laravel" />
        <Branch label="Python · Node.js" />
        <Branch label="CakePHP · CodeIgniter" />
      </Branch>
      <Branch label="Frontend" collapsed="true">
        <Branch label="React · TypeScript" />
        <Branch label="Vue.js" />
        <Branch label="Tailwind · Alpine · Livewire" />
        <Branch label="Flutter · Dart" />
      </Branch>
      <Branch label="Data" collapsed="true">
        <Branch label="MySQL" />
        <Branch label="PostgreSQL" />
        <Branch label="MongoDB · Redis" />
      </Branch>
      <Branch label="DevOps &amp; Cloud" collapsed="true">
        <Branch label="Docker · CI/CD" />
        <Branch label="Linux · RHEL" />
        <Branch label="AWS · GCP" />
        <Branch label="Azure DevOps · Oracle Cloud" />
      </Branch>
      <Branch label="Testing" collapsed="true">
        <Branch label="PHPUnit · Pest" />
        <Branch label="Cypress · Selenium · Dusk" />
        <Branch label="TDD · Characterization tests" />
        <Branch label="Postman" />
      </Branch>
      <Branch label="Protocols &amp; APIs" collapsed="true">
        <Branch label="REST · SOAP" />
        <Branch label="SNMP" />
        <Branch label="Cisco CUCM AXL/SXL" />
      </Branch>
    </Branch>
    <Branch label="Architecture" collapsed="true">
      <Branch label="Patterns" collapsed="true">
        <Branch label="Microservices" />
        <Branch label="Plugin frameworks" />
        <Branch label="Event-driven" />
        <Branch label="Micro-frontends" />
        <Branch label="Adapter pattern" />
      </Branch>
      <Branch label="Principles" collapsed="true">
        <Branch label="SOLID · DRY · KISS" />
        <Branch label="Domain-Driven Design" />
        <Branch label="Clean Architecture" />
        <Branch label="Semantic versioning" />
      </Branch>
    </Branch>
    <Branch label="Leadership" collapsed="true">
      <Branch label="Squad lead at Intervest" />
      <Branch label="Mentoring junior &amp; mid engineers" />
      <Branch label="Sprint planning &amp; tech talks" />
      <Branch label="Agile · Scrum · Jira · ClickUp" />
      <Branch label="Languages" collapsed="true">
        <Branch label="English (fluent)" />
        <Branch label="Sinhala (native)" />
      </Branch>
    </Branch>
    <Branch label="Education" collapsed="true">
      <Branch label="BSc (Hons) Computing" collapsed="true">
        <Branch label="Coventry University, UK" />
        <Branch label="2020–2024, while working full-time" />
      </Branch>
      <Branch label="Diploma, Computer System Design" collapsed="true">
        <Branch label="NIBM, Sri Lanka" />
        <Branch label="2015" />
      </Branch>
    </Branch>
    <Branch label="Certifications" collapsed="true">
      <Branch label="One Million Prompters · 2026" />
      <Branch label="AWS Generative AI · 2025" />
      <Branch label="GitHub Professional · 2025" />
      <Branch label="Docker Foundation · 2025" />
      <Branch label="Toastmasters · 2024" />
    </Branch>
  </MindMap>
  <Row gap="16">
    <Button action="scene:home" variant="solid">Back</Button>
    <Button action="scene:bio">Full Profile</Button>
  </Row>
</Col>`,
  projects: `<Col gap="14" align="center">
  <Heading size="lg">Projects</Heading>
  <List width="820">
    - <Text>GitHub</Text>
  </List>
</Col>`,
} as const;

export type SceneId = keyof typeof MARKUP;

function parse(id: SceneId): LayoutNode | null {
  const { root, error } = parseLayoutMarkup(MARKUP[id]);
  if (error) console.warn(`[scenes] "${id}" line ${error.line}: ${error.message}`);
  return root;
}

export const SCENES: Record<SceneId, LayoutNode | null> = {
  logo: parse('logo'),
  home: parse('home'),
  bio: parse('bio'),
  mindmap: parse('mindmap'),
  projects: parse('projects'),
};

export function isSceneId(id: string): id is SceneId {
  return id in SCENES;
}
