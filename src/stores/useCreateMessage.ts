import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

interface CreateMessageState {
  input: string;
  chat_id: string;
}

interface CreateMessageActions {
  setNewMessage: (message: Partial<CreateMessageState>) => void;
  clearNewMessage: () => void;
  setInput: (input: string) => void;
  setChatId: (chat_id: string) => void;
}

// Estado inicial como constante para evitar recreaciones
const initialState: CreateMessageState = {
  input: "",
  chat_id: "",
};

export const useCreateMessage = create<
  CreateMessageState & CreateMessageActions
>()(
  subscribeWithSelector((set) => ({
    ...initialState,

    setNewMessage: (message) => {
      set((state) => {
        return { ...state, ...message };
      });
    },

    clearNewMessage: () => {
      set(() => ({ ...initialState }));
    },

    setInput: (input: string) => {
      set((state) => ({ ...state, input }));
    },

    setChatId: (chat_id: string) => {
      set((state) => ({ ...state, chat_id }));
    },
  }))
);
