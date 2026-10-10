import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { IndexedDBNoteRepository } from "@/core/storage/indexeddb";
import { createEmptyNotebook } from "@/core/models/notebook";

// Mock IndexedDB in-memory engine that genuinely supports version transitions,
// object stores, indexes, and transaction lifecycles across database connections.
interface MockStoreData {
  keyPath: string;
  indexes: Map<string, { keyPath: string; unique: boolean }>;
  records: Map<string, unknown>;
}

interface MockDatabaseState {
  version: number;
  stores: Map<string, MockStoreData>;
}

function createMockIndexedDB() {
  const databases = new Map<string, MockDatabaseState>();

  return {
    open(name: string, targetVersion?: number) {
      const openReq: {
        result: unknown;
        error: Error | null;
        transaction: unknown;
        onsuccess: ((ev: unknown) => void) | null;
        onerror: ((ev: unknown) => void) | null;
        onupgradeneeded: ((ev: unknown) => void) | null;
      } = {
        result: null,
        error: null,
        transaction: null,
        onsuccess: null,
        onerror: null,
        onupgradeneeded: null,
      };

      setTimeout(() => {
        let dbState = databases.get(name);
        const isNew = !dbState;
        if (!dbState) {
          dbState = {
            version: 0,
            stores: new Map(),
          };
          databases.set(name, dbState);
        }

        const oldVersion = dbState.version;
        const requestedVersion = targetVersion ?? (isNew ? 1 : oldVersion);

        // Helper to construct IDBDatabase wrapper around dbState
        function buildIDBDatabase(state: MockDatabaseState, activeTx?: unknown) {
          return {
            name,
            get version() {
              return state.version;
            },
            objectStoreNames: {
              contains: (storeName: string) => state.stores.has(storeName),
              get length() {
                return state.stores.size;
              },
            },
            createObjectStore: (storeName: string, options: { keyPath: string }) => {
              if (state.stores.has(storeName)) {
                throw new Error(`ConstraintError: Object store ${storeName} already exists`);
              }
              const storeData: MockStoreData = {
                keyPath: options.keyPath,
                indexes: new Map(),
                records: new Map(),
              };
              state.stores.set(storeName, storeData);
              return buildIDBObjectStore(storeName, state, activeTx);
            },
            transaction: (storeNames: string | string[], mode: "readonly" | "readwrite") => {
              const names = Array.isArray(storeNames) ? storeNames : [storeNames];
              for (const n of names) {
                if (!state.stores.has(n)) {
                  throw new Error(`NotFoundError: Object store ${n} not found`);
                }
              }

              let oncompleteHandler: (() => void) | null = null;
              let onerrorHandler: ((err: unknown) => void) | null = null;
              let onabortHandler: ((err: unknown) => void) | null = null;

              const tx = {
                mode,
                set oncomplete(fn: (() => void) | null) {
                  oncompleteHandler = fn;
                },
                get oncomplete(): unknown {
                  return oncompleteHandler;
                },
                set onerror(fn: ((err: unknown) => void) | null) {
                  onerrorHandler = fn;
                },
                get onerror(): unknown {
                  return onerrorHandler;
                },
                set onabort(fn: ((err: unknown) => void) | null) {
                  onabortHandler = fn;
                },
                get onabort(): unknown {
                  return onabortHandler;
                },
                error: null,
                objectStore: (storeName: string) => {
                  if (!names.includes(storeName)) {
                    throw new Error(`NotFoundError: Object store ${storeName} not in transaction`);
                  }
                  return buildIDBObjectStore(storeName, state, tx);
                },
              };

              // Automatically complete transaction asynchronously after pending requests
              setTimeout(() => {
                if (oncompleteHandler) {
                  oncompleteHandler();
                }
              }, 0);

              return tx;
            },
            close: () => {},
          };
        }

        function buildIDBObjectStore(storeName: string, state: MockDatabaseState, tx?: unknown) {
          const store = state.stores.get(storeName);
          if (!store) {
            throw new Error(`Object store ${storeName} does not exist`);
          }

          return {
            name: storeName,
            keyPath: store.keyPath,
            indexNames: {
              contains: (idxName: string) => store.indexes.has(idxName),
              get length() {
                return store.indexes.size;
              },
            },
            createIndex: (idxName: string, keyPath: string, options: { unique: boolean }) => {
              store.indexes.set(idxName, { keyPath, unique: options.unique });
            },
            put: (record: Record<string, unknown>) => {
              const key = record[store.keyPath] as string;
              store.records.set(key, structuredClone(record));
            },
            get: (key: string) => {
              const req: {
                result: unknown;
                error: null;
                onsuccess: ((ev: unknown) => void) | null;
                onerror: null;
              } = {
                result: undefined,
                error: null,
                onsuccess: null,
                onerror: null,
              };
              setTimeout(() => {
                const found = store.records.get(key);
                req.result = found ? structuredClone(found) : undefined;
                req.onsuccess?.({ target: req });
              }, 0);
              return req;
            },
            getAll: () => {
              const req: {
                result: unknown;
                error: null;
                onsuccess: ((ev: unknown) => void) | null;
                onerror: null;
              } = {
                result: [],
                error: null,
                onsuccess: null,
                onerror: null,
              };
              setTimeout(() => {
                const all = Array.from(store.records.values()).map((r) => structuredClone(r));
                req.result = all;
                req.onsuccess?.({ target: req });
              }, 0);
              return req;
            },
            delete: (key: string) => {
              store.records.delete(key);
            },
          };
        }

        // Check if version upgrade needed
        if (requestedVersion > oldVersion) {
          const upgradeTx = {
            mode: "versionchange",
            objectStore: (storeName: string) => buildIDBObjectStore(storeName, dbState, upgradeTx),
          };

          openReq.transaction = upgradeTx;
          const upgradeDb = buildIDBDatabase(dbState, upgradeTx);
          openReq.result = upgradeDb;

          if (openReq.onupgradeneeded) {
            openReq.onupgradeneeded({
              target: openReq,
              oldVersion,
              newVersion: requestedVersion,
            });
          }

          dbState.version = requestedVersion;
        }

        const finalDb = buildIDBDatabase(dbState);
        openReq.result = finalDb;
        if (openReq.onsuccess) {
          openReq.onsuccess({ target: openReq });
        }
      }, 0);

      return openReq;
    },
  };
}

