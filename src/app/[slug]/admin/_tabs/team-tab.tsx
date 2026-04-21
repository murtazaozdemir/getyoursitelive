"use client";

import type { Business } from "@/lib/business-types";
import type { TeamMember } from "@/types/site";
import { RepeatableList, moveInArray } from "./repeatable";

function blankMember(): TeamMember {
  return { name: "", role: "", experience: "", specialty: "", image: "" };
}

export function TeamTab({
  business,
  update,
}: {
  business: Business;
  update: <K extends keyof Business>(key: K, value: Business[K]) => void;
}) {
  const team = business.teamMembers ?? [];

  function patch(i: number, patchObj: Partial<TeamMember>) {
    const next = [...team];
    next[i] = { ...next[i], ...patchObj };
    update("teamMembers", next);
  }

  return (
    <section className="admin-section">
      <h2 className="admin-section-title">Team</h2>
      <p className="admin-section-lede">
        People customers will meet. Photos use a public URL for now.
      </p>

      <RepeatableList
        items={team}
        keyOf={(_, i) => `${i}`}
        addLabel="+ Add team member"
        emptyText="No team members yet."
        onAdd={() => update("teamMembers", [...team, blankMember()])}
        onRemove={(i) => update("teamMembers", team.filter((_, idx) => idx !== i))}
        onMove={(i, dir) => update("teamMembers", moveInArray(team, i, dir))}
        renderItem={(member, i) => (
          <div className="admin-grid">
            <label className="admin-field">
              <span className="admin-field-label">Name</span>
              <input
                className="admin-input"
                value={member.name}
                onChange={(e) => patch(i, { name: e.target.value })}
              />
            </label>
            <label className="admin-field">
              <span className="admin-field-label">Role</span>
              <input
                className="admin-input"
                placeholder="Master Technician"
                value={member.role}
                onChange={(e) => patch(i, { role: e.target.value })}
              />
            </label>
            <label className="admin-field">
              <span className="admin-field-label">Experience</span>
              <input
                className="admin-input"
                placeholder="20+ years"
                value={member.experience}
                onChange={(e) => patch(i, { experience: e.target.value })}
              />
            </label>
            <label className="admin-field">
              <span className="admin-field-label">Specialty</span>
              <input
                className="admin-input"
                placeholder="Diesel engines"
                value={member.specialty}
                onChange={(e) => patch(i, { specialty: e.target.value })}
              />
            </label>
            <label className="admin-field admin-field--wide">
              <span className="admin-field-label">Image URL</span>
              <input
                className="admin-input"
                type="url"
                placeholder="https://..."
                value={member.image}
                onChange={(e) => patch(i, { image: e.target.value })}
              />
            </label>
          </div>
        )}
      />
    </section>
  );
}
