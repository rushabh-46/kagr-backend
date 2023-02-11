import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const get_all_users = async () => {
    try {
        const allUsers = await prisma.user.findMany();
        console.log(allUsers, allUsers.length);
        return allUsers;
    } catch (err) {
        console.error('error in get_all_users', err);
        throw err;
    }
}

const main = async () => {
    try {
        // Connect the client
        await prisma.$connect();        
        await prisma.user.create({
            data: {
              name: 'Rich',
              email: 'hello@prisma.com',
              age: '25',
              phone_number: '12332494902'
            },
        });
        await get_all_users();
    }
    catch (err) {
        throw err;
    }
}

main()
.then(async () => {
    await prisma.$disconnect()
})
.catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
});
