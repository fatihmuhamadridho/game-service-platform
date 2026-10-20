#!/usr/bin/env -S node
import type { Contract as Start } from '../../snapshots/10ed40812601af3c45651c1f9879ac5162f351e21ef01d809479dd7b0a789856/contract';
import startContract from '../../snapshots/10ed40812601af3c45651c1f9879ac5162f351e21ef01d809479dd7b0a789856/contract.json' with { type: 'json' };
import type { Contract as End } from '../../snapshots/e7d9a038dced8421cccb19973d9f5dfadcbe32242658786c01a214830c597927/contract';
import endContract from '../../snapshots/e7d9a038dced8421cccb19973d9f5dfadcbe32242658786c01a214830c597927/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, collMod } from '@prisma/orm-mongo/target/migration';

class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      collMod(
        'platform_settings',
        {
          validator: {
            $jsonSchema: {
              additionalProperties: false,
              bsonType: 'object',
              properties: {
                _id: { bsonType: 'objectId' },
                allow_registration: { bsonType: 'bool' },
                business_hours: { bsonType: ['null', 'string'] },
                contact_email: { bsonType: 'string' },
                contact_whatsapp: { bsonType: 'string' },
                created_at: { bsonType: 'date' },
                default_currency: { bsonType: 'string' },
                instagram_url: { bsonType: ['null', 'string'] },
                maintenance_mode: { bsonType: 'bool' },
                singleton_key: { bsonType: 'string' },
                site_description: { bsonType: ['null', 'string'] },
                site_name: { bsonType: 'string' },
                social_links: {
                  bsonType: ['object', 'array', 'string', 'double', 'int', 'long', 'bool', 'null'],
                },
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
        },
        {
          id: 'validator.platform_settings.update',
          label: 'Update validator on platform_settings (added: business_hours, social_links)',
          operationClass: 'widening',
        },
      ),
    ];
  }
}

export default M;
MigrationCLI.run(import.meta.url, M);
