import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { MemoryNoteRepository } from "@/core/storage/memory";
import { IndexedDBNoteRepository } from "@/core/storage/indexeddb";
import { getNoteRepository, setNoteRepository, getStorageError } from "@/core/storage";
import { createEmptyNote } from "@/core/models/note";
import { createEmptyNotebook } from "@/core/models/notebook";

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

  it("lists trashed notes and restores a soft-deleted note", async () => {
    const note1 = createEmptyNote({ title: "Note to Keep" });
    const note2 = createEmptyNote({ title: "Note to Trash" });
    await repo.saveNote(note1);
    await repo.saveNote(note2);

    await repo.deleteNote(note2.id);

    const active = await repo.listNotes();
    expect(active.length).toBe(1);
    expect(active[0].id).toBe(note1.id);

    const trashed = await repo.listTrashedNotes();
    expect(trashed.length).toBe(1);
    expect(trashed[0].id).toBe(note2.id);

    // Restore note2
    await repo.restoreNote(note2.id);
    const restoredActive = await repo.listNotes();
    expect(restoredActive.length).toBe(2);

    const trashedAfter = await repo.listTrashedNotes();
    expect(trashedAfter.length).toBe(0);
  });

  it("archives notes, excludes them from active list, and unarchives them", async () => {
    const note = createEmptyNote({ title: "Reference Document" });
    await repo.saveNote(note);

    await repo.archiveNote(note.id);

    // Excluded from standard active list
    const active = await repo.listNotes();
    expect(active.length).toBe(0);

    // Present in archive list
    const archived = await repo.listArchivedNotes();
    expect(archived.length).toBe(1);
    expect(archived[0].id).toBe(note.id);
    expect(archived[0].archivedAt).not.toBeNull();

    // Unarchive
    await repo.unarchiveNote(note.id);
    const activeAfter = await repo.listNotes();
    expect(activeAfter.length).toBe(1);
    expect(activeAfter[0].archivedAt).toBeNull();
  });

  it("filters notes by notebook and tag", async () => {
    const note1 = createEmptyNote({
      title: "Design Note",
      notebookId: "nb-design",
      tags: ["ui", "tokens"],
    });
    const note2 = createEmptyNote({
      title: "Backend Note",
      notebookId: "nb-backend",
      tags: ["db", "tokens"],
    });
    await repo.saveNote(note1);
    await repo.saveNote(note2);

    const designNotes = await repo.listNotesByNotebook("nb-design");
    expect(designNotes.length).toBe(1);
    expect(designNotes[0].id).toBe(note1.id);

    const tokenNotes = await repo.listNotesByTag("tokens");
    expect(tokenNotes.length).toBe(2);

    const uiNotes = await repo.listNotesByTag("UI"); // case-insensitive
    expect(uiNotes.length).toBe(1);
    expect(uiNotes[0].id).toBe(note1.id);
  });

  it("handles notebook lifecycle and unassigns affected notes on deletion", async () => {
    const nb = createEmptyNotebook({ name: "Work Projects" });
    await repo.saveNotebook(nb);

    const list = await repo.listNotebooks();
    expect(list.length).toBe(1);
    expect(list[0].name).toBe("Work Projects");

    const note = createEmptyNote({ title: "Project Plan", notebookId: nb.id });
    await repo.saveNote(note);

    // Delete notebook: notebook deleted, note preserved with notebookId = null
    await repo.deleteNotebook(nb.id);

    const listAfter = await repo.listNotebooks();
    expect(listAfter.length).toBe(0);

    const noteAfter = await repo.getNote(note.id);
    expect(noteAfter).not.toBeNull();
    expect(noteAfter?.notebookId).toBeNull();
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

    // Wait until transaction and complete handler are initialized
    for (let i = 0; i < 100 && !completeHandler; i++) {
      await new Promise((r) => setTimeout(r, 10));
    }
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

    // Wait until transaction and abort handler are initialized
    for (let i = 0; i < 100 && !abortHandler; i++) {
      await new Promise((r) => setTimeout(r, 10));
    }
    expect(abortHandler).not.toBeNull();
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

