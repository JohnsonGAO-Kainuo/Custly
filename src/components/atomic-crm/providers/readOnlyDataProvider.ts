import { HttpError, type DataProvider } from "ra-core";
import { isSubscriptionExpired } from "./pocketbase/subscriptionService";

const EXPIRED_MESSAGE =
  "Your subscription has expired. Please subscribe to continue editing your data.";

/**
 * Wraps a dataProvider to block all mutation operations (create, update, delete)
 * when the user's subscription has expired.
 *
 * Read operations (getList, getOne, getMany, getManyReference) always pass through.
 * Export operations are not affected.
 *
 * When a mutation is blocked, a user-friendly HttpError 403 is thrown,
 * which React Admin displays as a notification toast.
 */
export const withReadOnlyGuard = (
  dataProvider: DataProvider
): DataProvider => {
  const guardMutation = () => {
    if (isSubscriptionExpired()) {
      throw new HttpError(EXPIRED_MESSAGE, 403);
    }
  };

  return {
    ...dataProvider,
    create: async (resource, params) => {
      guardMutation();
      return dataProvider.create(resource, params);
    },
    update: async (resource, params) => {
      guardMutation();
      return dataProvider.update(resource, params);
    },
    delete: async (resource, params) => {
      guardMutation();
      return dataProvider.delete(resource, params);
    },
    deleteMany: async (resource, params) => {
      guardMutation();
      return dataProvider.deleteMany(resource, params);
    },
    updateMany: async (resource, params) => {
      guardMutation();
      return dataProvider.updateMany(resource, params);
    },
  };
};
