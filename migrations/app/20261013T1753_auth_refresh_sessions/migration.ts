#!/usr/bin/env -S node
import type { Contract as Start } from '../../snapshots/695f8a4b262d3d7ba6443dc06ff338449d1146ed8b6d478cbf9d3ec0b51abc54/contract';
import startContract from '../../snapshots/695f8a4b262d3d7ba6443dc06ff338449d1146ed8b6d478cbf9d3ec0b51abc54/contract.json' with { type: 'json' };
import type { Contract as End } from '../../snapshots/bca10dabf77047c97f03bc5199d3abcff564561ef26ab1b0fc1e519876ba72d0/contract';
import endContract from '../../snapshots/bca10dabf77047c97f03bc5199d3abcff564561ef26ab1b0fc1e519876ba72d0/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, createCollection, createIndex } from '@prisma/orm-mongo/target/migration';

class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      createCollection('auth_refresh_session', {
        validator: {
          $jsonSchema: {
            additionalProperties: false,
            bsonType: 'object',
            properties: {
              _id: { bsonType: 'objectId' },
              account_id: { bsonType: 'objectId' },
              account_type: { bsonType: 'string' },
              created_at: { bsonType: 'date' },
              expires_at: { bsonType: 'date' },
              last_used_at: { bsonType: ['null', 'date'] },
              replaced_by_id: { bsonType: ['null', 'objectId'] },
              revoked_at: { bsonType: ['null', 'date'] },
              token_hash: { bsonType: 'string' },
            },
            required: ['_id', 'account_id', 'account_type', 'created_at', 'expires_at', 'token_hash'],
          },
        },
        validationLevel: 'strict',
        validationAction: 'error',
      }),
      createIndex('auth_refresh_session', [{ direction: 1, field: 'token_hash' }], {
        unique: true,
      }),
      createIndex(
        'auth_refresh_session',
        [
          { direction: 1, field: 'account_type' },
          { direction: 1, field: 'account_id' },
          { direction: 1, field: 'revoked_at' },
        ],
        {}
      ),
      createIndex('auth_refresh_session', [{ direction: 1, field: 'expires_at' }], {}),
    ];
  }
}

export default M;
MigrationCLI.run(import.meta.url, M);
