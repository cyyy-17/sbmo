import { prisma } from '../src/lib/prisma'
import bcryptjs from 'bcryptjs'

async function main() {
  console.log('Seeding database...')

  // Create roles
  const superAdminRole = await prisma.role.upsert({
    where: { name: 'SUPER_ADMIN' },
    update: {},
    create: {
      name: 'SUPER_ADMIN',
      description: 'System Administrator with all permissions'
    }
  })
  
  const adminRole = await prisma.role.upsert({
    where: { name: 'ADMIN' },
    update: {},
    create: {
      name: 'ADMIN',
      description: 'Administrator role'
    }
  })
  
  const staffRole = await prisma.role.upsert({
    where: { name: 'STAFF' },
    update: {},
    create: {
      name: 'STAFF',
      description: 'General staff role'
    }
  })

  // Define granular permissions
  const permissionNames = [
    'students.view', 'students.create', 'students.update', 'students.archive',
    'incidents.view', 'incidents.create', 'incidents.update', 'incidents.delete',
    'cases.view', 'cases.create', 'cases.assign', 'cases.update', 'cases.approve', 'cases.close',
    'documents.view', 'documents.manage',
    'reports.view', 'reports.export',
    'users.manage', 'roles.manage', 'settings.manage'
  ]

  // Create permissions
  const permissions: any[] = []
  for (const name of permissionNames) {
    const perm = await prisma.permission.upsert({
      where: { name },
      update: {},
      create: { name, description: `Permission for ${name}` }
    })
    permissions.push(perm)
  }

  // Helper to assign permissions to a role
  const assignPermissions = async (roleId: string, allowedPerms: string[]) => {
    for (const permName of allowedPerms) {
      const perm = permissions.find(p => p.name === permName)
      if (perm) {
        await prisma.rolePermission.upsert({
          where: {
            roleId_permissionId: {
              roleId,
              permissionId: perm.id
            }
          },
          update: {},
          create: {
            roleId,
            permissionId: perm.id
          }
        })
      }
    }
  }

  // Assign ALL to SUPER_ADMIN
  await assignPermissions(superAdminRole.id, permissionNames)

  // Assign typical admin to ADMIN
  await assignPermissions(adminRole.id, [
    'students.view', 'students.create', 'students.update',
    'incidents.view', 'incidents.create', 'incidents.update',
    'cases.view', 'cases.create', 'cases.assign', 'cases.update', 'cases.approve', 'cases.close',
    'documents.view', 'documents.manage',
    'reports.view', 'reports.export'
  ])

  // Assign basic to STAFF
  await assignPermissions(staffRole.id, [
    'students.view',
    'incidents.view', 'incidents.create',
    'cases.view',
    'documents.view'
  ])

  // Create a default admin user
  const hashedPassword = await bcryptjs.hash('password123', 10)
  
  const adminUser = await prisma.user.upsert({
    where: { email: 'mclemente@firstasia.edu.ph' },
    update: {},
    create: {
      email: 'mclemente@firstasia.edu.ph',
      name: 'Mary Joy Clemente',
      password: hashedPassword,
      roleId: superAdminRole.id
    }
  })

  console.log('Database seeded successfully!')
  
  // Cleanup old roles
  const allowedRoles = ['SUPER_ADMIN', 'ADMIN', 'STAFF']
  const oldRoles = await prisma.role.findMany({
    where: { name: { notIn: allowedRoles } }
  })
  
  for (const role of oldRoles) {
    // reassign users to STAFF before deleting
    await prisma.user.updateMany({
      where: { roleId: role.id },
      data: { roleId: staffRole.id }
    })
    await prisma.role.delete({ where: { id: role.id } })
    console.log(`Deleted old role: ${role.name}`)
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
