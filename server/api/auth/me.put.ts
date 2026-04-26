import bcrypt from "bcryptjs";

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event);
  const sessionUser = session.user as any;

  if (!sessionUser?.id) {
    throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
  }

  const body = await readBody(event);
  const name = String(body.name || "").trim();
  const email = String(body.email || "")
    .trim()
    .toLowerCase();
  const currentPassword = String(body.currentPassword || "");
  const newPassword = String(body.newPassword || "");

  if (!name || !email) {
    throw createError({
      statusCode: 400,
      statusMessage: "Nama dan email wajib diisi",
    });
  }

  const existingUser = await prisma.user.findUnique({
    where: { id: sessionUser.id },
  });
  if (!existingUser || existingUser.deletedAt) {
    throw createError({
      statusCode: 404,
      statusMessage: "User tidak ditemukan",
    });
  }

  if (email !== existingUser.email) {
    const emailUsed = await prisma.user.findUnique({ where: { email } });
    if (emailUsed && emailUsed.id !== existingUser.id) {
      throw createError({
        statusCode: 400,
        statusMessage: "Email sudah digunakan",
      });
    }
  }

  const data: any = { name, email };

  if (newPassword) {
    if (newPassword.length < 8) {
      throw createError({
        statusCode: 400,
        statusMessage: "Password baru minimal 8 karakter",
      });
    }

    if (!currentPassword) {
      throw createError({
        statusCode: 400,
        statusMessage: "Password saat ini wajib diisi",
      });
    }

    const validCurrentPassword = await bcrypt.compare(
      currentPassword,
      existingUser.password,
    );
    if (!validCurrentPassword) {
      throw createError({
        statusCode: 400,
        statusMessage: "Password saat ini tidak valid",
      });
    }

    data.password = await bcrypt.hash(newPassword, 12);
  }

  const updated = await prisma.user.update({
    where: { id: existingUser.id },
    data,
    select: {
      id: true,
      name: true,
      email: true,
      role: {
        include: {
          permissions: { include: { permission: true } },
        },
      },
    },
  });

  await setUserSession(event, {
    user: {
      id: updated.id,
      name: updated.name,
      email: updated.email,
      role: updated.role.name,
    },
  });

  await logAktivitas({
    userId: updated.id,
    jenis: "update",
    deskripsi: `User ${updated.name} memperbarui akun sendiri`,
    namaTabel: "users",
    recordId: String(updated.id),
    ipAddress: getRequestIP(event) || undefined,
    userAgent: getRequestHeader(event, "user-agent") || undefined,
  });

  return {
    message: "Profil berhasil diperbarui",
    user: {
      id: updated.id,
      name: updated.name,
      email: updated.email,
      role: updated.role.name,
    },
  };
});
