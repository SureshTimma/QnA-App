import { PrismaClient } from '../src/generated/prisma';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

// Sample topics for questions
const SAMPLE_TOPICS = [
  'JavaScript',
  'React',
  'Node.js',
  'TypeScript',
  'Python',
  'MongoDB',
  'Next.js',
  'Web Development',
  'Database',
  'API',
  'CSS',
  'HTML',
  'Programming',
  'Software Engineering',
  'Frontend',
  'Backend',
  'Full Stack',
  'DevOps',
  'Machine Learning',
  'Data Science'
];

// Sample base64 image data (small placeholder images)
const SAMPLE_IMAGES = [
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAFklEQVR42mNkIB8wjiqkPFGNVEhZLAAAYgAWAAF8hCAAAABJRU5ErkJggg==',
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAGklEQVR42mP8/58BDVAwKqgMRiXg4vCXUQAA1wAqAP2qK/QAAAABJRU5ErkJggg=='
];

// Function to generate realistic programming-related questions
function generateQuestionTitle(): string {
  const questionTypes = [
    () => `How to ${faker.hacker.verb()} ${faker.hacker.noun()} in ${faker.helpers.arrayElement(['JavaScript', 'React', 'Node.js', 'Python'])}?`,
    () => `What is the best way to ${faker.hacker.verb()} ${faker.hacker.noun()}?`,
    () => `${faker.helpers.arrayElement(['Why', 'When', 'How'])} should I use ${faker.hacker.adjective()} ${faker.hacker.noun()}?`,
    () => `Problem with ${faker.hacker.noun()} ${faker.hacker.verb()}`,
    () => `${faker.helpers.arrayElement(['Understanding', 'Learning', 'Implementing'])} ${faker.hacker.noun()} in modern development`,
    () => `Best practices for ${faker.hacker.verb()} ${faker.hacker.noun()}`,
    () => `${faker.hacker.adjective()} ${faker.hacker.noun()} vs ${faker.hacker.adjective()} ${faker.hacker.noun()}`
  ];
  
  return faker.helpers.arrayElement(questionTypes)();
}

function generateQuestionDescription(): string {
  const descriptions = [
    () => `I'm working on a project where I need to ${faker.hacker.verb()} ${faker.hacker.noun()}. I've tried several approaches but I'm getting ${faker.helpers.arrayElement(['errors', 'unexpected results', 'performance issues', 'memory leaks'])}. 

Here's what I've attempted so far:
- ${faker.hacker.phrase()}
- ${faker.hacker.phrase()}

Any suggestions would be greatly appreciated!`,

    () => `I'm a ${faker.helpers.arrayElement(['beginner', 'student', 'junior developer'])} learning ${faker.helpers.arrayElement(SAMPLE_TOPICS)} and I'm confused about ${faker.hacker.noun()}. 

Could someone explain:
1. ${faker.hacker.phrase()}?
2. When should I use ${faker.hacker.adjective()} ${faker.hacker.noun()}?
3. What are the common pitfalls?

Thanks in advance!`,

    () => `I have a ${faker.helpers.arrayElement(['production', 'development', 'staging'])} environment where ${faker.hacker.noun()} is causing issues. The ${faker.hacker.adjective()} ${faker.hacker.noun()} seems to be ${faker.hacker.verb()} incorrectly.

Error details: ${faker.hacker.phrase()}

Has anyone encountered this before? Looking for solutions or workarounds.`,

    () => `Quick question about ${faker.hacker.noun()} implementation. I need to ${faker.hacker.verb()} ${faker.hacker.noun()} efficiently while maintaining ${faker.hacker.adjective()} performance.

Current approach: ${faker.hacker.phrase()}

Is there a better way to handle this?`
  ];

  return faker.helpers.arrayElement(descriptions)();
}

function generateAnswer(): string {
  const answers = [
    () => `Great question! I've dealt with this before. You should try ${faker.hacker.verb()} the ${faker.hacker.noun()} using ${faker.hacker.adjective()} approach.

Here's a solution that worked for me:
${faker.hacker.phrase()}

This should resolve your issue. Let me know if you need more clarification!`,

    () => `This is a common problem. The issue is usually related to ${faker.hacker.noun()} configuration.

Try this approach:
1. ${faker.hacker.phrase()}
2. Make sure to ${faker.hacker.verb()} the ${faker.hacker.noun()}
3. ${faker.hacker.phrase()}

Hope this helps!`,

    () => `I had the same issue last week. The solution is to ${faker.hacker.verb()} the ${faker.hacker.adjective()} ${faker.hacker.noun()}.

${faker.hacker.phrase()}

This should fix the problem you're experiencing.`,

    () => `You're on the right track! However, you might want to consider ${faker.hacker.verb()} the ${faker.hacker.noun()} differently.

${faker.hacker.phrase()}

This approach is more ${faker.hacker.adjective()} and should give you better results.`
  ];

  return faker.helpers.arrayElement(answers)();
}

