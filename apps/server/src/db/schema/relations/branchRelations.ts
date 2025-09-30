import { relations } from 'drizzle-orm';
import { branch } from '../branch';
import { user } from '../auth';

export const branchRelations = relations(branch, ({ one }) => ({
  owner: one(user, {
    fields: [branch.ownerId],
    references: [user.id],
  }),
}));
