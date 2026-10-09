import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { MemoryNoteRepository } from "@/core/storage/memory";
import { IndexedDBNoteRepository } from "@/core/storage/indexeddb";
import { getNoteRepository, setNoteRepository, getStorageError } from "@/core/storage";
import { createEmptyNote } from "@/core/models/note";

describe("MemoryNoteRepository", () => {
  let repo: MemoryNoteRepository;

  beforeEach(() => {
    repo = new MemoryNoteRepository();
  });

  it("identifies memory repository as non-durable", () => {
    expect(repo.isDurable).toBe(false);
  });

  it("saves and retrieves a note by ID", async () => {
    const note = createEmptyNote({ title: "First Note", content: "Hello world" });
    await repo.saveNote(note);

    const retrieved = await repo.getNote(note.id);
    expect(retrieved).not.toBeNull();
    expect(retrieved?.id).toBe(note.id);
    expect(retrieved?.title).toBe("First Note");
    expect(retrieved?.content).toBe("Hello world");
  });

  it("returns null for non-existent note IDs", async () => {
    const retrieved = await repo.getNote("non-existent-id");
    expect(retrieved).toBeNull();
  });

  it("lists notes in descending order by updatedAt", async () => {
    const note1 = createEmptyNote({ title: "Older Note" });
    note1.updatedAt = "2026-10-01T10:00:00.000Z";
    await repo.saveNote(note1);

    const note2 = createEmptyNote({ title: "Newer Note" });
    note2.updatedAt = "2026-10-02T10:00:00.000Z";
    await repo.saveNote(note2);

    const list = await repo.listNotes();
    expect(list.length).toBe(2);
    expect(list[0].id).toBe(note2.id); // newer first
    expect(list[1].id).toBe(note1.id);
  });

  it("soft-deletes notes and excludes them from active queries", async () => {
    const note = createEmptyNote({ title: "To Be Deleted" });
    await repo.saveNote(note);

    await repo.deleteNote(note.id);

    const activeList = await repo.listNotes();
    expect(activeList.find((n) => n.id === note.id)).toBeUndefined();

    // Verify soft-deleted record retains deletedAt timestamp
    const record = await repo.getNote(note.id);
    expect(record?.deletedAt).not.toBeNull();
  });

  it("respects limit parameter in listRecentNotes", async () => {
    for (let i = 0; i < 5; i++) {
      const n = createEmptyNote({ title: `Note ${i}` });
      n.updatedAt = `2026-10-0${i + 1}T10:00:00.000Z`;
      await repo.saveNote(n);
    }

    const recent = await repo.listRecentNotes(3);
    expect(recent.length).toBe(3);
    expect(recent[0].title).toBe("Note 4");
  });
});