async function createTopics() {
  console.log('🌱 Creating topics...');
  
  const topics = [];
  for (const topicName of SAMPLE_TOPICS) {
    const topic = await prisma.topics.create({
      data: {
        topicName
      }
    });
    topics.push(topic);
  }
  
  console.log(`✅ Created ${topics.length} topics`);
  return topics;
}

async function createUsers(count: number = 10) {
  console.log(`🌱 Creating ${count} users...`);
  
  const users = [];
  for (let i = 0; i < count; i++) {
    const user = await prisma.users.create({
      data: {
        email: faker.internet.email(),
        password: faker.internet.password(),
        username: faker.internet.username()
      }
    });
    users.push(user);
  }
  
  console.log(`✅ Created ${users.length} users`);
  return users;
}

async function createQuestions(users: any[], topics: any[], count: number = 50) {
  console.log(`🌱 Creating ${count} questions...`);
  
  const questions = [];
  for (let i = 0; i < count; i++) {
    // Random selection of 1-3 topics per question
    const selectedTopics = faker.helpers.arrayElements(
      topics.map(t => t.id), 
      { min: 1, max: 3 }
    );
    
    // 30% chance of having an image
    const hasImage = faker.datatype.boolean({ probability: 0.3 });
    
    const question = await prisma.questions.create({
      data: {
        title: generateQuestionTitle(),
        desc: generateQuestionDescription(),
        topics: selectedTopics,
        image: hasImage ? faker.helpers.arrayElement(SAMPLE_IMAGES) : null,
        userId: faker.helpers.arrayElement(users).id,
        createdAt: faker.date.between({ 
          from: new Date('2024-01-01'), 
          to: new Date() 
        }),
      }
    });
    questions.push(question);
  }
  
  console.log(`✅ Created ${questions.length} questions`);
  return questions;
}

async function createAnswers(users: any[], questions: any[], count: number = 150) {
  console.log(`🌱 Creating ${count} answers...`);
  
  const answers = [];
  for (let i = 0; i < count; i++) {
    const answer = await prisma.answers.create({
      data: {
        answer: generateAnswer(),
        likes: BigInt(faker.number.int({ min: 0, max: 50 })),
        questionId: faker.helpers.arrayElement(questions).id,
        userId: faker.helpers.arrayElement(users).id,
        createdAt: faker.date.between({ 
          from: new Date('2024-01-01'), 
          to: new Date() 
        }),
      }
    });
    answers.push(answer);
  }
  
  console.log(`✅ Created ${answers.length} answers`);
  return answers;
}

async function createLikes(users: any[], answers: any[], count: number = 200) {
  console.log(`🌱 Creating ${count} likes...`);
  
  const likes = [];
  const usedCombinations = new Set();
  
  for (let i = 0; i < count; i++) {
    let userId, answerId, combination;
    let attempts = 0;
    
    // Ensure unique user-answer combinations
    do {
      userId = faker.helpers.arrayElement(users).id;
      answerId = faker.helpers.arrayElement(answers).id;
      combination = `${userId}-${answerId}`;
      attempts++;
    } while (usedCombinations.has(combination) && attempts < 100);
    
    if (attempts >= 100) break; // Prevent infinite loop
    
    usedCombinations.add(combination);
    
    try {
      const like = await prisma.likes.create({
        data: {
          userId,
          answerId
        }
      });
      likes.push(like);
    } catch (error) {
      // Skip if unique constraint violation occurs
      console.log(`Skipped duplicate like combination: ${combination}`);
    }
  }
  
  console.log(`✅ Created ${likes.length} likes`);
  return likes;
}

async function main() {
  console.log('🚀 Starting database seeding...');
  
  try {
    // Clear existing data (optional - comment out if you want to keep existing data)
    console.log('🗑️  Clearing existing data...');
    await prisma.likes.deleteMany();
    await prisma.answers.deleteMany();
    await prisma.questions.deleteMany();
    await prisma.topics.deleteMany();
    await prisma.users.deleteMany();
    console.log('✅ Cleared existing data');
    
    // Create data in order (respecting foreign key constraints)
    const topics = await createTopics();
    const users = await createUsers(15); // Create 15 users
    const questions = await createQuestions(users, topics, 75); // Create 75 questions
    const answers = await createAnswers(users, questions, 200); // Create 200 answers
    const likes = await createLikes(users, answers, 300); // Create 300 likes
    
    console.log('🎉 Database seeding completed successfully!');
    console.log(`
📊 Summary:
   👥 Users: ${users.length}
   🏷️  Topics: ${topics.length}
   ❓ Questions: ${questions.length}
   💬 Answers: ${answers.length}
   👍 Likes: ${likes.length}
    `);
    
  } catch (error) {
    console.error('❌ Error during seeding:', error);
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
