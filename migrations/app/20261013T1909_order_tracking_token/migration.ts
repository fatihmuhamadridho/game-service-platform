#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/10ed40812601af3c45651c1f9879ac5162f351e21ef01d809479dd7b0a789856/contract';
import endContract from '../../snapshots/10ed40812601af3c45651c1f9879ac5162f351e21ef01d809479dd7b0a789856/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/698a3cd88ba667aec7063b888c037102272fafd5d6e3a8c6bfa8f75c3743a80e/contract';
import startContract from '../../snapshots/698a3cd88ba667aec7063b888c037102272fafd5d6e3a8c6bfa8f75c3743a80e/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, createCollection, createIndex } from '@prisma/orm-mongo/target/migration';

class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      createCollection('order_tracking_token', {
        validator: {
          $jsonSchema: {
            additionalProperties: false,
            bsonType: 'object',
            properties: {
              _id: { bsonType: 'objectId' },
              created_at: { bsonType: 'date' },
              expires_at: { bsonType: 'date' },
              order_id: { bsonType: 'objectId' },
              revoked_at: { bsonType: ['null', 'date'] },
              token_hash: { bsonType: 'string' },
            },
            required: ['_id', 'created_at', 'expires_at', 'order_id', 'token_hash'],
          },
        },
        validationLevel: 'strict',
        validationAction: 'error',
      }),
      createIndex('order_tracking_token', [{ direction: 1, field: 'token_hash' }], {
        unique: true,
      }),
      createIndex(
        'order_tracking_token',
        [
          { direction: 1, field: 'order_id' },
          { direction: 1, field: 'expires_at' },
        ],
        {}
      ),
      createIndex('order_tracking_token', [{ direction: 1, field: 'expires_at' }], {}),
    ];
  }
}

export default M;
MigrationCLI.run(import.meta.url, M);
