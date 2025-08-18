import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import { logout, setCredentials } from '../store/slices/authSlice';

export function useAuth() {
  const auth = useAppSelector((s) => s.auth);
  const dispatch = useAppDispatch();

  const signIn = useCallback(
    (token: string, user: { id: string; name: string; email: string }) => {
      dispatch(setCredentials({ token, user }));
    },
    [dispatch],
  );

  const signOut = useCallback(() => {
    dispatch(logout());
  }, [dispatch]);

  return { ...auth, signIn, signOut };
}
