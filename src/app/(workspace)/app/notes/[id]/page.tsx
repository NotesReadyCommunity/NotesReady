"use client";

import React from "react";
import { useParams } from "next/navigation";
import { NoteEditor } from "@/components/workspace/NoteEditor";

export default function NoteDetailPage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : Array.isArray(params.id) ? params.id[0] : "";

  if (!id) {
    return null;
  }

  return <NoteEditor noteId={id} />;
}
