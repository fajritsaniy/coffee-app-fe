import { create } from "zustand";

export type CartItem = {
    name: string;
    image: string;
    price: number;
    qty: number;
    note: string;
};

export type CartState = {
    cart: CartItem[];
    addToCart: (item: CartItem) => void;
    removeFromCart: (name: string) => void;
    clearCart: () => void;
    increaseQty: (name: string) => void;
    decreaseQty: (name: string) => void;
    updateNote: (name: string, note: string) => void;
};

export const useCartStore = create<CartState>((set) => ({
    cart: [],
    addToCart: (item) =>
        set((state: CartState) => {
            const exists = state.cart.find((i) => i.name === item.name);
            if (exists) {
                return {
                    cart: state.cart.map((i) =>
                        i.name === item.name
                            ? {
                                ...i,
                                qty: i.qty + item.qty,
                                note: item.note?.trim() ? item.note : i.note,
                            }
                            : i
                    ),
                };
            } else {
                return {
                    cart: [...state.cart, { ...item }],
                };
            }
        }),
    removeFromCart: (name) =>
        set((state: CartState) => ({
            cart: state.cart.filter((i) => i.name !== name),
        })),
    clearCart: () => set({ cart: [] }),
    updateNote: (name, note) =>
        set((state) => ({
            cart: state.cart.map((item) =>
                item.name === name ? { ...item, note } : item
            ),
        })),

    // 🆕 Add these two:
    increaseQty: (name) =>
        set((state: CartState) => ({
            cart: state.cart.map((item) =>
                item.name === name ? { ...item, qty: item.qty + 1 } : item
            ),
        })),
    decreaseQty: (name) =>
        set((state: CartState) => ({
            cart: state.cart
                .map((item) =>
                    item.name === name ? { ...item, qty: item.qty - 1 } : item
                )
                .filter((item) => item.qty > 0), // auto-remove if qty goes to 0
        })),
}));
