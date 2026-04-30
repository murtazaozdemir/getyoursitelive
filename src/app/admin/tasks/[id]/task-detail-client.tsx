"use client";

import { useState, useRef, useTransition, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Task, TaskItemWithProspect } from "@/lib/tasks";
import {
  type UserHome,
  type SenderInfo,
  printLabels,
  printEnvelopes,
  printTaskList,
  showLeadsMap,
} from "../../leads/print-utils";
import {
  renameTaskAction,
  completeTaskAction,
  reopenTaskAction,
  toggleItemDroppedOffAction,
  saveItemNotesAction,
  searchProspectsAction,
  addItemsAction,
  removeItemAction,
  deleteTaskAction,
} from "../actions";

export function TaskDetailClient({
  task,
  items: initialItems,
  userHome,
}: {
  task: Task;
  items: TaskItemWithProspect[];
  userHome: UserHome | null;
  senderInfo: SenderInfo | null;
}) {
  const router = useRouter();
  const [items, setItems] = useState(() => initialItems.filter((i) => i.prospectName));
  const [taskName, setTaskName] = useState(task.name);
  const [editingName, setEditingName] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [showAddLeads, setShowAddLeads] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<{ slug: string; name: string; address: string }[]>([]);
  const [searching, setSearching] = useState(false);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [filterQuery, setFilterQuery] = useState("");

  const sortedItems = useMemo(() =>
    [...items].sort((a, b) => (a.prospectName ?? "").localeCompare(b.prospectName ?? "")),
    [items]
  );

  const filteredItems = useMemo(() => {
    if (!filterQuery.trim()) return sortedItems;
    const q = filterQuery.toLowerCase();
    return sortedItems.filter((i) =>
      i.prospectName.toLowerCase().includes(q) ||
      (i.prospectAddress && i.prospectAddress.toLowerCase().includes(q)) ||
      (i.prospectPhone && i.prospectPhone.includes(q))
    );
  }, [sortedItems, filterQuery]);

  const pendingItems = filteredItems.filter((i) => i.status === "pending");
  const droppedOffItems = filteredItems.filter((i) => i.status === "dropped_off");
  const totalCount = items.length;
  const remainingCount = items.filter((i) => i.status === "pending").length;

  function handleRename() {
    if (!taskName.trim()) return;
    setEditingName(false);
    startTransition(() => {
      renameTaskAction(task.id, taskName);
    });
  }

  function handleToggleItem(itemId: string, currentStatus: string) {
    const newStatus = currentStatus === "pending" ? "dropped_off" : "pending";
    setItems((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, status: newStatus as "pending" | "dropped_off" } : i))
    );
    startTransition(() => {
      toggleItemDroppedOffAction(itemId, newStatus === "dropped_off");
    });
  }

  function handleNotesBlur(itemId: string, notes: string) {
    const current = items.find((i) => i.id === itemId);
    if (current && current.notes === notes) return;
    setItems((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, notes } : i))
    );
    startTransition(() => {
      saveItemNotesAction(itemId, notes);
    });
  }

  function handleComplete() {
    startTransition(() => {
      completeTaskAction(task.id).then(() => router.refresh());
    });
  }

  function handleReopen() {
    startTransition(() => {
      reopenTaskAction(task.id).then(() => router.refresh());
    });
  }

  function handleSearchChange(value: string) {
    setSearchQuery(value);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    if (value.trim().length < 2) {
      setSearchResults([]);
      setSearching(false);
      return;
    }
    setSearching(true);
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const results = await searchProspectsAction(task.id, value);
        setSearchResults(results);
      } catch {
        setSearchResults([]);
      }
      setSearching(false);
    }, 300);
  }

  function handleAddLead(slug: string) {
    setSearchResults((prev) => prev.filter((r) => r.slug !== slug));
    startTransition(async () => {
      await addItemsAction(task.id, [slug]);
      router.refresh();
    });
  }

  function handleRemoveItem(itemId: string, name: string) {
    if (!confirm(`Remove "${name}" from this task?`)) return;
    setItems((prev) => prev.filter((i) => i.id !== itemId));
    startTransition(() => {
      removeItemAction(task.id, itemId);
    });
  }

  function handleDelete() {
    if (!confirm("Delete this task? This cannot be undone.")) return;
    startTransition(() => {
      deleteTaskAction(task.id);
    });
  }

  function handlePrintEnvelopes() {
    if (!senderInfo) {
      alert("Set your Company and Address in Account Settings first.");
      return;
    }
    printEnvelopes(
      pendingItems.map((i) => ({
        slug: i.prospectSlug,
        name: i.prospectName,
        address: i.prospectAddress,
      })),
      senderInfo,
    );
  }

  function handlePrintLabels() {
    printLabels(
      pendingItems.map((i) => ({
        slug: i.prospectSlug,
        name: i.prospectName,
        address: i.prospectAddress,
      }))
    );
  }

  function handlePrintTaskList() {
    printTaskList(
      pendingItems.map((i) => ({
        slug: i.prospectSlug,
        name: i.prospectName,
        address: i.prospectAddress,
      }))
    );
  }

  function handlePrintProposals() {
    const slugs = pendingItems.map((i) => i.prospectSlug).join(",");
    window.open(`/admin/proposal/bulk?slugs=${encodeURIComponent(slugs)}`, "_blank");
  }

  function handleShowMap() {
    if (!userHome) {
      alert("Set your address in Account Settings first.");
      return;
    }
    if (pendingItems.length === 0) {
      alert("No pending items.");
      return;
    }
    showLeadsMap(
      pendingItems.map((i) => ({
        slug: i.prospectSlug,
        name: i.prospectName,
        address: i.prospectAddress,
        lat: i.prospectLat,
        lng: i.prospectLng,
      })),
      userHome,
    );
  }

  return (
    <div className="task-detail">
      {/* Header */}
      <div className="task-detail-header">
        <Link href="/admin/tasks" className="admin-btn admin-btn--ghost task-detail-back">
          &larr; All tasks
        </Link>

        <div className="task-detail-title-row">
          {editingName ? (
            <input
              className="task-name-input"
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
              onBlur={handleRename}
              onKeyDown={(e) => { if (e.key === "Enter") handleRename(); if (e.key === "Escape") { setTaskName(task.name); setEditingName(false); } }}
              autoFocus
            />
          ) : (
            <h1
              className="task-detail-name"
              onClick={() => task.status === "active" && setEditingName(true)}
              title={task.status === "active" ? "Click to rename" : undefined}
            >
              {taskName}
            </h1>
          )}

          <span className={`task-status-badge task-status-badge--${task.status}`}>
            {task.status === "active" ? "Active" : "Completed"}
          </span>
        </div>

        <p className="task-detail-meta">
          Created by {task.createdByName} &middot;{" "}
          {new Date(task.createdAt).toLocaleDateString("en-US", {
            month: "long", day: "numeric", year: "numeric",
          })}
        </p>

        <div className="task-detail-progress-text">
          <strong>{remainingCount}</strong> of {totalCount} remaining
          {droppedOffItems.length > 0 && (
            <> &middot; <strong>{droppedOffItems.length}</strong> dropped off</>
          )}
        </div>

        <div className="task-progress-bar task-progress-bar--detail">
          <div
            className="task-progress-fill"
            style={{ width: totalCount > 0 ? `${(droppedOffItems.length / totalCount) * 100}%` : "0%" }}
          />
        </div>
      </div>

      {/* Toolbar */}
      {task.status === "active" && (
        <div className="task-detail-toolbar">
          <button type="button" className="admin-btn admin-btn--primary" onClick={() => setShowAddLeads(!showAddLeads)} disabled={isPending}>
            + Add leads
          </button>
          {pendingItems.length > 0 && (
            <>
              <button type="button" className="admin-btn admin-btn--ghost" onClick={handlePrintProposals} disabled={isPending}>
                Print proposals ({pendingItems.length})
              </button>
              <button type="button" className="admin-btn admin-btn--ghost" onClick={handlePrintLabels} disabled={isPending}>
                Print labels ({pendingItems.length})
              </button>
              <button type="button" className="admin-btn admin-btn--ghost" onClick={handlePrintEnvelopes} disabled={isPending}>
                Print envelopes ({pendingItems.length})
              </button>
              <button type="button" className="admin-btn admin-btn--ghost" onClick={handlePrintTaskList} disabled={isPending}>
                Print task list
              </button>
              <button type="button" className="admin-btn admin-btn--ghost" onClick={handleShowMap} disabled={isPending}>
                Show map
              </button>
            </>
          )}
        </div>
      )}

      {/* Add leads search */}
      {showAddLeads && (
        <div className="task-add-leads">
          <input
            type="text"
            className="task-add-leads-input"
            placeholder="Search leads by name..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            autoFocus
          />
          {searching && <p className="task-add-leads-status">Searching...</p>}
          {!searching && searchQuery.length >= 2 && searchResults.length === 0 && (
            <p className="task-add-leads-status">No leads found</p>
          )}
          {searchResults.length > 0 && (
            <div className="task-add-leads-results">
              {searchResults.map((r) => (
                <div key={r.slug} className="task-add-leads-result">
                  <div>
                    <strong>{r.name}</strong>
                    {r.address && <span className="task-add-leads-address"> — {r.address}</span>}
                  </div>
                  <button
                    type="button"
                    className="admin-btn admin-btn--ghost"
                    onClick={() => handleAddLead(r.slug)}
                  >
                    Add
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Filter */}
      {items.length > 0 && (
        <div className="task-filter">
          <input
            type="text"
            className="task-filter-input"
            placeholder="Filter leads..."
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
          />
          {filterQuery && (
            <span className="task-filter-count">
              {filteredItems.length} of {items.length}
            </span>
          )}
        </div>
      )}

      {/* Checklist — pending items first */}
      <div className="task-checklist">
        {pendingItems.length > 0 && (
          <div className="task-checklist-section">
            {pendingItems.map((item, idx) => (
              <TaskItemRow
                key={item.id}
                item={item}
                index={idx + 1}
                highlight={filterQuery}
                onToggle={() => handleToggleItem(item.id, item.status)}
                onNotesBlur={(notes) => handleNotesBlur(item.id, notes)}
                onRemove={task.status === "active" ? () => handleRemoveItem(item.id, item.prospectName) : undefined}
              />
            ))}
          </div>
        )}

        {droppedOffItems.length > 0 && (
          <div className="task-checklist-section">
            <h3 className="task-checklist-divider">Dropped off ({droppedOffItems.length})</h3>
            {droppedOffItems.map((item) => (
              <TaskItemRow
                key={item.id}
                item={item}
                highlight={filterQuery}
                onToggle={() => handleToggleItem(item.id, item.status)}
                onNotesBlur={(notes) => handleNotesBlur(item.id, notes)}
                onRemove={task.status === "active" ? () => handleRemoveItem(item.id, item.prospectName) : undefined}
              />
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="task-detail-actions">
        {task.status === "active" ? (
          <button type="button" className="admin-btn admin-btn--primary" onClick={handleComplete} disabled={isPending}>
            Mark task complete
          </button>
        ) : (
          <button type="button" className="admin-btn admin-btn--ghost" onClick={handleReopen} disabled={isPending}>
            Reopen task
          </button>
        )}
        <button type="button" className="admin-btn admin-btn--danger" onClick={handleDelete} disabled={isPending}>
          Delete task
        </button>
      </div>
    </div>
  );
}

function highlightText(text: string, query: string) {
  if (!query.trim()) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="task-highlight">{text.slice(idx, idx + query.length)}</mark>
      {text.slice(idx + query.length)}
    </>
  );
}

function TaskItemRow({
  item,
  index,
  highlight,
  onToggle,
  onNotesBlur,
  onRemove,
}: {
  item: TaskItemWithProspect;
  index?: number;
  highlight?: string;
  onToggle: () => void;
  onNotesBlur: (notes: string) => void;
  onRemove?: () => void;
}) {
  const [notes, setNotes] = useState(item.notes);
  const isDroppedOff = item.status === "dropped_off";
  const q = highlight || "";

  return (
    <div className={`task-item${isDroppedOff ? " task-item--done" : ""}`}>
      <button
        type="button"
        className={`task-item-check${isDroppedOff ? " task-item-check--checked" : ""}`}
        onClick={onToggle}
        aria-label={isDroppedOff ? "Mark as pending" : "Mark as dropped off"}
      >
        {isDroppedOff && (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M2 7l3.5 3.5L12 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>

      <div className="task-item-info">
        <div className="task-item-name-row">
          {index != null && <span className="task-item-num">{index}.</span>}
          <Link href={`/admin/leads/${item.prospectSlug}`} className="task-item-name">
            {highlightText(item.prospectName, q)}
          </Link>
        </div>
        {item.prospectAddress && (
          <p className="task-item-address">{highlightText(item.prospectAddress, q)}</p>
        )}
        {item.prospectPhone && (
          <p className="task-item-phone">{highlightText(item.prospectPhone, q)}</p>
        )}
        {item.prospectContactMethod && (
          <p className="task-item-phone" style={{ fontStyle: "italic" }}>
            Via {item.prospectContactMethod.charAt(0).toUpperCase() + item.prospectContactMethod.slice(1)}
          </p>
        )}
      </div>

      <div className="task-item-notes">
        <textarea
          className="task-item-notes-input"
          placeholder="Notes..."
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          onBlur={() => onNotesBlur(notes)}
        />
      </div>

      {onRemove && (
        <button
          type="button"
          className="task-item-remove"
          onClick={onRemove}
          aria-label="Remove from task"
          title="Remove from task"
        >
          ×
        </button>
      )}
    </div>
  );
}
