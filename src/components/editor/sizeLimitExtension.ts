import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { getContentSizeBytes, HARD_SIZE_LIMIT_BYTES } from "@/core/utils/limits";

export interface SizeLimitOptions {
  onBlockedChange?: (blocked: boolean) => void;
  maxSizeBytes?: number;
}

export const sizeLimitPluginKey = new PluginKey("notesreadySizeLimitFilter");

export function createSizeLimitExtension(options?: SizeLimitOptions) {
  const maxBytes = options?.maxSizeBytes ?? HARD_SIZE_LIMIT_BYTES;

  return Extension.create({
    name: "sizeLimit",
    addProseMirrorPlugins() {
      return [
        new Plugin({
          key: sizeLimitPluginKey,
          filterTransaction(tr, state) {
            if (!tr.docChanged) return true;

            const newJson = tr.doc.toJSON();
            const newSize = getContentSizeBytes(JSON.stringify(newJson));

            if (newSize > maxBytes) {
              const oldJson = state.doc.toJSON();
              const oldSize = getContentSizeBytes(JSON.stringify(oldJson));

              // If expanding beyond limit: drop transaction to safely protect document
              if (newSize > oldSize) {
                options?.onBlockedChange?.(true);
                return false;
              }
            }

            // If content is back within allowed limit, clear blocked warning
            if (newSize <= maxBytes) {
              options?.onBlockedChange?.(false);
            }

            return true;
          },
        }),
      ];
    },
  });
}
