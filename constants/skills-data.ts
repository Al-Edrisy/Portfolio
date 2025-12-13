
export interface Skill {
    name: string
    icon: string
    category: string
    proficiency: number
    description: string
    color: string
    featured?: boolean
}

export const skillCategories = [
    {
        title: "Frontend Development",
        description: "Modern user interfaces and experiences",
        color: "from-blue-500 to-cyan-500",
        skills: [
            {
                name: "React",
                icon: "/svg_tech_stack_icons/Frameworks/react-2.svg",
                category: "Frontend",
                proficiency: 93,
                description: "Building scalable React applications with modern hooks and patterns",
                color: "#61DAFB",
                featured: true
            },
            {
                name: "Next.js",
                icon: "/svg_tech_stack_icons/Frameworks/next-3.svg",
                category: "Frontend",
                proficiency: 89,
                description: "Full-stack React framework with SSR, SSG, and API routes",
                color: "#000000",
                featured: true
            },
            {
                name: "TypeScript",
                icon: "/svg_tech_stack_icons/Programming_Languages/typescript.svg",
                category: "Frontend",
                proficiency: 88,
                description: "Type-safe JavaScript for robust applications",
                color: "#3178C6",
                featured: true
            },
            {
                name: "Expo",
                icon: "/svg_tech_stack_icons/Frameworks/expo-go-app.svg",
                category: "Mobile",
                proficiency: 75,
                description: "Cross-platform mobile development with React Native",
                color: "#000020"
            },
            {
                name: "GSAP",
                icon: "/svg_tech_stack_icons/Animation/gsap-greensock.svg",
                category: "Animation",
                proficiency: 70,
                description: "Advanced web animations and interactions",
                color: "#88CE02"
            }
        ]
    },
    {
        title: "Backend & Infrastructure",
        description: "Scalable server-side solutions",
        color: "from-green-500 to-emerald-500",
        skills: [
            {
                name: "Node.js",
                icon: "/svg_tech_stack_icons/Programming_Languages/nodejs-1.svg",
                category: "Backend",
                proficiency: 95,
                description: "Server-side JavaScript runtime for scalable applications",
                color: "#339933",
                featured: true
            },
            {
                name: "Python",
                icon: "/svg_tech_stack_icons/Programming_Languages/python-5.svg",
                category: "Backend",
                proficiency: 95,
                description: "Versatile language for backend services and automation",
                color: "#3776AB",
                featured: true
            },
            {
                name: "C",
                icon: "/svg_tech_stack_icons/Programming_Languages/c.svg",
                category: "System Programming",
                proficiency: 80,
                description: "Low-level system programming and performance optimization",
                color: "#A8B9CC"
            },
            {
                name: "Swift",
                icon: "/svg_tech_stack_icons/Programming_Languages/swift-15.svg",
                category: "Mobile",
                proficiency: 70,
                description: "iOS native app development",
                color: "#FA7343"
            },
            {
                name: "Docker",
                icon: "/svg_tech_stack_icons/Tools_Services/docker-3.svg",
                category: "DevOps",
                proficiency: 82,
                description: "Containerization and orchestration",
                color: "#2496ED"
            }
        ]
    },
    {
        title: "Cloud & Databases",
        description: "Infrastructure and data management",
        color: "from-indigo-500 to-purple-500",
        skills: [
            {
                name: "Firebase",
                icon: "/svg_tech_stack_icons/Cloud_Infrastructure/firebase-2.svg",
                category: "Cloud",
                proficiency: 87,
                description: "Backend-as-a-Service for rapid app development",
                color: "#FFCA28",
                featured: true
            },
            {
                name: "PostgreSQL",
                icon: "/svg_tech_stack_icons/Databases/postgresql.svg",
                category: "Database",
                proficiency: 90,
                description: "Relational database design and optimization",
                color: "#336791",
                featured: true
            },
            {
                name: "AWS",
                icon: "/svg_tech_stack_icons/Cloud_Infrastructure/aws-2.svg",
                category: "Cloud",
                proficiency: 82,
                description: "Cloud infrastructure and deployment strategies",
                color: "#FF9900",
                featured: true
            },
            {
                name: "Google Cloud",
                icon: "/svg_tech_stack_icons/Cloud_Infrastructure/google-cloud-3.svg",
                category: "Cloud",
                proficiency: 75,
                description: "Google's cloud platform for scalable applications",
                color: "#4285F4"
            },
            {
                name: "MongoDB",
                icon: "/svg_tech_stack_icons/Databases/mongodb-icon-2.svg",
                category: "Database",
                proficiency: 75,
                description: "NoSQL database architecture and management",
                color: "#47A248"
            },
            {
                name: "MySQL",
                icon: "/svg_tech_stack_icons/Databases/mysql-logo-pure.svg",
                category: "Database",
                proficiency: 70,
                description: "Relational database management and optimization",
                color: "#4479A1"
            }
        ]
    },
    {
        title: "AI & Machine Learning",
        description: "Intelligent systems and automation",
        color: "from-purple-500 to-pink-500",
        skills: [
            {
                name: "OpenAI API",
                icon: "/svg_tech_stack_icons/AI_ML/openai-logo-1.svg",
                category: "AI",
                proficiency: 78,
                description: "AI integration and prompt engineering",
                color: "#412991",
                featured: true
            },
            {
                name: "TensorFlow",
                icon: "/svg_tech_stack_icons/Frameworks/tensorflow-2.svg",
                category: "ML",
                proficiency: 65,
                description: "Machine learning and deep learning framework",
                color: "#FF6F00"
            },
            {
                name: "PyTorch",
                icon: "/svg_tech_stack_icons/Frameworks/pytorch-2.svg",
                category: "ML",
                proficiency: 60,
                description: "Deep learning framework for research and production",
                color: "#EE4C2C"
            },
            {
                name: "Hugging Face",
                icon: "/svg_tech_stack_icons/AI_ML/huggingface-1.svg",
                category: "AI",
                proficiency: 65,
                description: "Transformer models and NLP pipelines",
                color: "#FFD21E"
            }
        ]
    },
    {
        title: "Development Tools",
        description: "Productivity and collaboration tools",
        color: "from-orange-500 to-red-500",
        skills: [
            {
                name: "GitHub",
                icon: "/svg_tech_stack_icons/Tools_Services/github-2.svg",
                category: "Version Control",
                proficiency: 87,
                description: "Collaborative development and CI/CD",
                color: "#181717",
                featured: true
            },
            {
                name: "Postman",
                icon: "/svg_tech_stack_icons/Tools_Services/postman.svg",
                category: "API Testing",
                proficiency: 80,
                description: "API development and testing platform",
                color: "#FF6C37"
            },
            {
                name: "Jenkins",
                icon: "/svg_tech_stack_icons/Tools_Services/jenkins-1.svg",
                category: "CI/CD",
                proficiency: 70,
                description: "Automated build and deployment pipelines",
                color: "#D24939"
            },
            {
                name: "Jira",
                icon: "/svg_tech_stack_icons/Tools_Services/jira-1.svg",
                category: "Project Management",
                proficiency: 75,
                description: "Agile project management and issue tracking",
                color: "#0052CC"
            },
            {
                name: "Slack",
                icon: "/svg_tech_stack_icons/Tools_Services/slack-new-logo.svg",
                category: "Communication",
                proficiency: 85,
                description: "Team communication and collaboration platform",
                color: "#4A154B"
            },
            {
                name: "Notion",
                icon: "/svg_tech_stack_icons/Tools_Services/notion-2.svg",
                category: "Documentation",
                proficiency: 80,
                description: "All-in-one workspace for notes and documentation",
                color: "#000000"
            }
        ]
    }
]
