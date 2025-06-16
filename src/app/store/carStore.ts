import { create } from "zustand";

export type CartItem = {
    id: number;
    name: string;
    image: string;
    price: number;
    qty: number;
    note: string;
};

export type CartState = {
    cart: CartItem[];
    addToCart: (item: CartItem) => void;
    removeFromCart: (id: number) => void;
    clearCart: () => void;
    increaseQty: (id: number) => void;
    decreaseQty: (id: number) => void;
    updateNote: (id: number, note: string) => void;
};

export const useCartStore = create<CartState>((set) => ({
    cart: [],
    addToCart: (item) =>
        set((state: CartState) => {
            const exists = state.cart.find((i) => i.id === item.id);
            if (exists) {
                return {
                    cart: state.cart.map((i) =>
                        i.id === item.id
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
    removeFromCart: (id) =>
        set((state: CartState) => ({
            cart: state.cart.filter((i) => i.id !== id),
        })),
    clearCart: () => set({ cart: [] }),
    updateNote: (id, note) =>
        set((state) => ({
            cart: state.cart.map((item) =>
                item.id === id ? { ...item, note } : item
            ),
        })),

    // 🆕 Add these two:
    increaseQty: (id) =>
        set((state: CartState) => ({
            cart: state.cart.map((item) =>
                item.id === id ? { ...item, qty: item.qty + 1 } : item
            ),
        })),
    decreaseQty: (id) =>
        set((state: CartState) => ({
            cart: state.cart
                .map((item) =>
                    item.id === id ? { ...item, qty: item.qty - 1 } : item
                )
                .filter((item) => item.qty > 0), // auto-remove if qty goes to 0
        })),
}));
