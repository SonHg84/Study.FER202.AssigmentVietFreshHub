// Logger middleware: in ra mọi action đi qua store cùng state trước/sau (Slot 16-17).
// Middleware chạy SAU khi dispatch và TRƯỚC khi action tới reducer.
const logger = (store) => (next) => (action) => {
  if (process.env.NODE_ENV === "production") return next(action);
  console.groupCollapsed(`%caction %c${action.type}`, "color:#888", "color:#30634e;font-weight:bold");
  console.log("prev state", store.getState());
  console.log("action", action);
  const result = next(action);
  console.log("next state", store.getState());
  console.groupEnd();
  return result;
};

export default logger;
