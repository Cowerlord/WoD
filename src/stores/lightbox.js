import { reactive } from "vue";

export const lightbox = reactive({ src: null });

export const showImage = src => { if (src) lightbox.src = src; };
export const hideImage = () => { lightbox.src = null; };
