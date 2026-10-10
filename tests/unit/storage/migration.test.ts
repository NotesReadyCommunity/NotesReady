import { describe, it, expect, beforeEach } from "vitest";
import "fake-indexeddb/auto";
import { IDBFactory } from "fake-indexeddb";
import { IndexedDBNoteRepository } from "@/core/storage/indexeddb";
import { createEmptyNotebook } from "@/core/models/notebook";

describe("IndexedDB v1 to v2 Migration & Persistence Integrity", () => {
  beforeEach(() => {
    // Provide a fresh, isolated IndexedDB instance for each test run
    window.indexedDB = new IDBFactory();
  });

  it("upgrades a populated v1 database to v2, preserves legacy data, applies default invariants, and supports Phase 4 operations using genuine IndexedDB", async () => {
    // -------------------------------------------------------------
    // STAGE 1: Seed a real, populated v1 database exactly as in Phase 2/3
    // -------------------------------------------------------------
    await new Promise<void>((resolve, reject) => {
      const v1Req = window.indexedDB.open("notesready-db", 1);

      v1Req.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        // Version 1 schema (Phase 2 & 3):
        // Only the "notes" store exists, with updatedAt, isFavorite, and deletedAt indexes.
        const notesStore = db.createObjectStore("notes", { keyPath: "id" });
        notesStore.createIndex("updatedAt", "updatedAt", { unique: false });
        notesStore.createIndex("isFavorite", "isFavorite", { unique: false });
        notesStore.createIndex("deletedAt", "deletedAt", { unique: false });
        // NOTE: "notebookId" and "archivedAt" indexes do NOT exist in v1.
        // NOTE: "notebooks" store does NOT exist in v1.
      };

      v1Req.onsuccess = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        const tx = db.transaction("notes", "readwrite");
        const store = tx.objectStore("notes");

        // Seed 1: Legacy plain-text note without Phase 4 fields (Phase 2 legacy)
        store.put({
          id: "v1-legacy-plain-1",
          title: "Architecture Decisions v1",
          content: "Original plain text body recorded in Phase 2.",
          createdAt: "2026-10-01T10:00:00.000Z",
          updatedAt: "2026-10-01T10:00:00.000Z",
          isFavorite: false,
          deletedAt: null,
          // Intentionally missing Phase 4 fields: format, notebookId, tags, archivedAt
        });

        // Seed 2: Phase 3 rich-text note with tiptap-json-v1, without Phase 4 fields
        store.put({
          id: "v1-phase3-tiptap-2",
          title: "Rich Editor RFC v1",
          content: '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Rich text notes."}]}]}',
          format: "tiptap-json-v1",
          createdAt: "2026-10-02T12:00:00.000Z",
          updatedAt: "2026-10-02T12:00:00.000Z",
          isFavorite: true,
          deletedAt: null,
          // Intentionally missing Phase 4 fields: notebookId, tags, archivedAt
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
          // Intentionally missing Phase 4 fields: format, notebookId, tags, archivedAt
        });

        tx.oncomplete = () => {
          db.close();
          resolve();
        };
        tx.onerror = () => reject(tx.error);
        tx.onabort = () => reject(tx.error);
      };

      v1Req.onerror = () => reject(v1Req.error);
    });

    // -------------------------------------------------------------
    // STAGE 2: Upgrade through actual IndexedDBNoteRepository (DB_VERSION = 2)
    // -------------------------------------------------------------
    const repo = new IndexedDBNoteRepository();
    expect(repo.isDurable).toBe(true);

    // Initial read triggers the repository's getDB() and onupgradeneeded migration
    const readNote1 = await repo.getNote("v1-legacy-plain-1");
    expect(readNote1).not.toBeNull();

    // -------------------------------------------------------------
    // STAGE 3: Verify Schema Integrity (Indexes & Stores in Genuine DB)
    // -------------------------------------------------------------
    await new Promise<void>((resolve, reject) => {
      const inspectReq = window.indexedDB.open("notesready-db");
      inspectReq.onsuccess = () => {
        const db = inspectReq.result;
        expect(db.version).toBe(2);

        // Verify stores
        expect(db.objectStoreNames.contains("notes")).toBe(true);
        expect(db.objectStoreNames.contains("notebooks")).toBe(true);

        const tx = db.transaction(["notes", "notebooks"], "readonly");
        const notesStore = tx.objectStore("notes");
        const notebooksStore = tx.objectStore("notebooks");

        // Verify indexes on 'notes' store
        expect(notesStore.indexNames.contains("updatedAt")).toBe(true);
        expect(notesStore.indexNames.contains("isFavorite")).toBe(true);
        expect(notesStore.indexNames.contains("deletedAt")).toBe(true);
        expect(notesStore.indexNames.contains("notebookId")).toBe(true);
        expect(notesStore.indexNames.contains("archivedAt")).toBe(true);

        // Verify indexes on 'notebooks' store
        expect(notebooksStore.indexNames.contains("updatedAt")).toBe(true);
        expect(notebooksStore.indexNames.contains("name")).toBe(true);

        db.close();
        resolve();
      };
      inspectReq.onerror = () => reject(inspectReq.error);
    });

    // -------------------------------------------------------------
    // STAGE 4: Verify Data Preservation & Legacy Defaults
    // -------------------------------------------------------------
    // Note 1: Legacy plain text
    expect(readNote1?.id).toBe("v1-legacy-plain-1");
    expect(readNote1?.title).toBe("Architecture Decisions v1");
    expect(readNote1?.content).toBe("Original plain text body recorded in Phase 2.");
    expect(readNote1?.createdAt).toBe("2026-10-01T10:00:00.000Z");
    expect(readNote1?.updatedAt).toBe("2026-10-01T10:00:00.000Z");
    expect(readNote1?.isFavorite).toBe(false);
    expect(readNote1?.deletedAt).toBeNull();
    // Legacy defaults applied:
    expect(readNote1?.format).toBe("plain-text-v1");
    expect(readNote1?.notebookId).toBeNull();
    expect(readNote1?.tags).toEqual([]);
    expect(readNote1?.archivedAt).toBeNull();

    // Note 2: Phase 3 Tiptap rich text
    const readNote2 = await repo.getNote("v1-phase3-tiptap-2");
    expect(readNote2).not.toBeNull();
    expect(readNote2?.id).toBe("v1-phase3-tiptap-2");
    expect(readNote2?.title).toBe("Rich Editor RFC v1");
    expect(readNote2?.content).toBe(
      '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Rich text notes."}]}]}'
    );
    expect(readNote2?.format).toBe("tiptap-json-v1");
    expect(readNote2?.createdAt).toBe("2026-10-02T12:00:00.000Z");
    expect(readNote2?.updatedAt).toBe("2026-10-02T12:00:00.000Z");
    expect(readNote2?.isFavorite).toBe(true);
    expect(readNote2?.deletedAt).toBeNull();
    // Legacy defaults applied:
    expect(readNote2?.notebookId).toBeNull();
    expect(readNote2?.tags).toEqual([]);
    expect(readNote2?.archivedAt).toBeNull();

    // Note 3: Soft-deleted note
    const readNote3 = await repo.getNote("v1-legacy-trashed-3");
    expect(readNote3).not.toBeNull();
    expect(readNote3?.id).toBe("v1-legacy-trashed-3");
    expect(readNote3?.title).toBe("Obsolete Draft");
    expect(readNote3?.content).toBe("Draft to discard.");
    expect(readNote3?.deletedAt).toBe("2026-10-03T09:00:00.000Z");
    // Legacy defaults applied:
    expect(readNote3?.format).toBe("plain-text-v1");
    expect(readNote3?.notebookId).toBeNull();
    expect(readNote3?.tags).toEqual([]);
    expect(readNote3?.archivedAt).toBeNull();

    // -------------------------------------------------------------
    // STAGE 5: Verify Query Views (Active vs. Trashed)
    // -------------------------------------------------------------
    // Active notes list excludes soft-deleted notes and orders descending by updatedAt
    const activeNotes = await repo.listNotes();
    expect(activeNotes.length).toBe(2);
    expect(activeNotes[0].id).toBe("v1-phase3-tiptap-2"); // Newer first (2026-10-02)
    expect(activeNotes[1].id).toBe("v1-legacy-plain-1");   // Older second (2026-10-01)

    // Trashed notes query retrieves Note 3 with defaults applied
    const trashedNotes = await repo.listTrashedNotes();
    expect(trashedNotes.length).toBe(1);
    expect(trashedNotes[0].id).toBe("v1-legacy-trashed-3");
    expect(trashedNotes[0].deletedAt).toBe("2026-10-03T09:00:00.000Z");
    expect(trashedNotes[0].notebookId).toBeNull();
    expect(trashedNotes[0].tags).toEqual([]);

    // -------------------------------------------------------------
    // STAGE 6: Verify Phase 4 Operations on Upgraded Schema
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

    // 3. Test Archive and Recovery on pre-existing Phase 3 note
    await repo.archiveNote("v1-phase3-tiptap-2");
    const activeAfterArchive = await repo.listNotes();
    expect(activeAfterArchive.length).toBe(1);
    expect(activeAfterArchive[0].id).toBe("v1-legacy-plain-1");

    const archivedNotes = await repo.listArchivedNotes();
    expect(archivedNotes.length).toBe(1);
    expect(archivedNotes[0].id).toBe("v1-phase3-tiptap-2");
    expect(archivedNotes[0].archivedAt).not.toBeNull();

    // -------------------------------------------------------------
    // STAGE 7: Verify Reopening Without Migration Re-Run
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
    expect(reloadedNote1?.format).toBe("plain-text-v1");

    const reloadedArchived = await repoReopened.listArchivedNotes();
    expect(reloadedArchived.length).toBe(1);
    expect(reloadedArchived[0].id).toBe("v1-phase3-tiptap-2");
  });
});
