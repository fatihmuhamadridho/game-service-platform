#!/usr/bin/env -S node
import type { Contract as Start } from '../../snapshots/564ea708e9c7ffcd203e6bdfcff5fe8d7cfac9ed8845bdff7648b4dd81f21526/contract';
import startContract from '../../snapshots/564ea708e9c7ffcd203e6bdfcff5fe8d7cfac9ed8845bdff7648b4dd81f21526/contract.json' with { type: 'json' };
import type { Contract as End } from '../../snapshots/c1d1b6be2e52ba0d2e376b809701e31480a60358ec806527480488c77e005842/contract';
import endContract from '../../snapshots/c1d1b6be2e52ba0d2e376b809701e31480a60358ec806527480488c77e005842/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, collMod, createIndex } from '@prisma/orm-mongo/target/migration';

class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      createIndex(
        'auth_refresh_session',
        [
          { direction: 1, field: 'account_type' },
          { direction: 1, field: 'account_id' },
          { direction: 1, field: 'family_id' },
        ],
        {}
      ),
      collMod(
        'auth_refresh_session',
        {
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
                family_id: { bsonType: 'objectId' },
                is_revoked: { bsonType: 'bool' },
                last_used_at: { bsonType: ['null', 'date'] },
                replaced_by_id: { bsonType: ['null', 'objectId'] },
                revoked_at: { bsonType: ['null', 'date'] },
                token_hash: { bsonType: 'string' },
              },
              required: [
                '_id',
                'account_id',
                'account_type',
                'created_at',
                'expires_at',
                'family_id',
                'is_revoked',
                'token_hash',
              ],
            },
          },
          validationLevel: 'strict',
          validationAction: 'error',
        },
        {
          id: 'validator.auth_refresh_session.update',
          label: 'Update validator on auth_refresh_session (added: family_id)',
          operationClass: 'widening',
        }
      ),
    ];
  }
}

export default M;
MigrationCLI.run(import.meta.url, M);
