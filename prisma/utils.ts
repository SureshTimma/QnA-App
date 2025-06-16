import { PrismaClient } from '../src/generated/prisma';

const prisma = new PrismaClient();

async function clearDatabase() {
  console.log('🗑️  Clearing all data from database...');
  
  await prisma.likes.deleteMany();
  await prisma.answers.deleteMany();
  await prisma.questions.deleteMany();
  await prisma.topics.deleteMany();
  await prisma.users.deleteMany();
  
  console.log('✅ Database cleared successfully!');
}

async function showStats() {
  console.log('📊 Database Statistics:');
  
  const users = await prisma.users.count();
  const topics = await prisma.topics.count();
  const questions = await prisma.questions.count();
  const answers = await prisma.answers.count();
  const likes = await prisma.likes.count();
  
  console.log(`
   👥 Users: ${users}
   🏷️  Topics: ${topics}
   ❓ Questions: ${questions}
   💬 Answers: ${answers}
   👍 Likes: ${likes}
  `);
}

async function main() {
  const action = process.argv[2];
  
  switch (action) {
    case 'clear':
      await clearDatabase();
      break;
    case 'stats':
      await showStats();
      break;
    default:
      console.log(`
Usage: npm run db:util <action>

Available actions:
  clear  - Clear all data from database
  stats  - Show database statistics

Examples:
  npm run db:util clear
  npm run db:util stats
      `);
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
