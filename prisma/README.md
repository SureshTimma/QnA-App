# Database Seeding Guide

This project includes comprehensive database seeding tools to populate your MongoDB database with realistic dummy data for development and testing.

## Quick Start

```bash
# Install dependencies (if not already done)
npm install

# Clear database and seed with fresh data
npm run db:seed:reset

# Add realistic Q&A scenarios
npm run db:seed:realistic
```

## Available Commands

### Seeding Commands

| Command | Description |
|---------|-------------|
| `npm run db:seed` | Populate database with random generated data |
| `npm run db:seed:realistic` | Add high-quality, realistic Q&A scenarios |
| `npm run db:seed:reset` | Clear database and run main seeder |
| `npm run db:seed:all` | Run both main seeder and realistic seeder |

### Utility Commands

| Command | Description |
|---------|-------------|
| `npm run db:util stats` | Show current database statistics |
| `npm run db:util clear` | Clear all data from database |

## What Gets Created

### Main Seeder (`npm run db:seed`)
- **15 Users** with realistic profiles
- **20 Topics** covering programming subjects
- **75 Questions** with realistic titles and descriptions
- **200 Answers** with helpful responses
- **300 Likes** distributed across answers
- **30% of questions** include sample images

### Realistic Seeder (`npm run db:seed:realistic`)
- **4 High-quality Q&A scenarios** covering:
  - React async/await patterns
  - MongoDB vs PostgreSQL comparison
  - Node.js API best practices
  - TypeScript migration strategies
- **8 Detailed answers** with code examples and practical advice

## Data Quality Features

### Questions
- Programming-focused titles using faker.hacker methods
- Detailed descriptions with multiple scenarios
- Realistic timestamps spread over the past year
- Topic associations (1-3 topics per question)
- Optional base64 sample images

### Answers
- Contextual responses to questions
- Varied answer lengths and styles
- Realistic like counts
- Timestamps after question creation

### Users
- Unique email addresses
- Realistic usernames
- Secure password generation

## Sample Data Examples

### Generated Question Titles
- "How to compile matrix in React?"
- "What is the best way to parse bandwidth?"
- "Problem with application synthesize"
- "Best practices for hack firewall"

### Realistic Scenarios
- In-depth technical discussions
- Code examples with syntax highlighting
- Multiple perspectives on common problems
- Real-world migration experiences

## Database Schema

The seeder respects all foreign key relationships:

```
Users (15) → Questions (79) → Answers (208) → Likes (300)
       ↘         ↓
         → Topics (20)
```

## Customization

### Adding New Realistic Scenarios

Edit `prisma/realistic-seed.ts` and add to the `QA_SCENARIOS` array:

```typescript
{
  title: "Your question title",
  description: "Detailed question description",
  topics: ['Topic1', 'Topic2'],
  answers: [
    "First helpful answer...",
    "Alternative solution..."
  ]
}
```

### Modifying Data Quantities

Edit the count parameters in `prisma/seed.ts`:

```typescript
const users = await createUsers(15);        // Number of users
const questions = await createQuestions(users, topics, 75);  // Number of questions
const answers = await createAnswers(users, questions, 200);  // Number of answers
```

### Adding New Topics

Modify the `SAMPLE_TOPICS` array in `prisma/seed.ts`:

```typescript
const SAMPLE_TOPICS = [
  'JavaScript',
  'React',
  'Your New Topic',
  // ... more topics
];
```

## Development Workflow

1. **Initial Setup**: `npm run db:seed:reset`
2. **Add Quality Content**: `npm run db:seed:realistic`
3. **Check Results**: `npm run db:util stats`
4. **Clear When Needed**: `npm run db:util clear`
5. **Fresh Start**: `npm run db:seed:all`

## Image Handling

The seeder includes sample base64 images for testing the image upload functionality. Questions have a 30% chance of including an image attachment.

## Error Handling

- Unique constraint violations are gracefully handled
- Foreign key relationships are maintained
- Clear error messages for debugging
- Automatic cleanup on failures

## Performance Notes

- Seeding 79 questions + 208 answers typically takes 10-15 seconds
- Uses optimized batch operations where possible
- Respects database connection limits
- Includes progress indicators

---

## Troubleshooting

### Common Issues

**"No users found" error**: Run the main seeder first
```bash
npm run db:seed
```

**TypeScript errors**: Ensure ts-node is installed
```bash
npm install ts-node --save-dev
```

**Database connection issues**: Check your `.env` file
```bash
# Verify MONGODB_URI is set correctly
```

**Unique constraint violations**: Clear database first
```bash
npm run db:util clear
```
