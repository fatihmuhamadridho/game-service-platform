#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/6db4b0ff1f5e2f5f07b904b90c5b434bf6bda20b6cff9ec8b190bb8ba7804cac/contract';
import endContract from '../../snapshots/6db4b0ff1f5e2f5f07b904b90c5b434bf6bda20b6cff9ec8b190bb8ba7804cac/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/c955881b8d14114d8dbb4106da5b991ea66060373f40334e09962c942f8deea3/contract';
import startContract from '../../snapshots/c955881b8d14114d8dbb4106da5b991ea66060373f40334e09962c942f8deea3/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, createCollection, createIndex } from '@prisma/orm-mongo/target/migration';

class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      createCollection('auth_action_token', {
        validator: {
          $jsonSchema: {
            additionalProperties: false,
            bsonType: 'object',
            properties: {
              _id: { bsonType: 'objectId' },
              account_id: { bsonType: 'objectId' },
              created_at: { bsonType: 'date' },
              expires_at: { bsonType: 'date' },
              token_hash: { bsonType: 'string' },
              token_type: { bsonType: 'string' },
              used_at: { bsonType: ['null', 'date'] },
            },
            required: ['_id', 'account_id', 'created_at', 'expires_at', 'token_hash', 'token_type'],
          },
        },
        validationLevel: 'strict',
        validationAction: 'error',
      }),
      createIndex('auth_action_token', [{ direction: 1, field: 'token_hash' }], { unique: true }),
      createIndex(
        'auth_action_token',
        [
          { direction: 1, field: 'account_id' },
          { direction: 1, field: 'token_type' },
          { direction: 1, field: 'used_at' },
        ],
        {}
      ),
      createIndex('auth_action_token', [{ direction: 1, field: 'expires_at' }], {}),
    ];
  }
}

export default M;
MigrationCLI.run(import.meta.url, M);
