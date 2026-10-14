#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/689e7094bcc11c0d8ad0b4bb446189873b006b7fc492324e7324dd4a342a31e3/contract';
import endContract from '../../snapshots/689e7094bcc11c0d8ad0b4bb446189873b006b7fc492324e7324dd4a342a31e3/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, createCollection, createIndex } from '@prisma/orm-mongo/target/migration';

class M extends Migration<never, End> {
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      createCollection('account_role', {
        validator: {
          $jsonSchema: {
            additionalProperties: false,
            bsonType: 'object',
            properties: {
              _id: { bsonType: 'objectId' },
              admin_account_id: { bsonType: 'objectId' },
              assigned_at: { bsonType: 'date' },
              assigned_by: { bsonType: ['null', 'objectId'] },
              revoked_at: { bsonType: ['null', 'date'] },
              role_id: { bsonType: 'objectId' },
            },
            required: ['_id', 'admin_account_id', 'assigned_at', 'role_id'],
          },
        },
        validationLevel: 'strict',
        validationAction: 'error',
      }),
      createCollection('activity_log', {
        validator: {
          $jsonSchema: {
            additionalProperties: false,
            bsonType: 'object',
            properties: {
              _id: { bsonType: 'objectId' },
              action_code: { bsonType: 'string' },
              action_label: { bsonType: 'string' },
              actor_admin_id: { bsonType: ['null', 'objectId'] },
              actor_email_snapshot: { bsonType: ['null', 'string'] },
              actor_name_snapshot: { bsonType: ['null', 'string'] },
              category: { bsonType: 'string' },
              changed_fields: {
                bsonType: ['object', 'array', 'string', 'double', 'int', 'long', 'bool', 'null'],
              },
              failure_code: { bsonType: ['null', 'string'] },
              occurred_at: { bsonType: 'date' },
              reason: { bsonType: ['null', 'string'] },
              request_id: { bsonType: ['null', 'string'] },
              result: { bsonType: 'string' },
              source_ip: { bsonType: ['null', 'string'] },
              target_id: { bsonType: ['null', 'objectId'] },
              target_reference: { bsonType: ['null', 'string'] },
              target_type: { bsonType: 'string' },
              user_agent: { bsonType: ['null', 'string'] },
            },
            required: ['_id', 'action_code', 'action_label', 'category', 'occurred_at', 'result', 'target_type'],
          },
        },
        validationLevel: 'strict',
        validationAction: 'error',
      }),
      createCollection('admin_account', {
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
              status: { bsonType: 'string' },
              updated_at: { bsonType: 'date' },
            },
            required: ['_id', 'created_at', 'email', 'name', 'status', 'updated_at'],
          },
        },
        validationLevel: 'strict',
        validationAction: 'error',
      }),
      createCollection('admin_role', {
        validator: {
          $jsonSchema: {
            additionalProperties: false,
            bsonType: 'object',
            properties: {
              _id: { bsonType: 'objectId' },
              code: { bsonType: 'string' },
              created_at: { bsonType: 'date' },
              deleted_at: { bsonType: ['null', 'date'] },
              description: { bsonType: ['null', 'string'] },
              is_system: { bsonType: 'bool' },
              name: { bsonType: 'string' },
              status: { bsonType: 'string' },
              updated_at: { bsonType: 'date' },
            },
            required: ['_id', 'code', 'created_at', 'is_system', 'name', 'status', 'updated_at'],
          },
        },
        validationLevel: 'strict',
        validationAction: 'error',
      }),
      createCollection('admin_status_history', {
        validator: {
          $jsonSchema: {
            additionalProperties: false,
            bsonType: 'object',
            properties: {
              _id: { bsonType: 'objectId' },
              admin_account_id: { bsonType: 'objectId' },
              changed_at: { bsonType: 'date' },
              changed_by: { bsonType: ['null', 'objectId'] },
              new_status: { bsonType: 'string' },
              old_status: { bsonType: ['null', 'string'] },
              reason: { bsonType: ['null', 'string'] },
            },
            required: ['_id', 'admin_account_id', 'changed_at', 'new_status'],
          },
        },
        validationLevel: 'strict',
        validationAction: 'error',
      }),
      createCollection('customer_order', {
        validator: {
          $jsonSchema: {
            additionalProperties: false,
            bsonType: 'object',
            properties: {
              _id: { bsonType: 'objectId' },
              created_at: { bsonType: 'date' },
              currency: { bsonType: 'string' },
              customer_name: { bsonType: 'string' },
              customer_whatsapp: { bsonType: 'string' },
              discount_amount: { bsonType: 'decimal' },
              expires_at: { bsonType: ['null', 'date'] },
              order_number: { bsonType: 'string' },
              order_status: { bsonType: 'string' },
              payment_status: { bsonType: 'string' },
              subtotal_amount: { bsonType: 'decimal' },
              total_amount: { bsonType: 'decimal' },
              updated_at: { bsonType: 'date' },
              user_id: { bsonType: ['null', 'objectId'] },
            },
            required: [
              '_id',
              'created_at',
              'currency',
              'customer_name',
              'customer_whatsapp',
              'discount_amount',
              'order_number',
              'order_status',
              'payment_status',
              'subtotal_amount',
              'total_amount',
              'updated_at',
            ],
          },
        },
        validationLevel: 'strict',
        validationAction: 'error',
      }),
      createCollection('financial_transaction', {
        validator: {
          $jsonSchema: {
            additionalProperties: false,
            bsonType: 'object',
            properties: {
              _id: { bsonType: 'objectId' },
              amount: { bsonType: 'decimal' },
              created_at: { bsonType: 'date' },
              currency: { bsonType: 'string' },
              customer_contact_snapshot: { bsonType: ['null', 'string'] },
              customer_name_snapshot: { bsonType: ['null', 'string'] },
              method: { bsonType: 'string' },
              order_id: { bsonType: 'objectId' },
              order_payment_id: { bsonType: ['null', 'objectId'] },
              provider_reference: { bsonType: ['null', 'string'] },
              refund_request_id: { bsonType: ['null', 'objectId'] },
              settled_at: { bsonType: ['null', 'date'] },
              status: { bsonType: 'string' },
              transaction_number: { bsonType: 'string' },
              type: { bsonType: 'string' },
              updated_at: { bsonType: 'date' },
            },
            required: [
              '_id',
              'amount',
              'created_at',
              'currency',
              'method',
              'order_id',
              'status',
              'transaction_number',
              'type',
              'updated_at',
            ],
          },
        },
        validationLevel: 'strict',
        validationAction: 'error',
      }),
      createCollection('game_catalog', {
        validator: {
          $jsonSchema: {
            additionalProperties: false,
            bsonType: 'object',
            properties: {
              _id: { bsonType: 'objectId' },
              artwork_key: { bsonType: ['null', 'string'] },
              created_at: { bsonType: 'date' },
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
      }),
      createCollection('game_service', {
        validator: {
          $jsonSchema: {
            additionalProperties: false,
            bsonType: 'object',
            properties: {
              _id: { bsonType: 'objectId' },
              category_id: { bsonType: 'objectId' },
              created_at: { bsonType: 'date' },
              deleted_at: { bsonType: ['null', 'date'] },
              estimate_text: { bsonType: 'string' },
              game_id: { bsonType: 'objectId' },
              is_active: { bsonType: 'bool' },
              is_custom_price: { bsonType: 'bool' },
              name: { bsonType: 'string' },
              price_amount: { bsonType: ['null', 'decimal'] },
              updated_at: { bsonType: 'date' },
            },
            required: [
              '_id',
              'category_id',
              'created_at',
              'estimate_text',
              'game_id',
              'is_active',
              'is_custom_price',
              'name',
              'updated_at',
            ],
          },
        },
        validationLevel: 'strict',
        validationAction: 'error',
      }),
      createCollection('member_profile', {
        validator: {
          $jsonSchema: {
            additionalProperties: false,
            bsonType: 'object',
            properties: {
              _id: { bsonType: 'objectId' },
              created_at: { bsonType: 'date' },
              tier: { bsonType: 'string' },
              updated_at: { bsonType: 'date' },
            },
            required: ['_id', 'created_at', 'tier', 'updated_at'],
          },
        },
        validationLevel: 'strict',
        validationAction: 'error',
      }),
      createCollection('member_tier_history', {
        validator: {
          $jsonSchema: {
            additionalProperties: false,
            bsonType: 'object',
            properties: {
              _id: { bsonType: 'objectId' },
              changed_at: { bsonType: 'date' },
              changed_by: { bsonType: ['null', 'objectId'] },
              new_tier: { bsonType: 'string' },
              old_tier: { bsonType: ['null', 'string'] },
              reason: { bsonType: ['null', 'string'] },
              user_id: { bsonType: 'objectId' },
            },
            required: ['_id', 'changed_at', 'new_tier', 'user_id'],
          },
        },
        validationLevel: 'strict',
        validationAction: 'error',
      }),
      createCollection('order_item', {
        validator: {
          $jsonSchema: {
            additionalProperties: false,
            bsonType: 'object',
            properties: {
              _id: { bsonType: 'objectId' },
              category_id: { bsonType: ['null', 'objectId'] },
              category_name_snapshot: { bsonType: ['null', 'string'] },
              customer_notes: { bsonType: ['null', 'string'] },
              estimate_snapshot: { bsonType: 'string' },
              game_account: { bsonType: 'string' },
              game_id: { bsonType: ['null', 'objectId'] },
              game_name_snapshot: { bsonType: 'string' },
              game_server: { bsonType: ['null', 'string'] },
              line_total: { bsonType: ['null', 'decimal'] },
              order_id: { bsonType: 'objectId' },
              quantity: { bsonType: 'int' },
              service_id: { bsonType: ['null', 'objectId'] },
              service_name_snapshot: { bsonType: 'string' },
              unit_price: { bsonType: ['null', 'decimal'] },
            },
            required: [
              '_id',
              'estimate_snapshot',
              'game_account',
              'game_name_snapshot',
              'order_id',
              'quantity',
              'service_name_snapshot',
            ],
          },
        },
        validationLevel: 'strict',
        validationAction: 'error',
      }),
      createCollection('order_payment', {
        validator: {
          $jsonSchema: {
            additionalProperties: false,
            bsonType: 'object',
            properties: {
              _id: { bsonType: 'objectId' },
              amount: { bsonType: 'decimal' },
              created_at: { bsonType: 'date' },
              method: { bsonType: 'string' },
              order_id: { bsonType: 'objectId' },
              reference_note: { bsonType: ['null', 'string'] },
              review_note: { bsonType: ['null', 'string'] },
              reviewed_at: { bsonType: ['null', 'date'] },
              reviewed_by: { bsonType: ['null', 'objectId'] },
              status: { bsonType: 'string' },
              submitted_at: { bsonType: ['null', 'date'] },
              updated_at: { bsonType: 'date' },
            },
            required: ['_id', 'amount', 'created_at', 'method', 'order_id', 'status', 'updated_at'],
          },
        },
        validationLevel: 'strict',
        validationAction: 'error',
      }),
      createCollection('order_status_history', {
        validator: {
          $jsonSchema: {
            additionalProperties: false,
            bsonType: 'object',
            properties: {
              _id: { bsonType: 'objectId' },
              changed_at: { bsonType: 'date' },
              changed_by: { bsonType: ['null', 'objectId'] },
              new_status: { bsonType: 'string' },
              old_status: { bsonType: ['null', 'string'] },
              order_id: { bsonType: 'objectId' },
              reason: { bsonType: ['null', 'string'] },
            },
            required: ['_id', 'changed_at', 'new_status', 'order_id'],
          },
        },
        validationLevel: 'strict',
        validationAction: 'error',
      }),
      createCollection('payment_proof', {
        validator: {
          $jsonSchema: {
            additionalProperties: false,
            bsonType: 'object',
            properties: {
              _id: { bsonType: 'objectId' },
              file_size_bytes: { bsonType: 'int' },
              mime_type: { bsonType: 'string' },
              object_key: { bsonType: 'string' },
              payment_id: { bsonType: 'objectId' },
              uploaded_at: { bsonType: 'date' },
              uploaded_by: { bsonType: ['null', 'objectId'] },
            },
            required: ['_id', 'file_size_bytes', 'mime_type', 'object_key', 'payment_id', 'uploaded_at'],
          },
        },
        validationLevel: 'strict',
        validationAction: 'error',
      }),
      createCollection('payment_status_history', {
        validator: {
          $jsonSchema: {
            additionalProperties: false,
            bsonType: 'object',
            properties: {
              _id: { bsonType: 'objectId' },
              changed_at: { bsonType: 'date' },
              changed_by: { bsonType: ['null', 'objectId'] },
              new_status: { bsonType: 'string' },
              old_status: { bsonType: ['null', 'string'] },
              payment_id: { bsonType: 'objectId' },
              reason: { bsonType: ['null', 'string'] },
            },
            required: ['_id', 'changed_at', 'new_status', 'payment_id'],
          },
        },
        validationLevel: 'strict',
        validationAction: 'error',
      }),
      createCollection('permission', {
        validator: {
          $jsonSchema: {
            additionalProperties: false,
            bsonType: 'object',
            properties: {
              _id: { bsonType: 'objectId' },
              code: { bsonType: 'string' },
              created_at: { bsonType: 'date' },
              description: { bsonType: ['null', 'string'] },
              is_active: { bsonType: 'bool' },
              is_sensitive: { bsonType: 'bool' },
              name: { bsonType: 'string' },
              updated_at: { bsonType: 'date' },
            },
            required: ['_id', 'code', 'created_at', 'is_active', 'is_sensitive', 'name', 'updated_at'],
          },
        },
        validationLevel: 'strict',
        validationAction: 'error',
      }),
      createCollection('platform_settings', {
        validator: {
          $jsonSchema: {
            additionalProperties: false,
            bsonType: 'object',
            properties: {
              _id: { bsonType: 'objectId' },
              allow_registration: { bsonType: 'bool' },
              contact_email: { bsonType: 'string' },
              contact_whatsapp: { bsonType: 'string' },
              created_at: { bsonType: 'date' },
              default_currency: { bsonType: 'string' },
              instagram_url: { bsonType: ['null', 'string'] },
              maintenance_mode: { bsonType: 'bool' },
              singleton_key: { bsonType: 'string' },
              site_description: { bsonType: ['null', 'string'] },
              site_name: { bsonType: 'string' },
              timezone: { bsonType: 'string' },
              updated_at: { bsonType: 'date' },
              updated_by: { bsonType: ['null', 'objectId'] },
              version: { bsonType: 'int' },
            },
            required: [
              '_id',
              'allow_registration',
              'contact_email',
              'contact_whatsapp',
              'created_at',
              'default_currency',
              'maintenance_mode',
              'singleton_key',
              'site_name',
              'timezone',
              'updated_at',
              'version',
            ],
          },
        },
        validationLevel: 'strict',
        validationAction: 'error',
      }),
      createCollection('role_permission', {
        validator: {
          $jsonSchema: {
            additionalProperties: false,
            bsonType: 'object',
            properties: {
              _id: { bsonType: 'objectId' },
              created_at: { bsonType: 'date' },
              granted_by: { bsonType: ['null', 'objectId'] },
              permission_id: { bsonType: 'objectId' },
              role_id: { bsonType: 'objectId' },
            },
            required: ['_id', 'created_at', 'permission_id', 'role_id'],
          },
        },
        validationLevel: 'strict',
        validationAction: 'error',
      }),
      createCollection('service_category', {
        validator: {
          $jsonSchema: {
            additionalProperties: false,
            bsonType: 'object',
            properties: {
              _id: { bsonType: 'objectId' },
              created_at: { bsonType: 'date' },
              deleted_at: { bsonType: ['null', 'date'] },
              description: { bsonType: ['null', 'string'] },
              is_active: { bsonType: 'bool' },
              name: { bsonType: 'string' },
              slug: { bsonType: 'string' },
              updated_at: { bsonType: 'date' },
            },
            required: ['_id', 'created_at', 'is_active', 'name', 'slug', 'updated_at'],
          },
        },
        validationLevel: 'strict',
        validationAction: 'error',
      }),
      createCollection('transaction_status_history', {
        validator: {
          $jsonSchema: {
            additionalProperties: false,
            bsonType: 'object',
            properties: {
              _id: { bsonType: 'objectId' },
              changed_at: { bsonType: 'date' },
              changed_by: { bsonType: ['null', 'objectId'] },
              new_status: { bsonType: 'string' },
              old_status: { bsonType: ['null', 'string'] },
              reason: { bsonType: ['null', 'string'] },
              transaction_id: { bsonType: 'objectId' },
            },
            required: ['_id', 'changed_at', 'new_status', 'transaction_id'],
          },
        },
        validationLevel: 'strict',
        validationAction: 'error',
      }),
      createCollection('user_account', {
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
              status: { bsonType: 'string' },
              updated_at: { bsonType: 'date' },
              username: { bsonType: 'string' },
              whatsapp: { bsonType: ['null', 'string'] },
            },
            required: ['_id', 'created_at', 'email', 'joined_at', 'name', 'status', 'updated_at', 'username'],
          },
        },
        validationLevel: 'strict',
        validationAction: 'error',
      }),
      createCollection('user_status_history', {
        validator: {
          $jsonSchema: {
            additionalProperties: false,
            bsonType: 'object',
            properties: {
              _id: { bsonType: 'objectId' },
              changed_at: { bsonType: 'date' },
              changed_by: { bsonType: ['null', 'objectId'] },
              new_status: { bsonType: 'string' },
              old_status: { bsonType: ['null', 'string'] },
              reason: { bsonType: ['null', 'string'] },
              user_id: { bsonType: 'objectId' },
            },
            required: ['_id', 'changed_at', 'new_status', 'user_id'],
          },
        },
        validationLevel: 'strict',
        validationAction: 'error',
      }),
      createIndex(
        'account_role',
        [
          { direction: 1, field: 'admin_account_id' },
          { direction: 1, field: 'role_id' },
        ],
        { unique: true }
      ),
      createIndex(
        'activity_log',
        [
          { direction: 1, field: 'occurred_at' },
          { direction: 1, field: '_id' },
        ],
        {}
      ),
      createIndex(
        'activity_log',
        [
          { direction: 1, field: 'category' },
          { direction: 1, field: 'occurred_at' },
        ],
        {}
      ),
      createIndex(
        'activity_log',
        [
          { direction: 1, field: 'result' },
          { direction: 1, field: 'occurred_at' },
        ],
        {}
      ),
      createIndex(
        'activity_log',
        [
          { direction: 1, field: 'actor_admin_id' },
          { direction: 1, field: 'occurred_at' },
        ],
        {}
      ),
      createIndex(
        'activity_log',
        [
          { direction: 1, field: 'target_type' },
          { direction: 1, field: 'target_id' },
          { direction: 1, field: 'occurred_at' },
        ],
        {}
      ),
      createIndex(
        'activity_log',
        [
          { direction: 1, field: 'action_code' },
          { direction: 1, field: 'occurred_at' },
        ],
        {}
      ),
      createIndex('activity_log', [{ direction: 1, field: 'request_id' }], {}),
      createIndex('admin_account', [{ direction: 1, field: 'email' }], { unique: true }),
      createIndex(
        'admin_role',
        [
          { direction: 1, field: 'status' },
          { direction: 1, field: 'name' },
        ],
        {}
      ),
      createIndex(
        'admin_status_history',
        [
          { direction: 1, field: 'admin_account_id' },
          { direction: 1, field: 'changed_at' },
        ],
        {}
      ),
      createIndex('customer_order', [{ direction: 1, field: 'order_number' }], { unique: true }),
      createIndex(
        'customer_order',
        [
          { direction: 1, field: 'created_at' },
          { direction: 1, field: '_id' },
        ],
        {}
      ),
      createIndex(
        'customer_order',
        [
          { direction: 1, field: 'order_status' },
          { direction: 1, field: 'created_at' },
        ],
        {}
      ),
      createIndex(
        'customer_order',
        [
          { direction: 1, field: 'payment_status' },
          { direction: 1, field: 'created_at' },
        ],
        {}
      ),
      createIndex('financial_transaction', [{ direction: 1, field: 'transaction_number' }], {
        unique: true,
      }),
      createIndex('financial_transaction', [{ direction: 1, field: 'order_payment_id' }], {}),
      createIndex(
        'financial_transaction',
        [
          { direction: 1, field: 'status' },
          { direction: 1, field: 'created_at' },
        ],
        {}
      ),
      createIndex(
        'financial_transaction',
        [
          { direction: 1, field: 'type' },
          { direction: 1, field: 'created_at' },
        ],
        {}
      ),
      createIndex('game_catalog', [{ direction: 1, field: 'name' }], { unique: true }),
      createIndex('game_catalog', [{ direction: 1, field: 'slug' }], { unique: true }),
      createIndex(
        'game_catalog',
        [
          { direction: 1, field: 'is_active' },
          { direction: 1, field: 'is_popular' },
          { direction: 1, field: 'sort_order' },
        ],
        {}
      ),
      createIndex(
        'game_service',
        [
          { direction: 1, field: 'game_id' },
          { direction: 1, field: 'is_active' },
          { direction: 1, field: 'name' },
          { direction: 1, field: '_id' },
        ],
        {}
      ),
      createIndex(
        'game_service',
        [
          { direction: 1, field: 'category_id' },
          { direction: 1, field: 'is_active' },
          { direction: 1, field: 'name' },
          { direction: 1, field: '_id' },
        ],
        {}
      ),
      createIndex(
        'game_service',
        [
          { direction: 1, field: 'game_id' },
          { direction: 1, field: 'category_id' },
          { direction: 1, field: 'name' },
        ],
        {}
      ),
      createIndex(
        'member_tier_history',
        [
          { direction: 1, field: 'user_id' },
          { direction: 1, field: 'changed_at' },
        ],
        {}
      ),
      createIndex('order_item', [{ direction: 1, field: 'order_id' }], {}),
      createIndex(
        'order_payment',
        [
          { direction: 1, field: 'order_id' },
          { direction: 1, field: 'created_at' },
        ],
        {}
      ),
      createIndex(
        'order_payment',
        [
          { direction: 1, field: 'status' },
          { direction: 1, field: 'created_at' },
        ],
        {}
      ),
      createIndex(
        'order_status_history',
        [
          { direction: 1, field: 'order_id' },
          { direction: 1, field: 'changed_at' },
        ],
        {}
      ),
      createIndex('payment_proof', [{ direction: 1, field: 'object_key' }], { unique: true }),
      createIndex(
        'payment_proof',
        [
          { direction: 1, field: 'payment_id' },
          { direction: 1, field: 'uploaded_at' },
        ],
        {}
      ),
      createIndex(
        'payment_status_history',
        [
          { direction: 1, field: 'payment_id' },
          { direction: 1, field: 'changed_at' },
        ],
        {}
      ),
      createIndex('permission', [{ direction: 1, field: 'code' }], { unique: true }),
      createIndex('platform_settings', [{ direction: 1, field: 'singleton_key' }], {
        unique: true,
      }),
      createIndex(
        'role_permission',
        [
          { direction: 1, field: 'role_id' },
          { direction: 1, field: 'permission_id' },
        ],
        { unique: true }
      ),
      createIndex(
        'service_category',
        [
          { direction: 1, field: 'is_active' },
          { direction: 1, field: 'name' },
          { direction: 1, field: '_id' },
        ],
        {}
      ),
      createIndex(
        'transaction_status_history',
        [
          { direction: 1, field: 'transaction_id' },
          { direction: 1, field: 'changed_at' },
        ],
        {}
      ),
      createIndex('user_account', [{ direction: 1, field: 'email' }], { unique: true }),
      createIndex('user_account', [{ direction: 1, field: 'username' }], { unique: true }),
      createIndex(
        'user_status_history',
        [
          { direction: 1, field: 'user_id' },
          { direction: 1, field: 'changed_at' },
        ],
        {}
      ),
    ];
  }
}

export default M;
MigrationCLI.run(import.meta.url, M);
