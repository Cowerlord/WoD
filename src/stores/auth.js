import { reactive } from "vue";

export const auth = reactive({
  status: "loading",
  me: null,
  charLimit: 10,
  error: "",
});

export const isAdmin = () => auth.me?.role === "admin";
