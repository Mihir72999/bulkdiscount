import { SessionProps, StoreData } from '../../types';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { getDB } from '../db';

const {env} = await getCloudflareContext({async:true})
const db = await getDB()

// For use with DB URLs
// Other mysql: https://www.npmjs.com/package/mysql#pooling-connections

// Use setUser for storing global user data (persists between installs)
export async function setUser({ user }: SessionProps) {
    if (!user) return null;

    const { email, id, username } = user;
    const userData = { email, userId: id, username };

 await db.prepare('INSERT INTO users (email,userId,username) values( ?,?,? )')
  .bind(userData)
  .run();
}

export async function setStore(session: SessionProps) {
    const { access_token: accessToken, context, scope } = session;
    // Only set on app install or update
    if (!accessToken || !scope) return null;

    const storeHash = context?.split('/')[1] || '';
    const response = await fetch(
  `https://api.bigcommerce.com/stores/${storeHash}/v2/store`,
  {
    headers: {
      "X-Auth-Token": accessToken,
      "Accept": "application/json",
    },
  }
);

const store = await response.json() as StoreData;

  if (!response.ok) {
    throw new Error(`Failed to fetch store info: ${response.status} ${response.statusText}`);
  }

  
  const storeData: StoreData = { accessToken, scope, storeHash, domain:store.domain };

    await db.prepare(`
  REPLACE INTO stores (
    accessToken,
    scope,
    storeHash,
    domain
  )
  VALUES (?, ?, ?, ?)
`)
.bind(
  storeData.accessToken,
  storeData.scope,
  storeData.storeHash,
  storeData.domain
)
.run();
}

// Use setStoreUser for storing store specific variables
export async function setStoreUser(session: SessionProps) {
    const { access_token: accessToken, context, owner, sub, user: { id: userId } } = session;
    if (!userId) return null;

    const contextString = context ?? sub;
    const storeHash = contextString?.split('/')[1] || '';
 const storeUser = await db.prepare(`
  SELECT *
  FROM storeUsers
  WHERE userId = ? AND storeHash = ?
`)
.bind(
  String(userId),
  storeHash
)
.first();
    // Set admin (store owner) if installing/ updating the app
    // https://developer.bigcommerce.com/api-docs/apps/guide/users
    if (accessToken) {
        // Create a new admin user if none exists
        if (!storeUser) {
           await db.prepare(`
  INSERT INTO storeUsers (
    isAdmin,
    storeHash,
    userId
  )
  VALUES (?, ?, ?)
`)
.bind(
  true,
  storeHash,
  userId
)
.run();
        } else if (!storeUser?.isAdmin) {
            await db.prepare(`
  UPDATE storeUsers
  SET isAdmin = 1
  WHERE userId = ? AND storeHash = ?
`)
.bind(
  userId,
  storeHash
)
.run();
        }
    } else {
        // Create a new user if it doesn't exist (non-store owners added here for multi-user apps)
        if (!storeUser) {
           await db.prepare(`
  INSERT INTO storeUsers (
    isAdmin,
    storeHash,
    userId
  )
  VALUES (?, ?, ?)
`)
.bind(
  owner?.id === userId ? 1 : 0,
  storeHash,
  userId
)
.run();
        }
    }
}

export async function deleteUser({ context, user, sub }: SessionProps) {
    const contextString = context ?? sub;
    const storeHash = contextString?.split('/')[1] || '';
    const values = [String(user?.id), storeHash];
    await db.prepare(`
    DELETE FROM storeUsers
    WHERE userId = ? AND storeHash = ?
    `)
    .bind(...values)
    .run();
}

export async function hasStoreUser(storeHash: string, userId: string) {
    if (!storeHash || !userId) return false;
    const {results} = await db.prepare(`
    SELECT *
    FROM storeUsers
    WHERE userId = ? AND storeHash = ?
    LIMIT 1
    `)
    .bind(userId, storeHash)
    .run();

    return results?.length > 0;
}

// export async function getStoreToken(storeHash: string) {
//     if (!storeHash) return null;

// const result = await db.prepare(`
//   SELECT accessToken
//   FROM stores
//   WHERE storeHash = ?
// `)
// .bind(storeHash)
// .first();
//     return result?.accessToken || null;
// }
export async function getStoreToken(
  storeHash: string
): Promise<string | null> {
  if (!storeHash) return null;

  const result = await db
    .prepare(`
      SELECT accessToken
      FROM stores
      WHERE storeHash = ?
    `)
    .bind(storeHash)
    .first<{ accessToken: string }>();

  return result?.accessToken ?? null;
}
export async function deleteStore({ store_hash: storeHash }: SessionProps) {
 await db.prepare(`
  DELETE FROM stores
  WHERE storeHash = ?
`)
.bind(storeHash)
.run();
}