describe("IndexedDB v1 to v2 Migration & Persistence Integrity", () => {
  let originalWindow: Window & typeof globalThis;
  let mockIDB: ReturnType<typeof createMockIndexedDB>;

  beforeEach(() => {
    originalWindow = global.window;
    mockIDB = createMockIndexedDB();
    // @ts-expect-error test harness assignment
    global.window = { indexedDB: mockIDB };
  });

  afterEach(() => {
    global.window = originalWindow;
  });

  it("upgrades a populated v1 database to v2, preserves legacy data, applies default invariants, and supports Phase 4 operations", async () => {
    // -------------------------------------------------------------
    // STAGE 1: Seed a real, populated v1 database exactly as in Phase 2/3
    // -------------------------------------------------------------
    await new Promise<void>((resolve, reject) => {
      const v1Req = mockIDB.open("notesready-db", 1);

      v1Req.onupgradeneeded = (event: unknown) => {
        const ev = event as { target: { result: any } };
        const db = ev.target.result;
        const notesStore = db.createObjectStore("notes", { keyPath: "id" });
        notesStore.createIndex("updatedAt", "updatedAt", { unique: false });
        notesStore.createIndex("isFavorite", "isFavorite", { unique: false });
        notesStore.createIndex("deletedAt", "deletedAt", { unique: false });
      };

      v1Req.onsuccess = (event: unknown) => {
        const ev = event as { target: { result: any } };
        const db = ev.target.result;
        const tx = db.transaction("notes", "readwrite");
        const store = tx.objectStore("notes");

        // Seed 1: Legacy note with NO format and NO Phase 4 fields (plain text legacy)
        store.put({
          id: "v1-legacy-plain-1",
          title: "Architecture Decisions v1",
          content: "Original plain text body recorded in Phase 2.",
          createdAt: "2026-10-01T10:00:00.000Z",
          updatedAt: "2026-10-01T10:00:00.000Z",
          isFavorite: false,
          deletedAt: null,
          // Intentionally missing: format, notebookId, tags, archivedAt
        });

        // Seed 2: Phase 3 rich-text note with tiptap-json-v1, NO Phase 4 fields
        store.put({
          id: "v1-phase3-tiptap-2",
          title: "Rich Editor RFC v1",
          content: '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Rich text notes."}]}]}',
          format: "tiptap-json-v1",
          createdAt: "2026-10-02T12:00:00.000Z",
          updatedAt: "2026-10-02T12:00:00.000Z",
          isFavorite: true,
          deletedAt: null,
          // Intentionally missing: notebookId, tags, archivedAt
        });

        // Seed 3: Legacy soft-deleted note
        store.put({
          id: "v1-legacy-trashed-3",
          title: "Obsolete Draft",
          content: "Draft to discard.",
          createdAt: "2026-10-03T08:00:00.000Z",
          updatedAt: "2026-10-03T09:00:00.000Z",
          isFavorite: false,
          deletedAt: "2026-10-03T09:00:00.000Z",
        });

        tx.oncomplete = () => {
          db.close();
          resolve();
        };
        tx.onerror = reject;
      };

      v1Req.onerror = reject;
    });

    // -------------------------------------------------------------
    // STAGE 2: Open database via IndexedDBNoteRepository (DB_VERSION = 2)
    // -------------------------------------------------------------
    const repo = new IndexedDBNoteRepository();
    expect(repo.isDurable).toBe(true);

    // Initial read triggers the repository's getDB() and onupgradeneeded migration
    const readNote1 = await repo.getNote("v1-legacy-plain-1");
    expect(readNote1).not.toBeNull();

    // Verify data preservation of v1 content & title
    expect(readNote1?.id).toBe("v1-legacy-plain-1");
    expect(readNote1?.title).toBe("Architecture Decisions v1");
    expect(readNote1?.content).toBe("Original plain text body recorded in Phase 2.");
    expect(readNote1?.isFavorite).toBe(false);
    expect(readNote1?.deletedAt).toBeNull();

    // Verify Phase 4 legacy defaults are safely applied without data corruption
    expect(readNote1?.format).toBe("plain-text-v1"); // Legacy default format
    expect(readNote1?.notebookId).toBeNull(); // Default inbox assignment
    expect(readNote1?.tags).toEqual([]); // Default empty tags
    expect(readNote1?.archivedAt).toBeNull(); // Default active note

    // Verify Note 2 (Phase 3 tiptap content) preservation
    const readNote2 = await repo.getNote("v1-phase3-tiptap-2");
    expect(readNote2).not.toBeNull();
    expect(readNote2?.format).toBe("tiptap-json-v1"); // Rich text format marker preserved
    expect(readNote2?.isFavorite).toBe(true); // Favorite status preserved
    expect(readNote2?.notebookId).toBeNull(); // Phase 4 default applied
    expect(readNote2?.tags).toEqual([]); // Phase 4 default applied
    expect(readNote2?.archivedAt).toBeNull(); // Phase 4 default applied

    // -------------------------------------------------------------
    // STAGE 3: Verify Query Views (Exclusions & Active Lists)
    // -------------------------------------------------------------
    // Active notes list excludes soft-deleted notes and orders descending by updatedAt
    const activeNotes = await repo.listNotes();
    expect(activeNotes.length).toBe(2);
    expect(activeNotes[0].id).toBe("v1-phase3-tiptap-2"); // Newer first
    expect(activeNotes[1].id).toBe("v1-legacy-plain-1");

    // Trashed notes query retrieves Note 3 with defaults applied
    const trashedNotes = await repo.listTrashedNotes();
    expect(trashedNotes.length).toBe(1);
    expect(trashedNotes[0].id).toBe("v1-legacy-trashed-3");
    expect(trashedNotes[0].deletedAt).toBe("2026-10-03T09:00:00.000Z");
    expect(trashedNotes[0].notebookId).toBeNull();
    expect(trashedNotes[0].tags).toEqual([]);

    // -------------------------------------------------------------
    // STAGE 4: Verify Phase 4 Operations on Upgraded Schema
    // -------------------------------------------------------------
    // 1. Create and persist a new Notebook in the newly created 'notebooks' store
    const notebook = createEmptyNotebook({ id: "nb-q4-specs", name: "Q4 Engineering Specs" });
    await repo.saveNotebook(notebook);

    const loadedNotebook = await repo.getNotebook("nb-q4-specs");
    expect(loadedNotebook).not.toBeNull();
    expect(loadedNotebook?.name).toBe("Q4 Engineering Specs");

    const notebookList = await repo.listNotebooks();
    expect(notebookList.length).toBe(1);
    expect(notebookList[0].id).toBe("nb-q4-specs");

    // 2. Associate a legacy note with the notebook and assign tags
    const updatedNote1 = {
      ...readNote1!,
      notebookId: "nb-q4-specs",
      tags: ["architecture", "rfc"],
    };
    await repo.saveNote(updatedNote1);

    // Verify filtered query by notebook
    const notebookNotes = await repo.listNotesByNotebook("nb-q4-specs");
    expect(notebookNotes.length).toBe(1);
    expect(notebookNotes[0].id).toBe("v1-legacy-plain-1");
    expect(notebookNotes[0].tags).toEqual(["architecture", "rfc"]);

    // Verify filtered query by tag
    const taggedNotes = await repo.listNotesByTag("architecture");
    expect(taggedNotes.length).toBe(1);
    expect(taggedNotes[0].id).toBe("v1-legacy-plain-1");

    // 3. Test Archive and Recovery on pre-existing note
    await repo.archiveNote("v1-phase3-tiptap-2");
    const activeAfterArchive = await repo.listNotes();
    expect(activeAfterArchive.length).toBe(1);
    expect(activeAfterArchive[0].id).toBe("v1-legacy-plain-1");

    const archivedNotes = await repo.listArchivedNotes();
    expect(archivedNotes.length).toBe(1);
    expect(archivedNotes[0].id).toBe("v1-phase3-tiptap-2");
    expect(archivedNotes[0].archivedAt).not.toBeNull();

    // -------------------------------------------------------------
    // STAGE 5: Verify Reopening Without Migration Re-Run
    // -------------------------------------------------------------
    // Instantiate a fresh repository connection (simulating app reload)
    const repoReopened = new IndexedDBNoteRepository();
    const reloadedNotebooks = await repoReopened.listNotebooks();
    expect(reloadedNotebooks.length).toBe(1);
    expect(reloadedNotebooks[0].name).toBe("Q4 Engineering Specs");

    const reloadedNote1 = await repoReopened.getNote("v1-legacy-plain-1");
    expect(reloadedNote1?.notebookId).toBe("nb-q4-specs");
    expect(reloadedNote1?.tags).toEqual(["architecture", "rfc"]);
    expect(reloadedNote1?.content).toBe("Original plain text body recorded in Phase 2.");
  });
});
