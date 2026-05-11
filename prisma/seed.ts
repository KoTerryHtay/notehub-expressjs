import { PrismaClient } from "../src/generated/prisma/client.js";
import { PostPrivacy, RoleName } from "../src/generated/prisma/enums.js";
import "dotenv/config";
import { prisma } from "../src/lib/prisma.js";

// const prisma = new PrismaClient();

const USERS_COUNT = 10;
const POSTS_PER_USER = 3;
const HASHED_PASSWORD =
  "$2b$10$MPwXMygwidBPTW9Qcu9iYO5PPsc110BCifq32cnyP2jJs1jFkSEsq";
const DUMMY_REFRESH_TOKEN = "dummy-refresh-token";

async function main() {
  console.log("Start seeding...");

  try {
    await prisma.$transaction(
      async (tx) => {
        // 1. Clear existing data
        console.log("Cleaning up existing data...");
        await tx.groupMember.deleteMany({});
        await tx.post.deleteMany({});
        await tx.group.deleteMany({});
        await tx.user.deleteMany({});

        // 2. Create 10 Users
        console.log(`Creating ${USERS_COUNT} users...`);
        const users = [];
        for (let i = 1; i <= USERS_COUNT; i++) {
          const user = await tx.user.create({
            data: {
              name: `User ${i}`,
              email: `user${i}@gmail.com`,
              password: HASHED_PASSWORD,
              refreshToken: DUMMY_REFRESH_TOKEN,
            },
          });
          users.push(user);
        }

        // 3. Create Posts for each user
        console.log("Creating posts for users...");
        for (const user of users) {
          for (let j = 1; j <= POSTS_PER_USER; j++) {
            await tx.post.create({
              data: {
                content: `Post ${j} by ${user.name}`,
                privacy: j === 1 ? PostPrivacy.PRIVATE : PostPrivacy.PUBLIC,
                authorId: user.id,
              },
            });
          }
        }

        // 4. Create Groups and ownership for first 3 users
        console.log("Creating groups for first 3 users...");
        for (let k = 0; k < 3; k++) {
          const owner = users[k];
          await tx.group.create({
            data: {
              name: `Group ${k + 1}`,
              description: `A special group owned by ${owner.name}`,
              members: {
                create: {
                  userId: owner.id,
                  role: RoleName.OWNER,
                },
              },
            },
          });
        }
      },
      { timeout: 30000 },
    );

    console.log("Seeding finished successfully!");
  } catch (error) {
    console.error("Error during seeding:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();

// import { PrismaClient, Prisma } from "../src/generated/prisma/client";
// import { PrismaPg } from "@prisma/adapter-pg";
// import "dotenv/config";

// const adapter = new PrismaPg({
//   connectionString: process.env.DATABASE_URL,
// });

// const prisma = new PrismaClient({
//   adapter,
// });

// const userData: Prisma.UserCreateInput[] = [
//   {
//     name: "Alice",
//     email: "alice@prisma.io",
//     posts: {
//       create: [
//         {
//           title: "Join the Prisma Discord",
//           content: "https://pris.ly/discord",
//           published: true,
//         },
//         {
//           title: "Prisma on YouTube",
//           content: "https://pris.ly/youtube",
//         },
//       ],
//     },
//   },
//   {
//     name: "Bob",
//     email: "bob@prisma.io",
//     posts: {
//       create: [
//         {
//           title: "Follow Prisma on Twitter",
//           content: "https://www.twitter.com/prisma",
//           published: true,
//         },
//       ],
//     },
//   },
// ];

// export async function main() {
//   for (const u of userData) {
//     await prisma.user.create({ data: u });
//   }
// }

// main();
