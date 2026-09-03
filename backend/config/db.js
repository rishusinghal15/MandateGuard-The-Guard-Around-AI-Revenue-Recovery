const { PrismaClient } = require('@prisma/client');

let prismaInstance = null;

function getPrismaClient() {
  if (!prismaInstance) {
    if (process.env.NODE_ENV === 'production') {
      prismaInstance = new PrismaClient();
    } else {
      if (!global.prisma) {
        global.prisma = new PrismaClient();
      }
      prismaInstance = global.prisma;
    }
  }
  return prismaInstance;
}

// Export singleton proxy to avoid multi-instance issues in dev and allow graceful lazy loading
const prisma = new Proxy({}, {
  get(target, prop) {
    const client = getPrismaClient();
    return client[prop];
  }
});

module.exports = prisma;
