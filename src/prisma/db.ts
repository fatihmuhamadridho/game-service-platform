import 'temporal-polyfill/full/global';
import mongo from '@prisma/orm-mongo/runtime';
import type { Contract } from './contract.d';
import contractJson from './contract.json' with { type: 'json' };

const mongoUrl = process.env['MONGODB_URL']?.trim();

if (!mongoUrl) {
  throw new Error(
    'MONGODB_URL is not set. Add a valid mongodb:// or mongodb+srv:// connection string to .env and restart the dev server.',
  );
}

const describeMongoUrl = (value: string) => {
  const schemeEnd = value.indexOf('://');
  const authorityStart = schemeEnd + 3;
  const authorityEnd = value.slice(authorityStart).search(/[/?#]/);
  const authority = value.slice(
    authorityStart,
    authorityEnd === -1 ? undefined : authorityStart + authorityEnd,
  );
  const suffix = authorityEnd === -1 ? '' : value.slice(authorityStart + authorityEnd);
  const hostList = authority.slice(authority.lastIndexOf('@') + 1);

  return {
    scheme: schemeEnd === -1 ? 'missing' : value.slice(0, schemeEnd),
    length: value.length,
    hasWhitespace: [...value].some((character) => character.trim() === ''),
    hasCredentials: authority.includes('@'),
    hostCount: hostList ? hostList.split(',').length : 0,
    hasDatabasePath: suffix.startsWith('/'),
    hasQuery: value.includes('?'),
  };
};

const createDb = () => {
  try {
    return mongo<Contract>({
      contractJson,
      url: mongoUrl,
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes('Mongo URL must be a valid URL')) {
      throw new Error(
        `Prisma rejected MONGODB_URL. Safe URL details: ${JSON.stringify(describeMongoUrl(mongoUrl))}`,
        { cause: error },
      );
    }

    throw error;
  }
};

export const db = createDb();
