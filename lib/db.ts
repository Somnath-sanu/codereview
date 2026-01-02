import { PrismaClient } from "./generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";


//* The adapter tells Prisma how to talk to the database runtime-wise — not what database it is.
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prismaClientSingleton = () => {
  return new PrismaClient({ adapter });
};

// const globalThis: {
//   prisma: null | ReturnType<typeof prismaClientSingleton>
// } = {
//   prisma: null
// }

/**
 * * 👆 This does NOT solve hot-reload / singleton issues
 * Each file import creates its own copy
 * On reload, this variable resets
 * No sharing between modules
 */


// Use declare global when extending globals
declare global {
  var prismaGlobal: ReturnType<typeof prismaClientSingleton> | undefined;
}

/**
 * globalThis = Node global
 * Survives hot reload
 * Shared across all imports
 * Type-safe
 */

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

// const prisma = globalThis.prisma || prismaClientSingleton();

if (process.env.NODE_ENV !== "production") {
  globalThis.prismaGlobal = prisma;
}

export default prisma;

/**
 * *global --> Node.js–only global object
 *  *globalThis --> Universal global object (works everywhere)
 * 
 * Why globalThis exists at all

Before globalThis, every runtime had its own name:

Environment	Global object
Browser	window
Web Worker	self
Node.js	global
Deno / Bun	globalThis

This was annoying and unportable.

So JavaScript added:

✅ globalThis = “the global object, no matter where you run”

In Node.js specifically
These point to the same object
global === globalThis // true (in Node)


But:

global ❌ does NOT exist in browsers

globalThis ✅ exists everywhere
 * 
 */
