const models = require('../src/models');
const faker = require('@faker-js/faker').faker;

async function batchCreate(model, items, batchSize = 1000) {
  const created = [];
  for (let i = 0; i < items.length; i += batchSize) {
    const chunk = items.slice(i, i + batchSize);
    const c = await model.bulkCreate(chunk);
    created.push(...c);
  }
  return created;
}

async function seed({ users = 1000, assignments = 5000, maxCollaborators = 6 } = {}) {
  const { sequelize, User, Assignment, AssignmentCollaborator } = models;
  if (!sequelize || !User || !Assignment) {
    throw new Error('Missing required models. Ensure src/models exports sequelize, User and Assignment');
  }
  await sequelize.sync();

  console.log('Seeding users...');
  const userItems = [];
  const ts = Date.now();
  for (let i = 0; i < users; i++) {
    userItems.push({ name: faker.person.fullName(), email: `user${ts}_${i}@example.com`, password: 'password' });
  }
  const createdUsers = await batchCreate(User, userItems, 500);
  const userIds = createdUsers.map(u => u.id).filter(Boolean);

  console.log('Seeding assignments...');
  const assignmentItems = [];
  for (let i = 0; i < assignments; i++) {
    assignmentItems.push({
      title: faker.lorem.sentence(),
      course_name: `${faker.word.adjective()} ${faker.number.int({ min: 100, max: 499 })}`,
      due_date: faker.date.soon().toISOString().split('T')[0],
      priority: faker.helpers.arrayElement(['High', 'Medium', 'Low']),
      status: faker.helpers.arrayElement(['Not Started', 'In Progress', 'Completed']),
      description: faker.lorem.paragraph(),
      userId: userIds.length ? faker.helpers.arrayElement(userIds) : null
    });
  }
  const createdAssignments = await batchCreate(Assignment, assignmentItems, 1000);
  const assignmentIds = createdAssignments.map(a => a.id).filter(Boolean);

  if (!AssignmentCollaborator) {
    console.warn('AssignmentCollaborator model not available, skipping collaborators seeding');
  } else {
    console.log('Seeding collaborators...');
    const collabItems = [];
    for (const aid of assignmentIds) {
      const num = Math.max(1, Math.min(maxCollaborators, Math.floor(Math.random() * maxCollaborators) + 1));
      const picks = faker.helpers.arrayElements(userIds, num);
      for (const uid of picks) {
        collabItems.push({ assignmentId: aid, userId: uid, created_at: new Date() });
      }
      if (collabItems.length >= 10000) {
        await batchCreate(AssignmentCollaborator, collabItems, 5000);
        collabItems.length = 0;
      }
    }
    if (collabItems.length) await batchCreate(AssignmentCollaborator, collabItems, 5000);
  }

  console.log('Seeding complete');
  process.exit(0);
}

const args = process.argv.slice(2);
const opts = {};
if (args[0]) opts.users = Number(args[0]);
if (args[1]) opts.assignments = Number(args[1]);
if (args[2]) opts.maxCollaborators = Number(args[2]);

seed(opts).catch((e) => { console.error(e); process.exit(1); });
