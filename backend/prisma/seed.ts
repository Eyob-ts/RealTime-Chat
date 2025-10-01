import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    //Create test users
    const John = await prisma.user.create({
        data: {username: 'John'}
    });
    const Doe = await prisma.user.create({
        data: {username: 'Doe'}
    });

    // Create a test room
    const room = await prisma.chatRoom.create({
        data: {name: 'general'}
    });

    // Create test messages 
    await prisma.message.create({
        data: {
            text: 'Hello World',
            user: {
                connect: {id: John.id}
            },
            chatRoom: {
                connect: {id: room.id}
            }
        }
    });
    console.log ('seed data created successfully');
}

main()
    .then(async() => {
        await prisma.$disconnect();
    })
    .catch(async(e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    })

