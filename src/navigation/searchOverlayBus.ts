export type SearchOverlayController = {
  open: () => void;
  close: () => void;
};

let controller: SearchOverlayController | null = null;

export const registerSearchOverlay = (c: SearchOverlayController) => {
  controller = c;
  return () => {
    controller = null;
  };
};

export const openSearchOverlay = () => controller?.open();
export const closeSearchOverlay = () => controller?.close();