describe("Storage Honesty & IndexedDB Durability", () => {
  afterEach(() => {
    setNoteRepository(null);
    vi.restoreAllMocks();
  });

  it("surfaces storage unavailable error in browser when indexedDB is missing", () => {
    setNoteRepository(null);

    // Simulate browser window without indexedDB
    const originalWindow = global.window;
    // @ts-expect-error test simulation
    global.window = { indexedDB: undefined };

    const repo = getNoteRepository();
    expect(repo.isDurable).toBe(false);
    expect(getStorageError()).toContain("Storage unavailable");

    global.window = originalWindow;
  });

  it("resolves saveNote only after transaction.oncomplete", async () => {
    let completeHandler: (() => void) | null = null;
    let putCalled = false;

    const mockStore = {
      put: vi.fn(() => {
        putCalled = true;
      }),
    };

    const mockTx = {
      objectStore: vi.fn(() => mockStore),
      set oncomplete(fn: (() => void) | null) {
        completeHandler = fn;
      },
      get oncomplete(): unknown {
        return completeHandler;
      },
      onerror: null as ((err: unknown) => void) | null,
      onabort: null as ((err: unknown) => void) | null,
    };

    const mockDb = {
      objectStoreNames: { contains: () => true },
      transaction: vi.fn(() => mockTx),
    };

    const originalWindow = global.window;
    global.window = {
      indexedDB: {
        open: () => {
          const req: Record<string, unknown> = {};
          setTimeout(() => {
            if (typeof req.onsuccess === "function") {
              req.result = mockDb;
              req.onsuccess({ target: req });
            }
          }, 0);
          return req;
        },
      },
    } as unknown as Window & typeof globalThis;

    const repo = new IndexedDBNoteRepository();
    expect(repo.isDurable).toBe(true);

    const note = createEmptyNote({ title: "Durability Test" });
    let resolved = false;

    const savePromise = repo.saveNote(note).then(() => {
      resolved = true;
    });

    // Wait for DB open and store.put
    await new Promise((r) => setTimeout(r, 10));
    expect(putCalled).toBe(true);
    // Promise should NOT be resolved before transaction oncomplete
    expect(resolved).toBe(false);

    // Trigger transaction completion
    if (completeHandler) {
      (completeHandler as () => void)();
    }
    await savePromise;
    expect(resolved).toBe(true);

    global.window = originalWindow;
  });

  it("rejects saveNote when transaction aborts or errors", async () => {
    let abortHandler: (() => void) | null = null;

    const mockTx = {
      objectStore: vi.fn(() => ({ put: vi.fn() })),
      oncomplete: null,
      set onabort(fn: (() => void) | null) {
        abortHandler = fn;
      },
      get onabort(): unknown {
        return abortHandler;
      },
      onerror: null,
      error: new Error("QuotaExceededError"),
    };

    const mockDb = {
      objectStoreNames: { contains: () => true },
      transaction: vi.fn(() => mockTx),
    };

    const originalWindow = global.window;
    global.window = {
      indexedDB: {
        open: () => {
          const req: Record<string, unknown> = {};
          setTimeout(() => {
            if (typeof req.onsuccess === "function") {
              req.result = mockDb;
              req.onsuccess({ target: req });
            }
          }, 0);
          return req;
        },
      },
    } as unknown as Window & typeof globalThis;

    const repo = new IndexedDBNoteRepository();
    const note = createEmptyNote({ title: "Abort Test" });

    const savePromise = repo.saveNote(note);

    await new Promise((r) => setTimeout(r, 10));
    if (abortHandler) {
      (abortHandler as () => void)();
    }

    await expect(savePromise).rejects.toThrow("QuotaExceededError");

    global.window = originalWindow;
  });

  it("resets dbPromise on open error to allow subsequent retries", async () => {
    let openCallCount = 0;
    const originalWindow = global.window;

    global.window = {
      indexedDB: {
        open: () => {
          openCallCount++;
          const req: Record<string, unknown> = {};
          setTimeout(() => {
            if (openCallCount === 1) {
              if (typeof req.onerror === "function") {
                req.error = new Error("Database locked");
                req.onerror(req);
              }
            } else {
              if (typeof req.onsuccess === "function") {
                req.result = {
                  objectStoreNames: { contains: () => true },
                  transaction: () => ({
                    objectStore: () => ({
                      get: () => {
                        const getReq: Record<string, unknown> = {};
                        setTimeout(() => {
                          if (typeof getReq.onsuccess === "function") {
                            getReq.result = null;
                            getReq.onsuccess({ target: getReq });
                          }
                        }, 0);
                        return getReq;
                      },
                    }),
                  }),
                };
                req.onsuccess({ target: req });
              }
            }
          }, 0);
          return req;
        },
      },
    } as unknown as Window & typeof globalThis;

    const repo = new IndexedDBNoteRepository();

    // First attempt fails
    const firstAttempt = await repo.getNote("test-id");
    expect(firstAttempt).toBeNull();

    // Second attempt retries opening rather than failing with cached rejected promise
    await repo.getNote("test-id");
    expect(openCallCount).toBe(2);

    global.window = originalWindow;
  });
});

