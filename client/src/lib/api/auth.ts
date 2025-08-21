import { createUrl, isStoredJwt, post, setStoredJwt, get } from "./api-client";

export const me = async () => {
  try {
    return isStoredJwt() ? (await get(createUrl("/api/me")))?.data : null;
  } catch (err) {
    return err;
  }
};

export const login = async (username: string, password: string) => {
  try {
    const result = await post(createUrl("/api/login"), { username, password });
    setStoredJwt(result?.data?.accessToken);
    return me();
  } catch (err) {
    return err;
  }
};

export const signup = async (
  username: string,
  password: string,
  accountType: "buyer" | "seller" = "buyer",
  sellerDisplayName?: string
) => {
  const payload: any = {
    username,
    password,
    firstName: "demo",
    lastName: "s",
    accountType,
  };
  if (accountType === "seller" && sellerDisplayName) {
    payload.sellerDisplayName = sellerDisplayName;
  }
  const result = (await post(createUrl("/api/signup"), payload).catch(() => null))?.data;

  if (!result) {
    return alert("Could not sign up");
  }
  setStoredJwt(result.accessToken);
  return me();
};

export const upgradeToSeller = async (displayName?: string) => {
  const result = (
    await post(createUrl("/api/upgrade-to-seller"), { displayName }).catch(() => null)
  )?.data;
  if (!result) return null;
  setStoredJwt(result.accessToken);
  return me();
};
