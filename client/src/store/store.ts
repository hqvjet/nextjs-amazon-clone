import { create } from "zustand";
import {
  AuthSlice,
  createAuthSlice,
  CartSlice,
  createCartSlice,
  createOrdersSlice,
  OrdersSlice,
  ToastsSlice,
  createToastsSlice,
  UiSlice,
  createUiSlice,
} from "./slices";

type StoreState = AuthSlice & CartSlice & OrdersSlice & ToastsSlice & UiSlice;

export const useAppStore = create<StoreState>()((...a) => ({
  ...createAuthSlice(...a),
  ...createCartSlice(...a),
  ...createOrdersSlice(...a),
  ...createToastsSlice(...a),
  ...createUiSlice(...a),
}));
