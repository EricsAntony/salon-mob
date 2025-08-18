import { baseApi } from './baseApi';

interface LoginRequest {
  email: string;
  password: string;
}
interface LoginResponse {
  token: string;
  user: { id: string; name: string; email: string };
}

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export const authApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    login: build.mutation<LoginResponse, LoginRequest>({
      // Mocked auth
      queryFn: async (body) => {
        await delay(500);
        const user = { id: '1', name: 'Demo User', email: body.email };
        return { data: { token: 'demo-token', user } };
      },
      invalidatesTags: ['Auth'],
    }),
    signup: build.mutation<LoginResponse, LoginRequest>({
      queryFn: async (body) => {
        await delay(700);
        const user = { id: '2', name: 'New User', email: body.email };
        return { data: { token: 'demo-token', user } };
      },
      invalidatesTags: ['Auth'],
    }),
  }),
});

export const { useLoginMutation, useSignupMutation } = authApi;
