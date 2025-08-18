export const isEmail = (v: string) => /.+@.+\..+/.test(v);
export const isNonEmpty = (v: string) => v.trim().length > 0;
