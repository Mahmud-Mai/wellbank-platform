import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateProfileAndDocumentTables1700000000000 implements MigrationInterface {
  name = 'CreateProfileAndDocumentTables1700000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create documents table
    await queryRunner.createTable(
      new Table({
        name: 'documents',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'gen_random_uuid()',
          },
          {
            name: 'owner_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'document_type',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'file_url',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'file_name',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'mime_type',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'file_size',
            type: 'integer',
            isNullable: false,
          },
          {
            name: 'verification_status',
            type: 'varchar',
            default: "'unverified'",
          },
          {
            name: 'expiry_date',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'issued_date',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'issuing_authority',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'document_number',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'reviewed_by',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'reviewed_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'rejection_reason',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'now()',
          },
        ],
        indices: [
          {
            name: 'IDX_DOCUMENT_OWNER',
            columnNames: ['owner_id'],
          },
          {
            name: 'IDX_DOCUMENT_TYPE',
            columnNames: ['document_type'],
          },
          {
            name: 'IDX_DOCUMENT_STATUS',
            columnNames: ['verification_status'],
          },
          {
            name: 'IDX_DOCUMENT_EXPIRY',
            columnNames: ['expiry_date'],
          },
        ],
      }),
      true
    );

    // Create provider_onboarding table
    await queryRunner.createTable(
      new Table({
        name: 'provider_onboarding',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'gen_random_uuid()',
          },
          {
            name: 'user_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'current_step',
            type: 'varchar',
            isNullable: false,
            default: "'basic_info'",
          },
          {
            name: 'completed_steps',
            type: 'varchar',
            isArray: true,
            default: 'ARRAY[]::varchar[]',
          },
          {
            name: 'status',
            type: 'varchar',
            isNullable: false,
            default: "'pending'",
          },
          {
            name: 'started_at',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'completed_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'suspended_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'suspension_reason',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'now()',
          },
        ],
        indices: [
          {
            name: 'IDX_ONBOARDING_USER',
            columnNames: ['user_id'],
          },
          {
            name: 'IDX_ONBOARDING_STATUS',
            columnNames: ['status'],
          },
        ],
      }),
      true
    );

    // Add foreign key for documents.owner_id -> users.id
    await queryRunner.createForeignKey(
      'documents',
      new TableForeignKey({
        name: 'FK_DOCUMENT_OWNER',
        columnNames: ['owner_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      })
    );

    // Add foreign key for provider_onboarding.user_id -> users.id
    await queryRunner.createForeignKey(
      'provider_onboarding',
      new TableForeignKey({
        name: 'FK_ONBOARDING_USER',
        columnNames: ['user_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      })
    );

    // Add columns to users table for compliance
    await queryRunner.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS kyc_level INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS provider_status VARCHAR DEFAULT NULL,
      ADD COLUMN IF NOT EXISTS ndpr_consent BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS data_processing_consent BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS marketing_consent BOOLEAN DEFAULT false
    `);

    // Add columns to patient_profiles table
    await queryRunner.query(`
      ALTER TABLE patient_profiles 
      ADD COLUMN IF NOT EXISTS nin VARCHAR,
      ADD COLUMN IF NOT EXISTS bvn VARCHAR,
      ADD COLUMN IF NOT EXISTS kyc_level INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS ndpr_consent BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS data_processing_consent BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS marketing_consent BOOLEAN DEFAULT false
    `);

    // Add columns to doctor_profiles table for regulatory compliance
    await queryRunner.query(`
      ALTER TABLE doctor_profiles 
      ADD COLUMN IF NOT EXISTS mdcn_license_number VARCHAR,
      ADD COLUMN IF NOT EXISTS mdcn_expiry_date TIMESTAMP,
      ADD COLUMN IF NOT EXISTS nin VARCHAR,
      ADD COLUMN IF NOT EXISTS bvn VARCHAR,
      ADD COLUMN IF NOT EXISTS provider_status VARCHAR DEFAULT 'pending',
      ADD COLUMN IF NOT EXISTS suspension_reason VARCHAR,
      ADD COLUMN IF NOT EXISTS license_expiry_date TIMESTAMP
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove foreign keys
    await queryRunner.dropForeignKey('documents', 'FK_DOCUMENT_OWNER');
    await queryRunner.dropForeignKey('provider_onboarding', 'FK_ONBOARDING_USER');

    // Drop tables
    await queryRunner.dropTable('documents');
    await queryRunner.dropTable('provider_onboarding');

    // Remove columns from users table
    await queryRunner.query(`
      ALTER TABLE users 
      DROP COLUMN IF EXISTS kyc_level,
      DROP COLUMN IF EXISTS provider_status,
      DROP COLUMN IF EXISTS ndpr_consent,
      DROP COLUMN IF EXISTS data_processing_consent,
      DROP COLUMN IF EXISTS marketing_consent
    `);

    // Remove columns from patient_profiles table
    await queryRunner.query(`
      ALTER TABLE patient_profiles 
      DROP COLUMN IF EXISTS nin,
      DROP COLUMN IF EXISTS bvn,
      DROP COLUMN IF EXISTS kyc_level,
      DROP COLUMN IF EXISTS ndpr_consent,
      DROP COLUMN IF EXISTS data_processing_consent,
      DROP COLUMN IF EXISTS marketing_consent
    `);

    // Remove columns from doctor_profiles table
    await queryRunner.query(`
      ALTER TABLE doctor_profiles 
      DROP COLUMN IF EXISTS mdcn_license_number,
      DROP COLUMN IF EXISTS mdcn_expiry_date,
      DROP COLUMN IF EXISTS nin,
      DROP COLUMN IF EXISTS bvn,
      DROP COLUMN IF EXISTS provider_status,
      DROP COLUMN IF EXISTS suspension_reason,
      DROP COLUMN IF EXISTS license_expiry_date
    `);
  }
}
