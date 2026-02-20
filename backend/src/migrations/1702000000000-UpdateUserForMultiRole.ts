import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class UpdateUserForMultiRole1702000000000 implements MigrationInterface {
  name = 'UpdateUserForMultiRole1702000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add roles column (simple-array for PostgreSQL)
    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'roles',
        type: 'simple-array',
        isNullable: true,
        default: "'patient'",
      }),
    );

    // Add activeRole column
    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'activeRole',
        type: 'varchar',
        isNullable: true,
        default: "'patient'",
      }),
    );

    // Migrate existing role data to roles array
    await queryRunner.query(`
      UPDATE users 
      SET roles = ARRAY[role]::varchar[], 
          "activeRole" = role::varchar
      WHERE role IS NOT NULL
    `);

    // Drop the old role column
    await queryRunner.dropColumn('users', 'role');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Add back the role column
    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'role',
        type: 'varchar',
        isNullable: true,
      }),
    );

    // Migrate data back
    await queryRunner.query(`
      UPDATE users 
      SET role = roles[1]::varchar
      WHERE roles IS NOT NULL AND array_length(roles, 1) > 0
    `);

    // Drop the new columns
    await queryRunner.dropColumn('users', 'roles');
    await queryRunner.dropColumn('users', 'activeRole');
  }
}
