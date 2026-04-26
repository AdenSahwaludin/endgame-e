import bcrypt from 'bcryptjs'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { email, password } = body

  if (!email || !password) {
    throw createError({ statusCode: 400, statusMessage: 'Email dan password wajib diisi' })
  }

  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      role: {
        include: {
          permissions: { include: { permission: true } },
        },
      },
    },
  })

  if (!user || user.deletedAt) {
    throw createError({ statusCode: 401, statusMessage: 'Email atau password salah' })
  }

  if (!user.isActive) {
    throw createError({ statusCode: 403, statusMessage: 'Akun Anda tidak aktif. Hubungi administrator.' })
  }

  const valid = await bcrypt.compare(password, user.password)
  if (!valid) {
    throw createError({ statusCode: 401, statusMessage: 'Email atau password salah' })
  }

  const permissions = user.role.permissions.map(rp => rp.permission.name)

  await setUserSession(event, {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role.name,
      permissions,
    },
  })

  await logAktivitas({
    userId: user.id,
    jenis: 'login',
    deskripsi: `User ${user.name} login`,
    ipAddress: getRequestIP(event) || undefined,
    userAgent: getRequestHeader(event, 'user-agent') || undefined,
  })

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role.name,
      permissions,
    },
  }
})
