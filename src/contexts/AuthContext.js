import { createContext, useCallback, useContext, useMemo, useState } from "react";
import PropTypes from "prop-types";
import { userApi } from "../api/services";

const AUTH_KEY = "vfh_user";
const AuthContext = createContext(null);

const readUser = () => {
  try {
    return JSON.parse(localStorage.getItem(AUTH_KEY));
  } catch {
    return null;
  }
};

// Không bao giờ giữ mật khẩu trong state/localStorage.
const stripPassword = ({ password, ...rest }) => rest;

// Provider: tạo dữ liệu người dùng đăng nhập và chia sẻ cho cả cây component (Context API).
export function AuthProvider({ children }) {
  const [user, setUser] = useState(readUser);

  const saveUser = useCallback((next) => {
    if (next) localStorage.setItem(AUTH_KEY, JSON.stringify(next));
    else localStorage.removeItem(AUTH_KEY);
    setUser(next);
  }, []);

  // Đăng nhập bằng email hoặc tên đăng nhập.
  const login = useCallback(
    async (identifier, password) => {
      const key = identifier.includes("@") ? "email" : "username";
      const found = await userApi.list({ [key]: identifier.trim().toLowerCase() });
      const account = found[0];
      if (!account || account.password !== password) {
        throw new Error("Email/tên đăng nhập hoặc mật khẩu không đúng.");
      }
      if (account.status === "LOCKED") {
        throw new Error("Tài khoản đã bị khoá. Vui lòng liên hệ quản trị viên.");
      }
      const safe = stripPassword(account);
      saveUser(safe);
      return safe;
    },
    [saveUser]
  );

  const register = useCallback(
    async ({ fullName, email, username, phone, password }) => {
      const [byEmail, byUsername] = await Promise.all([
        userApi.list({ email: email.toLowerCase() }),
        userApi.list({ username: username.toLowerCase() }),
      ]);
      if (byEmail.length) throw new Error("Email đã được sử dụng.");
      if (byUsername.length) throw new Error("Tên đăng nhập đã được sử dụng.");
      const created = await userApi.create({
        email: email.toLowerCase(),
        username: username.toLowerCase(),
        fullName,
        phone,
        password,
        role: "CUSTOMER",
        status: "ACTIVE",
        createdAt: new Date().toISOString(),
      });
      const safe = stripPassword(created);
      saveUser(safe);
      return safe;
    },
    [saveUser]
  );

  const logout = useCallback(() => saveUser(null), [saveUser]);

  // Cập nhật thông tin hồ sơ trong context sau khi lưu lên server.
  const updateProfile = useCallback((changes) => saveUser({ ...user, ...changes }), [saveUser, user]);

  const value = useMemo(
    () => ({ user, login, register, logout, updateProfile }),
    [user, login, register, logout, updateProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

// Custom hook tiêu thụ context.
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth phải dùng bên trong <AuthProvider>");
  return context;
};
