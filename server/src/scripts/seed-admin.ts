import dotenv from 'dotenv';

dotenv.config();

import database from '../config/database';
import User from '../models/User';
import { PasswordUtil } from '../utils/password';
import logger from '../utils/logger';

const required = (value: string | undefined, name: string): string => {
  if (!value) {
    throw new Error(`${name} is required`);
  }
  return value;
};

const seedAdmin = async (): Promise<void> => {
  const email = required(process.env.ADMIN_EMAIL, 'ADMIN_EMAIL').toLowerCase();
  const password = required(process.env.ADMIN_PASSWORD, 'ADMIN_PASSWORD');
  const firstName = process.env.ADMIN_FIRST_NAME || 'Admin';
  const lastName = process.env.ADMIN_LAST_NAME || 'User';

  await database.connect();

  const existing = await User.findOne({ email, deletedAt: null });
  if (existing) {
    if (existing.systemRole !== 'admin') {
      existing.systemRole = 'admin';
      existing.isActive = true;
      existing.isEmailVerified = true;
      await existing.save();
      logger.info(`Updated ${email} to admin role.`);
    } else {
      logger.info(`Admin already exists: ${email}`);
    }
    await database.disconnect();
    return;
  }

  const hashedPassword = await PasswordUtil.hash(password);

  await User.create({
    firstName,
    lastName,
    email,
    password: hashedPassword,
    isActive: true,
    isEmailVerified: true,
    systemRole: 'admin',
  });

  logger.info(`Seeded admin user: ${email}`);
  await database.disconnect();
};

seedAdmin().catch((error) => {
  logger.error('Failed to seed admin user:', error);
  process.exit(1);
});
