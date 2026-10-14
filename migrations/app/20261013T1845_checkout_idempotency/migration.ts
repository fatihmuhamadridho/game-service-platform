#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/698a3cd88ba667aec7063b888c037102272fafd5d6e3a8c6bfa8f75c3743a80e/contract';
import endContract from '../../snapshots/698a3cd88ba667aec7063b888c037102272fafd5d6e3a8c6bfa8f75c3743a80e/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/6db4b0ff1f5e2f5f07b904b90c5b434bf6bda20b6cff9ec8b190bb8ba7804cac/contract';
import startContract from '../../snapshots/6db4b0ff1f5e2f5f07b904b90c5b434bf6bda20b6cff9ec8b190bb8ba7804cac/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, createCollection, createIndex } from '@prisma/orm-mongo/target/migration';

class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      createCollection('checkout_idempotency', {
        validator: {
          $jsonSchema: {
            additionalProperties: false,
            bsonType: 'object',
            properties: {
              _id: { bsonType: 'objectId' },
              created_at: { bsonType: 'date' },
              expires_at: { bsonType: 'date' },
              key_hash: { bsonType: 'string' },
              request_hash: { bsonType: 'string' },
              response_json: {
                bsonType: ['object', 'array', 'string', 'double', 'int', 'long', 'bool', 'null'],
              },
            },
            required: ['_id', 'created_at', 'expires_at', 'key_hash', 'request_hash'],
          },
        },
        validationLevel: 'strict',
        validationAction: 'error',
      }),
      createIndex('checkout_idempotency', [{ direction: 1, field: 'key_hash' }], { unique: true }),
      createIndex('checkout_idempotency', [{ direction: 1, field: 'expires_at' }], {}),
    ];
  }
}

export default M;
MigrationCLI.run(import.meta.url, M);
