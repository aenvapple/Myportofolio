export interface PortfolioProfile {
  name: string;
  role: string;
  subtitles: string[];
  tagline: string;
  bio: string;
  status: string;
  location: string;
  email: string;
  github: string;
  linkedin: string;
}

export const PORTFOLIO_PROFILE: PortfolioProfile = {
  name: 'Evan Chandra Maulana',
  role: 'Informatics Engineer & Creative Technologist',
  subtitles: ['INFORMATICS', 'CREATIVE', 'DIGITAL'],
  tagline: 'Bridging engineering rigor, real-time 3D graphics, and thoughtful digital craft.',
  bio: 'Passionate developer and informatics graduate focused on creating immersive web experiences, robust full-stack software, and interactive digital interfaces.',
  status: 'Available for Opportunities',
  location: 'Indonesia // Global Remote',
  email: 'archielz911@gmail.com',
  github: 'https://github.com',
  linkedin: 'https://linkedin.com',
};

export const PORTFOLIO_PROJECTS = [
  {
    title: 'EVAN.OS Archipelago',
    category: 'Interactive 3D Simulation',
    tech: ['React', 'TypeScript', 'Three.js', 'Web Audio API'],
    description: 'An open-exploration 3D portfolio world featuring third-person avatar mechanics, real-time lighting, and responsive UI.',
  },
  {
    title: 'Quantum Analytics Terminal',
    category: 'Full-Stack Data Platform',
    tech: ['Next.js', 'FastAPI', 'PostgreSQL', 'Tailwind'],
    description: 'Real-time telemetry and metrics visualization dashboard designed for high-density monitoring systems.',
  },
  {
    title: 'Neural Art Studio',
    category: 'Creative AI & WebGL',
    tech: ['GLSL Shaders', 'WebGPU', 'TensorFlow.js', 'Canvas API'],
    description: 'Generative algorithmic canvas rendering real-time procedural patterns and mathematical abstractions.',
  },
  {
    title: 'OmniFlow Task Engine',
    category: 'Productivity Application',
    tech: ['React', 'Zustand', 'Node.js', 'Docker'],
    description: 'Minimalist keyboard-first productivity hub with offline-first synchronization and event telemetry.',
  },
];

export const PORTFOLIO_SKILLS = [
  {
    category: 'Languages & Core',
    skills: ['TypeScript', 'JavaScript (ESNext)', 'Python', 'C++', 'SQL', 'HTML5/CSS3'],
  },
  {
    category: 'Frontend & 3D Web',
    skills: ['React 19', 'Three.js', 'WebGL / Shaders', 'Tailwind CSS', 'Vite', 'Motion'],
  },
  {
    category: 'Backend & Cloud',
    skills: ['Node.js / Express', 'FastAPI', 'PostgreSQL', 'RESTful APIs', 'Docker', 'Google Cloud Platform'],
  },
  {
    category: 'Creative & Design',
    skills: ['UI/UX Design', 'Low-Poly 3D Modeling', 'Figma', 'System Architecture', 'Procedural Audio'],
  },
];

export const PORTFOLIO_EXPERIENCE = [
  {
    period: '2023 – Present',
    role: 'Full-Stack Software Engineer & Creative Developer',
    company: 'Independent / Digital Studio',
    description: 'Designing and developing high-performance web applications, interactive 3D client experiences, and robust API backends.',
  },
  {
    period: '2022 – 2023',
    role: 'Frontend Engineering Specialist',
    company: 'Technology Solutions Lab',
    description: 'Architected modular design systems, optimized client-side rendering bottlenecks, and implemented reactive dashboards.',
  },
  {
    period: '2020 – 2022',
    role: 'Informatics Research & Development Fellow',
    company: 'University Informatics Lab',
    description: 'Conducted exploratory research in computer graphics, algorithmic data modeling, and web-based visualization tools.',
  },
];

export const PORTFOLIO_EDUCATION = [
  {
    degree: 'Bachelor of Science in Informatics / Computer Science',
    institution: 'University Informatics Institute',
    period: '2019 – 2023',
    focus: 'Specialization in Software Engineering, Computer Graphics, and Distributed Systems.',
  },
  {
    degree: 'Continuous Professional Research',
    institution: 'Open-Source & Independent Labs',
    period: '2023 – Present',
    focus: 'Deep dive into Real-Time 3D, WebGPU, Generative Systems, and Spatial Interface Design.',
  },
];
