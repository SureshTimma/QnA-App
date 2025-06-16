import { PrismaClient } from '../src/generated/prisma';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

// Predefined realistic Q&A scenarios
const QA_SCENARIOS = [
  {
    title: "How to handle async/await in React useEffect?",
    description: "I'm trying to fetch data in useEffect using async/await but getting warnings about missing dependencies. What's the correct way to handle asynchronous operations in useEffect?",
    topics: ['React', 'JavaScript'],
    answers: [
      "You should create an async function inside useEffect and call it immediately. Here's the pattern:\n\n```javascript\nuseEffect(() => {\n  const fetchData = async () => {\n    try {\n      const response = await fetch('/api/data');\n      const data = await response.json();\n      setData(data);\n    } catch (error) {\n      console.error(error);\n    }\n  };\n  \n  fetchData();\n}, []);\n```\n\nThis avoids the ESLint warnings and handles errors properly.",
      "Another approach is to use .then() chains if you prefer not to create inner functions:\n\n```javascript\nuseEffect(() => {\n  fetch('/api/data')\n    .then(response => response.json())\n    .then(data => setData(data))\n    .catch(error => console.error(error));\n}, []);\n```"
    ]
  },
  {
    title: "What's the difference between MongoDB and PostgreSQL?",
    description: "I'm choosing a database for my new project. Can someone explain the main differences between MongoDB and PostgreSQL? When should I use one over the other?",
    topics: ['MongoDB', 'Database'],
    answers: [
      "MongoDB is a NoSQL document database, while PostgreSQL is a relational SQL database. Here are the key differences:\n\n**MongoDB:**\n- Document-based (JSON-like)\n- Flexible schema\n- Horizontal scaling\n- Good for rapid development\n\n**PostgreSQL:**\n- Table-based with rows/columns\n- ACID compliance\n- Strong consistency\n- Better for complex queries\n\nChoose MongoDB for flexibility and rapid prototyping, PostgreSQL for complex relationships and strong consistency requirements.",
      "From my experience, if you're building an app with complex relationships and need ACID transactions, go with PostgreSQL. If you have varied data structures and need to scale horizontally quickly, MongoDB is great.\n\nAlso consider your team's expertise - SQL knowledge is more common than NoSQL."
    ]
  },
  {
    title: "Best practices for API design in Node.js?",
    description: "I'm building a REST API with Node.js and Express. What are the current best practices for structuring routes, error handling, and middleware?",
    topics: ['Node.js', 'API', 'Backend'],
    answers: [
      "Here are some key best practices:\n\n1. **Route Structure:**\n   - Use router modules\n   - Group related routes\n   - Use middleware for common functionality\n\n2. **Error Handling:**\n   - Centralized error handling middleware\n   - Consistent error response format\n   - Proper HTTP status codes\n\n3. **Validation:**\n   - Input validation with joi or yup\n   - Sanitize user input\n   - Rate limiting\n\n4. **Security:**\n   - Use helmet.js\n   - CORS configuration\n   - Authentication middleware",
      "Don't forget about:\n- API versioning (/api/v1/)\n- Request logging with morgan\n- Environment-based configuration\n- Proper database connection pooling\n- API documentation with Swagger\n\nAlso implement proper testing with Jest or Mocha."
    ]
  },
  {
    title: "TypeScript vs JavaScript for large projects?",
    description: "Our team is debating whether to migrate our large JavaScript project to TypeScript. What are the real-world benefits and drawbacks? Is it worth the migration effort?",
    topics: ['TypeScript', 'JavaScript'],
    answers: [
      "Having worked on both large JS and TS projects, here's my experience:\n\n**TypeScript Benefits:**\n- Catches errors at compile time\n- Better IDE support and autocomplete\n- Easier refactoring\n- Self-documenting code\n- Better team collaboration\n\n**Drawbacks:**\n- Initial learning curve\n- Additional build step\n- Third-party library types can be incomplete\n\nFor large projects, TypeScript is definitely worth it. The initial investment pays off in reduced bugs and easier maintenance.",
      "We migrated a 100k+ line codebase to TypeScript gradually. Key tips:\n\n1. Start with allowing JS files (.allowJs)\n2. Migrate module by module\n3. Use 'any' sparingly but don't be afraid of it initially\n4. Focus on public APIs first\n5. Set up strict mode gradually\n\nThe migration took 6 months but bug reports dropped by 40%."
    ]
  }
];

async function seedRealisticData() {
  console.log('🌱 Seeding realistic Q&A data...');
  
  // Get existing topics or create them
  const topics = await prisma.topics.findMany();
  const topicMap = new Map(topics.map(t => [t.topicName, t.id]));
  
  // Get existing users
  const users = await prisma.users.findMany();
  
  if (users.length === 0) {
    throw new Error('No users found. Please run the main seeder first.');
  }
  
  let questionsCreated = 0;
  let answersCreated = 0;
  
  for (const scenario of QA_SCENARIOS) {    // Find topic IDs for this scenario
    const scenarioTopicIds = scenario.topics
      .map(topicName => topicMap.get(topicName))
      .filter((id): id is string => Boolean(id));
    
    if (scenarioTopicIds.length === 0) {
      console.log(`Skipping scenario "${scenario.title}" - no matching topics found`);
      continue;
    }
    
    // Create question
    const question = await prisma.questions.create({
      data: {
        title: scenario.title,
        desc: scenario.description,
        topics: scenarioTopicIds,
        userId: faker.helpers.arrayElement(users).id,
        createdAt: faker.date.recent({ days: 30 }),
      }
    });
    questionsCreated++;
    
    // Create answers for this question
    for (const answerText of scenario.answers) {
      await prisma.answers.create({
        data: {
          answer: answerText,
          likes: BigInt(faker.number.int({ min: 5, max: 25 })),
          questionId: question.id,
          userId: faker.helpers.arrayElement(users).id,
          createdAt: faker.date.between({ 
            from: question.createdAt || new Date(), 
            to: new Date() 
          }),
        }
      });
      answersCreated++;
    }
  }
  
  console.log(`✅ Created ${questionsCreated} realistic questions and ${answersCreated} answers`);
}

async function main() {
  try {
    await seedRealisticData();
    console.log('🎉 Realistic data seeding completed!');
  } catch (error) {
    console.error('❌ Error during realistic seeding:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
