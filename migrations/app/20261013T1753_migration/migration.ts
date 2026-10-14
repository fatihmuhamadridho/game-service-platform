#!/usr/bin/env -S node
import type { Contract as Start } from '../../snapshots/689e7094bcc11c0d8ad0b4bb446189873b006b7fc492324e7324dd4a342a31e3/contract';
import startContract from '../../snapshots/689e7094bcc11c0d8ad0b4bb446189873b006b7fc492324e7324dd4a342a31e3/contract.json' with { type: 'json' };
import type { Contract as End } from '../../snapshots/bca10dabf77047c97f03bc5199d3abcff564561ef26ab1b0fc1e519876ba72d0/contract';
import endContract from '../../snapshots/bca10dabf77047c97f03bc5199d3abcff564561ef26ab1b0fc1e519876ba72d0/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, collMod, createCollection, createIndex } from '@prisma/orm-mongo/target/migration';

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
      createIndex('admin_account', [{ direction: 1, field: 'username' }], { unique: true }),
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
