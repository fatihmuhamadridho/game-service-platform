#!/usr/bin/env -S node
import type { Contract as Start } from '../../snapshots/689e7094bcc11c0d8ad0b4bb446189873b006b7fc492324e7324dd4a342a31e3/contract';
import startContract from '../../snapshots/689e7094bcc11c0d8ad0b4bb446189873b006b7fc492324e7324dd4a342a31e3/contract.json' with { type: 'json' };
import type { Contract as End } from '../../snapshots/695f8a4b262d3d7ba6443dc06ff338449d1146ed8b6d478cbf9d3ec0b51abc54/contract';
import endContract from '../../snapshots/695f8a4b262d3d7ba6443dc06ff338449d1146ed8b6d478cbf9d3ec0b51abc54/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, collMod, createIndex } from '@prisma/orm-mongo/target/migration';

class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      createIndex('admin_account', [{ direction: 1, field: 'username' }], { unique: true }),
      collMod(
        'admin_account',
        {
          validator: {
            $jsonSchema: {
              additionalProperties: false,
              bsonType: 'object',
              properties: {
                _id: { bsonType: 'objectId' },
                created_at: { bsonType: 'date' },
                deleted_at: { bsonType: ['null', 'date'] },
                email: { bsonType: 'string' },
                name: { bsonType: 'string' },
                password_hash: { bsonType: 'string' },
                status: { bsonType: 'string' },
                updated_at: { bsonType: 'date' },
                username: { bsonType: 'string' },
              },
              required: ['_id', 'created_at', 'email', 'name', 'password_hash', 'status', 'updated_at', 'username'],
            },
          },
          validationLevel: 'strict',
          validationAction: 'error',
        },
        {
          id: 'validator.admin_account.update',
          label: 'Update validator on admin_account (added: password_hash, username)',
          operationClass: 'widening',
        }
      ),
      collMod(
        'game_catalog',
        {
          validator: {
            $jsonSchema: {
              additionalProperties: false,
              bsonType: 'object',
              properties: {
                _id: { bsonType: 'objectId' },
                artwork_key: { bsonType: ['null', 'string'] },
                created_at: { bsonType: 'date' },
                deleted_at: { bsonType: ['null', 'date'] },
                is_active: { bsonType: 'bool' },
                is_popular: { bsonType: 'bool' },
                name: { bsonType: 'string' },
                service_summary: { bsonType: ['null', 'string'] },
                slug: { bsonType: 'string' },
                sort_order: { bsonType: 'int' },
                updated_at: { bsonType: 'date' },
              },
              required: ['_id', 'created_at', 'is_active', 'is_popular', 'name', 'slug', 'sort_order', 'updated_at'],
            },
          },
          validationLevel: 'strict',
          validationAction: 'error',
        },
        {
          id: 'validator.game_catalog.update',
          label: 'Update validator on game_catalog (added: deleted_at)',
          operationClass: 'widening',
        }
      ),
      collMod(
        'user_account',
        {
          validator: {
            $jsonSchema: {
              additionalProperties: false,
              bsonType: 'object',
              properties: {
                _id: { bsonType: 'objectId' },
                created_at: { bsonType: 'date' },
                deleted_at: { bsonType: ['null', 'date'] },
                email: { bsonType: 'string' },
                joined_at: { bsonType: 'date' },
                name: { bsonType: 'string' },
                password_hash: { bsonType: 'string' },
                status: { bsonType: 'string' },
                updated_at: { bsonType: 'date' },
                username: { bsonType: 'string' },
                whatsapp: { bsonType: ['null', 'string'] },
              },
              required: [
                '_id',
                'created_at',
                'email',
                'joined_at',
                'name',
                'password_hash',
                'status',
                'updated_at',
                'username',
              ],
            },
          },
          validationLevel: 'strict',
          validationAction: 'error',
        },
        {
          id: 'validator.user_account.update',
          label: 'Update validator on user_account (added: password_hash)',
          operationClass: 'widening',
        }
      ),
    ];
  }
}

export default M;
MigrationCLI.run(import.meta.url, M);
