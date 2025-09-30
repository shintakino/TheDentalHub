import { relations } from 'drizzle-orm';
import { user, account, session } from '../auth';
import type { User, Account, Session } from '../auth';

// User relations
export const userRelations = relations(user, ({ many }) => ({
  accounts: many(account),
  sessions: many(session),
}));

// Account relations
export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));

// Session relations
export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

// Composite types
export type UserWithRelations = User & {
  accounts: Account[];
  sessions: Session[];
};
