import 'dotenv/config.js';
import Career from '../models/Career.js';
import sequelize from '../config/database.js';

const careerOptions = `
Software Developer
Software Engineer
Application Developer
Frontend Developer
Backend Developer
Full-Stack Developer
Web Developer
Web Application Developer
Website Developer
Mobile App Developer
iOS Developer
Android Developer
Cross-Platform Mobile Developer
Flutter Developer
React Native Developer
JavaScript Developer
TypeScript Developer
React Developer
Angular Developer
Vue.js Developer
Node.js Developer
PHP Developer
Python Developer
Java Developer
C Developer
C++ Developer
C# Developer
Go Developer
Rust Developer
Ruby Developer
Swift Developer
Kotlin Developer
Scala Developer
Perl Developer
R Developer
MATLAB Developer
SQL Developer
Database Developer
Database Engineer
API Developer
SDK Developer
Desktop Application Developer
Enterprise Software Developer
Systems Software Developer
Systems Programmer
Software Architect
Principal Software Engineer
Embedded Software Engineer
Firmware Engineer
Embedded Systems Engineer
Operating Systems Developer
Kernel Developer
Device Driver Developer
Linux Systems Developer
Windows Software Developer
macOS Developer
Browser Developer
Browser Engine Engineer
Web Platform Engineer
Web Performance Engineer
Web Accessibility Engineer
E-commerce Developer
WordPress Developer
Shopify Developer
CMS Developer
Salesforce Developer
ServiceNow Developer
SharePoint Developer
ERP Developer
CRM Developer
SAP Developer
Game Developer
Game Programmer
Gameplay Programmer
Game Engine Programmer
Game Physics Programmer
Game AI Programmer
Graphics Programmer
Rendering Engineer
Game Tools Programmer
Game UI Programmer
Multiplayer Game Developer
Game Network Programmer
Unity Developer
Unreal Engine Developer
Console Game Developer
PC Game Developer
Mobile Game Developer
Indie Game Developer
VR Developer
AR Developer
XR Developer
Virtual Reality Engineer
Augmented Reality Engineer
Simulation Developer
AI Engineer
Artificial Intelligence Developer
AI Software Engineer
Machine Learning Engineer
Deep Learning Engineer
Generative AI Engineer
LLM Engineer
AI Agent Developer
AI Applications Developer
AI Infrastructure Engineer
AI Platform Engineer
AI Research Engineer
Machine Learning Research Engineer
Natural Language Processing Engineer
Computer Vision Engineer
Speech Recognition Engineer
Reinforcement Learning Engineer
Robotics AI Engineer
AI Inference Engineer
Model Optimization Engineer
MLOps Engineer
Data Scientist
Data Engineer
Big Data Engineer
Data Platform Engineer
Data Infrastructure Engineer
Analytics Engineer
Data Warehouse Developer
ETL Developer
Data Pipeline Engineer
Data Integration Developer
Streaming Data Engineer
Real-Time Data Engineer
Distributed Data Systems Engineer
Scientific Programmer
Scientific Software Engineer
Computational Scientist
Statistical Programmer
Bioinformatics Programmer
Computational Biology Software Engineer
Geospatial Software Developer
GIS Developer
Quantitative Developer
Financial Software Engineer
Algorithmic Trading Developer
Blockchain Developer
Smart Contract Developer
Web3 Developer
Cryptocurrency Software Developer
Distributed Ledger Engineer
Cybersecurity Software Engineer
Application Security Engineer
Product Security Engineer
Security Tools Developer
Security Software Developer
Penetration Tester
Ethical Hacker
Vulnerability Researcher
Exploit Developer
Malware Analyst
Malware Researcher
Reverse Engineer
Security Automation Engineer
DevSecOps Engineer
Cryptography Engineer
Security Research Engineer
Firmware Security Engineer
Cloud Security Engineer
Detection Engineer
Digital Forensics Developer
Identity and Access Management Engineer
Cloud Engineer
Cloud Software Engineer
Cloud Infrastructure Engineer
Cloud Platform Engineer
DevOps Engineer
Site Reliability Engineer
Platform Engineer
Infrastructure Software Engineer
Infrastructure Automation Engineer
Build Engineer
Release Engineer
CI/CD Engineer
Automation Engineer
Infrastructure as Code Engineer
Kubernetes Engineer
Container Platform Engineer
Production Engineer
Observability Engineer
Reliability Software Engineer
Network Automation Engineer
Distributed Systems Engineer
Systems Engineer
Network Software Engineer
Telecommunications Software Engineer
Embedded Systems Developer
Robotics Software Engineer
Robotics Engineer
Autonomous Systems Engineer
Autonomous Vehicle Software Engineer
Self-Driving Car Software Engineer
Automotive Software Engineer
Avionics Software Engineer
Drone Software Engineer
IoT Developer
IoT Firmware Engineer
Hardware Software Integration Engineer
FPGA Programmer
Digital Design Engineer
Semiconductor Software Engineer
Real-Time Systems Engineer
Control Systems Software Engineer
Industrial Automation Programmer
PLC Programmer
Manufacturing Software Engineer
Aerospace Software Engineer
Satellite Software Engineer
Medical Software Engineer
Healthcare Software Developer
Medical Device Software Engineer
Bioinformatics Software Engineer
Pharmaceutical Software Developer
Computational Chemistry Developer
EdTech Software Developer
Educational Software Developer
E-learning Developer
FinTech Software Engineer
Banking Software Developer
Insurance Software Developer
Legal Technology Developer
Government Software Developer
Defense Software Engineer
Geospatial Software Engineer
GIS Software Engineer
Mapping Software Developer
Weather Software Developer
Climate Modeling Software Engineer
Energy Software Engineer
Renewable Energy Software Developer
Scientific Instrument Software Engineer
CAD Software Developer
CAM Software Developer
CAE Software Developer
3D Graphics Software Engineer
Computer Graphics Engineer
Visualization Developer
Image Processing Engineer
Audio Software Engineer
Digital Signal Processing Engineer
Video Software Engineer
Multimedia Software Developer
Streaming Software Engineer
Media Systems Engineer
Search Engine Engineer
Information Retrieval Engineer
Recommendation Systems Engineer
Personalization Engineer
Search Infrastructure Engineer
Performance Engineer
Software Optimization Engineer
Compiler Engineer
Programming Language Engineer
Programming Language Designer
Language Runtime Engineer
Interpreter Developer
Static Analysis Engineer
Formal Methods Engineer
Developer Tools Engineer
Developer Experience Engineer
Internal Tools Developer
Productivity Tools Engineer
Low-Level Software Engineer
High-Performance Computing Engineer
Parallel Computing Engineer
GPU Software Engineer
CUDA Developer
Quantum Computing Software Engineer
Quantum Algorithm Developer
Test Automation Engineer
Software Development Engineer in Test
QA Automation Engineer
Software Test Engineer
Quality Assurance Engineer
Performance Test Engineer
Reliability Test Engineer
Mobile Test Automation Engineer
Security Test Engineer
Test Infrastructure Engineer
Software Validation Engineer
Software Verification Engineer
API Test Engineer
Game QA Tester
Application Support Engineer
Production Support Engineer
Software Maintenance Engineer
Integration Engineer
Systems Integration Developer
Middleware Developer
Middleware Engineer
Messaging Systems Engineer
Microservices Engineer
Backend Infrastructure Engineer
Transaction Processing Engineer
Payment Systems Developer
Identity Platform Engineer
Authentication Engineer
Authorization Systems Engineer
API Platform Engineer
Database Reliability Engineer
Storage Systems Engineer
File Systems Engineer
Networking Systems Programmer
Protocol Engineer
Network Stack Developer
WebRTC Engineer
Telecommunications Protocol Developer
5G Software Engineer
Wireless Software Engineer
Cloud Networking Engineer
Distributed Storage Engineer
Data Replication Engineer
Cache Systems Engineer
Memory Systems Engineer
Virtualization Engineer
Hypervisor Developer
Firmware Validation Engineer
Embedded Test Engineer
Hardware Verification Engineer
ASIC Software Engineer
Electronic Design Automation Software Engineer
Robotics Controls Programmer
Robot Simulation Engineer
Human-Robot Interaction Developer
Industrial Robotics Programmer
Warehouse Robotics Software Engineer
Computer Vision Robotics Engineer
Autonomous Drone Engineer
Game Server Engineer
Game Backend Engineer
Game Infrastructure Engineer
Game Network Engineer
Game Monetization Engineer
Game Analytics Engineer
Game Engine Tools Developer
Procedural Generation Programmer
Animation Systems Programmer
Character Systems Programmer
Technical Artist Programmer
Graphics Pipeline Engineer
Shader Programmer
Physics Simulation Engineer
Virtual Production Software Engineer
Metaverse Developer
Spatial Computing Developer
Digital Twin Software Engineer
AR/VR Systems Engineer
Wearable Technology Developer
Smart Home Software Developer
Smart Device Software Engineer
Automotive Infotainment Developer
Vehicle Control Software Engineer
Electric Vehicle Software Engineer
Battery Management Software Engineer
Flight Simulation Developer
Spacecraft Software Engineer
Mission Control Software Engineer
Radar Software Engineer
Sonar Software Engineer
Defense Simulation Developer
Cyber-Physical Systems Engineer
Robotics Perception Engineer
Machine Learning Infrastructure Engineer
AI Data Engineer
AI Evaluation Engineer
AI Safety Engineer
AI Alignment Research Engineer
Prompt Engineering Specialist
LLM Application Developer
Retrieval-Augmented Generation Engineer
Conversational AI Developer
Chatbot Developer
Voice AI Engineer
AI Product Engineer
AI Solutions Engineer
AI Systems Architect
Data Labeling Tools Engineer
Model Serving Engineer
Neural Network Compiler Engineer
Edge AI Engineer
TinyML Engineer
Recommendation Algorithm Engineer
Fraud Detection Engineer
Risk Modeling Developer
Financial Modeling Software Engineer
Trading Systems Engineer
Quantitative Research Developer
High-Frequency Trading Engineer
Banking Infrastructure Engineer
Financial Data Engineer
Payment Infrastructure Engineer
Regulatory Technology Developer
Blockchain Infrastructure Engineer
Blockchain Protocol Engineer
Decentralized Application Developer
Web3 Infrastructure Engineer
Smart Contract Auditor
Cryptocurrency Wallet Developer
Distributed Consensus Engineer
Tokenization Platform Developer
Enterprise Integration Developer
Business Intelligence Developer
Reporting Developer
Dashboard Developer
Low-Code Platform Developer
No-Code Platform Developer
Workflow Automation Developer
Robotic Process Automation Developer
RPA Engineer
Business Application Developer
Custom Software Developer
SaaS Developer
SaaS Platform Engineer
Multi-Tenant Systems Engineer
Subscription Platform Developer
Customer Data Platform Engineer
Marketing Technology Developer
AdTech Software Engineer
Search Advertising Engineer
Recommendation Platform Engineer
E-commerce Platform Engineer
Retail Software Developer
Supply Chain Software Engineer
Logistics Software Developer
Warehouse Management Software Developer
Transportation Software Engineer
Fleet Management Software Developer
Mapping and Navigation Engineer
Travel Technology Developer
Hospitality Software Developer
Restaurant Technology Developer
Property Technology Developer
Real Estate Software Developer
Construction Software Engineer
Architecture Software Developer
Agricultural Software Engineer
Precision Agriculture Developer
Farm Automation Engineer
Environmental Software Engineer
Conservation Technology Developer
Oceanographic Software Engineer
Earth Observation Software Engineer
Remote Sensing Software Developer
Astronomy Software Developer
Astrophysics Software Engineer
Laboratory Automation Engineer
Clinical Software Developer
Electronic Health Records Developer
Health Data Engineer
Medical Imaging Software Engineer
Medical AI Engineer
Genomics Software Engineer
Clinical Trials Software Developer
Digital Therapeutics Developer
Accessibility Software Engineer
Assistive Technology Developer
Speech Technology Engineer
Natural Language Generation Engineer
Translation Technology Developer
Localization Engineer
Computational Linguist
Digital Humanities Developer
Educational Games Developer
Learning Platform Engineer
Learning Analytics Engineer
Assessment Software Developer
Content Platform Engineer
Digital Publishing Developer
Content Management Engineer
Video Game Tools Engineer
Animation Software Developer
Film Production Software Engineer
Visual Effects Software Engineer
Rendering Pipeline Developer
Digital Audio Workstation Developer
Music Technology Software Engineer
Audio Plugin Developer
Game Audio Programmer
Broadcasting Software Engineer
Live Streaming Developer
Video Encoding Engineer
Video Compression Engineer
Image Compression Engineer
Computer Vision Research Engineer
Computational Photography Engineer
Camera Software Engineer
Printer Software Engineer
Scanner Software Engineer
Robotics Research Engineer
Scientific Computing Engineer
Numerical Methods Software Engineer
Mathematical Software Developer
Optimization Software Engineer
Operations Research Software Developer
Simulation and Modeling Engineer
Research Software Engineer
Open-Source Software Developer
Open-Source Maintainer
Developer Advocate
Developer Relations Engineer
Developer Educator
Programming Instructor
Coding Bootcamp Instructor
Computer Science Teacher
Software Engineering Manager
Engineering Manager
Director of Software Engineering
Director of Engineering
Vice President of Engineering
Chief Technology Officer
Technical Lead
Team Lead Developer
Staff Software Engineer
Senior Software Engineer
Junior Software Engineer
Associate Software Developer
Software Consultant
Independent Software Contractor
Freelance Programmer
Freelance Web Developer
Freelance App Developer
Solutions Architect
Software Solutions Engineer
Technical Solutions Engineer
Sales Engineer for Developer Tools
Field Software Engineer
Customer Engineer
Implementation Engineer
Technical Support Developer
Software Product Engineer
Product-Minded Software Engineer
Startup Software Engineer
Founding Engineer
Technical Co-Founder
Software Entrepreneur
Developer Platform Consultant
`.trim().split('\n').map((description) => description.trim());

const seedCareers = async () => {
    try {
        await sequelize.authenticate();

        const existingCareers = await Career.findAll({
            attributes: ['description'],
            raw: true,
        });
        const existingDescriptions = new Set(
            existingCareers.map(({ description }) =>
                description.trim().toLocaleLowerCase(),
            ),
        );
        const missingCareers = careerOptions
            .filter(
                (description) =>
                    !existingDescriptions.has(description.toLocaleLowerCase()),
            )
            .map((description) => ({ description }));

        if (missingCareers.length > 0) {
            await Career.bulkCreate(missingCareers);
        }

        console.log(
            `Career seed complete: added ${missingCareers.length} of ${careerOptions.length} options.`,
        );
    } finally {
        await sequelize.close();
    }
};

seedCareers().catch((error) => {
    console.error('Career seed failed:', error);
    process.exitCode = 1;
});
