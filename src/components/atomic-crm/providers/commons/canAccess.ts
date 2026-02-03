// FIXME: This should be exported from the ra-core package
type CanAccessParams<
  RecordType extends Record<string, any> = Record<string, any>,
> = {
  action: string;
  resource: string;
  record?: RecordType;
};

export const canAccess = <
  RecordType extends Record<string, any> = Record<string, any>,
>(
  role: string,
  params: CanAccessParams<RecordType>,
) => {
  // Admin can access everything
  if (role === "admin") {
    return true;
  }

  // For the sales resource (user management), non-admins have limited access
  if (params.resource === "sales") {
    // Allow viewing the list and individual records (for user profile display)
    if (params.action === "list" || params.action === "show") {
      return true;
    }
    // Non-admins can't create, edit, or delete other users
    return false;
  }

  // Non-admin users can access all other resources
  return true;
};
