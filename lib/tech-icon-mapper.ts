/**
 * Tech Icon Mapper
 * Maps technology names to their corresponding SVG icon paths
 */

type TechIconMap = {
  [key: string]: string
}

// Comprehensive mapping of tech names (case-insensitive) to icon paths
const techIconMapping: TechIconMap = {
  // Programming Languages
  'typescript': '/svg_tech_stack_icons/Programming_Languages/typescript.svg',
  'ts': '/svg_tech_stack_icons/Programming_Languages/typescript.svg',
  'python': '/svg_tech_stack_icons/Programming_Languages/python-5.svg',
  'py': '/svg_tech_stack_icons/Programming_Languages/python-5.svg',
  'c': '/svg_tech_stack_icons/Programming_Languages/c.svg',
  'c++': '/svg_tech_stack_icons/Programming_Languages/c-1.svg',
  'cpp': '/svg_tech_stack_icons/Programming_Languages/c-1.svg',
  'node': '/svg_tech_stack_icons/Programming_Languages/nodejs-1.svg',
  'nodejs': '/svg_tech_stack_icons/Programming_Languages/nodejs-1.svg',
  'node.js': '/svg_tech_stack_icons/Programming_Languages/nodejs-1.svg',
  'swift': '/svg_tech_stack_icons/Programming_Languages/swift-15.svg',
  
  // Frameworks
  'react': '/svg_tech_stack_icons/Frameworks/react-2.svg',
  'reactjs': '/svg_tech_stack_icons/Frameworks/react-2.svg',
  'react.js': '/svg_tech_stack_icons/Frameworks/react-2.svg',
  'next': '/svg_tech_stack_icons/Frameworks/next-3.svg',
  'nextjs': '/svg_tech_stack_icons/Frameworks/next-3.svg',
  'next.js': '/svg_tech_stack_icons/Frameworks/next-3.svg',
  'expo': '/svg_tech_stack_icons/Frameworks/expo-go-app.svg',
  'pytorch': '/svg_tech_stack_icons/Frameworks/pytorch-2.svg',
  'tensorflow': '/svg_tech_stack_icons/Frameworks/tensorflow-2.svg',
  'tf': '/svg_tech_stack_icons/Frameworks/tensorflow-2.svg',
  'stripe': '/svg_tech_stack_icons/Frameworks/stripe-4.svg',
  
  // Databases
  'mongodb': '/svg_tech_stack_icons/Databases/mongodb-icon-2.svg',
  'mongo': '/svg_tech_stack_icons/Databases/mongodb-icon-2.svg',
  'mysql': '/svg_tech_stack_icons/Databases/mysql-logo-pure.svg',
  'postgresql': '/svg_tech_stack_icons/Databases/postgresql.svg',
  'postgres': '/svg_tech_stack_icons/Databases/postgresql.svg',
  
  // Cloud & Infrastructure
  'aws': '/svg_tech_stack_icons/Cloud_Infrastructure/aws-2.svg',
  'amazon web services': '/svg_tech_stack_icons/Cloud_Infrastructure/aws-2.svg',
  'firebase': '/svg_tech_stack_icons/Cloud_Infrastructure/firebase-2.svg',
  'gcp': '/svg_tech_stack_icons/Cloud_Infrastructure/google-cloud-3.svg',
  'google cloud': '/svg_tech_stack_icons/Cloud_Infrastructure/google-cloud-3.svg',
  
  // Tools & Services
  'docker': '/svg_tech_stack_icons/Tools_Services/docker-3.svg',
  'github': '/svg_tech_stack_icons/Tools_Services/github-2.svg',
  'git': '/svg_tech_stack_icons/Tools_Services/github-2.svg',
  'jenkins': '/svg_tech_stack_icons/Tools_Services/jenkins-1.svg',
  'jira': '/svg_tech_stack_icons/Tools_Services/jira-1.svg',
  'notion': '/svg_tech_stack_icons/Tools_Services/notion-2.svg',
  'postman': '/svg_tech_stack_icons/Tools_Services/postman.svg',
  'slack': '/svg_tech_stack_icons/Tools_Services/slack-new-logo.svg',
  
  // AI & ML
  'huggingface': '/svg_tech_stack_icons/AI_ML/huggingface-1.svg',
  'hugging face': '/svg_tech_stack_icons/AI_ML/huggingface-1.svg',
  'openai': '/svg_tech_stack_icons/AI_ML/openai-logo-1.svg',
  'chatgpt': '/svg_tech_stack_icons/AI_ML/openai-logo-1.svg',
  'gpt': '/svg_tech_stack_icons/AI_ML/openai-logo-1.svg',
  
  // Animation
  'gsap': '/svg_tech_stack_icons/Animation/gsap-greensock.svg',
  'greensock': '/svg_tech_stack_icons/Animation/gsap-greensock.svg',
  
  // Design
  'figma': '/svg_tech_stack_icons/Design/figma-icon.svg',
  
  // Hardware
  'arduino': '/svg_tech_stack_icons/Hardware/arduino-1.svg',
}

/**
 * Get the icon path for a given technology name
 * Case-insensitive matching
 * 
 * @param techName - The name of the technology
 * @returns The path to the SVG icon, or null if not found
 */
export function getTechIcon(techName: string): string | null {
  const normalized = techName.toLowerCase().trim()
  return techIconMapping[normalized] || null
}

/**
 * Check if an icon exists for a given technology
 * 
 * @param techName - The name of the technology
 * @returns true if an icon exists
 */
export function hasTechIcon(techName: string): boolean {
  return getTechIcon(techName) !== null
}

/**
 * Get tech icon with fallback to text
 * 
 * @param techName - The name of the technology
 * @returns Object with iconPath and displayName
 */
export function getTechIconOrText(techName: string): {
  iconPath: string | null
  displayName: string
  hasIcon: boolean
} {
  const iconPath = getTechIcon(techName)
  return {
    iconPath,
    displayName: techName,
    hasIcon: iconPath !== null
  }
}

/**
 * Get all available tech icons
 * 
 * @returns Array of all available tech names
 */
export function getAllAvailableTechs(): string[] {
  return Object.keys(techIconMapping)
}

