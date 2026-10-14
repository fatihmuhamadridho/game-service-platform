#!/usr/bin/env -S node
import type { Contract as Start } from '../../snapshots/c1d1b6be2e52ba0d2e376b809701e31480a60358ec806527480488c77e005842/contract';
import startContract from '../../snapshots/c1d1b6be2e52ba0d2e376b809701e31480a60358ec806527480488c77e005842/contract.json' with { type: 'json' };
import type { Contract as End } from '../../snapshots/c955881b8d14114d8dbb4106da5b991ea66060373f40334e09962c942f8deea3/contract';
import endContract from '../../snapshots/c955881b8d14114d8dbb4106da5b991ea66060373f40334e09962c942f8deea3/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, createCollection, createIndex } from '@prisma/orm-mongo/target/migration';

class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      createCollection('auth_rate_limit_bucket', {
        validator: {
          $jsonSchema: {
            additionalProperties: false,
            bsonType: 'object',
            properties: {
              _id: { bsonType: 'objectId' },
              bucket_key: { bsonType: 'string' },
              created_at: { bsonType: 'date' },
              expires_at: { bsonType: 'date' },
              request_count: { bsonType: 'int' },
            },
            required: ['_id', 'bucket_key', 'created_at', 'expires_at', 'request_count'],
          },
        },
        validationLevel: 'strict',
        validationAction: 'error',
      }),
      createIndex('auth_rate_limit_bucket', [{ direction: 1, field: 'bucket_key' }], {
        unique: true,
      }),
    ];
  }
}

export default M;
MigrationCLI.run(import.meta.url, M);
