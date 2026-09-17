import { useDispatch } from 'react-redux';
import {
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  useGetCurrentUserQuery,
  useUpdateAccountMutation,
  authApi,
} from '../store/api/authApi';
import { sessionApi, stopAllSessionFinalizationPolls } from '../store/api/sessionApi';
import { projectApi } from '../store/api/projectApi';

const getApiErrorMessage = (error, fallback) => {
  const message = [
    error?.data?.message,
    error?.data?.data?.message,
    error?.data?.error?.message,
    typeof error?.error === 'string' ? error.error : null,
    error?.message,
  ].find((value) => typeof value === 'string' && value.trim());

  return message?.trim() || fallback;
};

/* ─── Login ─────────────────────────────────── */
export const useLogin = () => {
  const [login, { isLoading, error }] = useLoginMutation();

  const handleLogin = async (credentials) => {
    try {
      const data = await login(credentials).unwrap();
      return { success: true, data };
    } catch (err) {
      return { success: false, error: getApiErrorMessage(err, 'Unable to sign in. Please try again.') };
    }
  };

  return { login: handleLogin, isLoading, error };
};

/* ─── Register ───────────────────────────────── */
export const useRegister = () => {
  const [register, { isLoading, error }] = useRegisterMutation();

  const handleRegister = async (userData) => {
    try {
      const data = await register(userData).unwrap();
      return { success: true, data };
    } catch (err) {
      return { success: false, error: getApiErrorMessage(err, 'Unable to create your account. Please try again.') };
    }
  };

  return { register: handleRegister, isLoading, error };
};

/* ─── Logout ─────────────────────────────────── */
export const useLogout = () => {
  const [logout, { isLoading }] = useLogoutMutation();
  const dispatch = useDispatch();

  const handleLogout = async () => {
    try {
      await logout().unwrap();
      stopAllSessionFinalizationPolls();
      dispatch(authApi.util.resetApiState());
      dispatch(sessionApi.util.resetApiState());
      dispatch(projectApi.util.resetApiState());
      return { success: true };
    } catch {
      // The local UI must not retain another account's cached data when a
      // network failure prevents the server-side logout response.
      stopAllSessionFinalizationPolls();
      dispatch(authApi.util.resetApiState());
      dispatch(sessionApi.util.resetApiState());
      dispatch(projectApi.util.resetApiState());
      return { success: false };
    }
  };

  return { logout: handleLogout, isLoading };
};

/* ─── Current User ───────────────────────────── */
export const useCurrentUser = (queryOptions) => {
  const { data, isLoading, isFetching, isError, error } = useGetCurrentUserQuery(undefined, queryOptions);
  // A rejected refresh can leave RTK Query's previous fulfilled value in the
  // cache. Never expose that stale user as an authenticated session.
  const user = isError ? undefined : data;
  // Only the very first auth lookup should replace the page with a loader.
  // Background refetches must keep the current route mounted so forms do not
  // lose local validation or server-error state.
  return { user, isLoading, isFetching, error, isAuthenticated: Boolean(user) };
};

/* ─── Update Account ─────────────────────────── */
export const useUpdateAccount = () => {
  const [updateAccount, { isLoading, error }] = useUpdateAccountMutation();

  const handleUpdateAccount = async (userData) => {
    try {
      const data = await updateAccount(userData).unwrap();
      return { success: true, data };
    } catch (err) {
      return { success: false, error: err.data?.message || 'Update failed' };
    }
  };

  return { updateAccount: handleUpdateAccount, isLoading, error };
};
