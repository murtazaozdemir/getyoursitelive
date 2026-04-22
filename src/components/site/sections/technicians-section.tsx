"use client";

import Image from "next/image";
import { useBusiness } from "@/lib/business-context";
import { useEditMode } from "@/lib/edit-mode-context";
import { EditableText } from "@/components/editable/editable-text";
import { EditableList, moveInArray } from "@/components/editable/editable-list";
import { EditableImage } from "@/components/editable/editable-image";
import { SectionBlock } from "@/components/editable/section-block";
import { SectionH2 } from "@/components/site/section-h2";
import type { TeamMember } from "@/types/site";

function blankMember(): TeamMember {
  return {
    name: "New team member",
    role: "Technician",
    experience: "5+ years",
    specialty: "",
    image: "https://images.pexels.com/photos/2182972/pexels-photo-2182972.jpeg?auto=compress&cs=tinysrgb&w=800",
  };
}

export function TechniciansSection() {
  const { teamMembers } = useBusiness();
  const edit = useEditMode();

  function patchMember(i: number, patch: Partial<TeamMember>) {
    if (!edit) return;
    const next = [...teamMembers];
    next[i] = { ...next[i], ...patch };
    edit.updateField("teamMembers", next);
  }

  return (
    <SectionBlock name="Team" visibilityKey="showTeam" isEmpty={teamMembers.length === 0}>
      <section id="technicians" className="section-shell mx-auto max-w-7xl px-4 py-16 md:px-8">
        <h2 className="section-title mb-6 text-3xl font-bold">
          <SectionH2 titleKey="team" />
        </h2>
        <div className="grid gap-5 md:grid-cols-4">
          {edit ? (
            <EditableList
              items={teamMembers}
              keyOf={(_, i) => `tm-${i}`}
              addLabel="Add team member"
              onAdd={() => edit.updateField("teamMembers", [...teamMembers, blankMember()])}
              onRemove={(i) =>
                edit.updateField("teamMembers", teamMembers.filter((_, idx) => idx !== i))
              }
              onMove={(i, dir) =>
                edit.updateField("teamMembers", moveInArray(teamMembers, i, dir))
              }
              renderItem={(member, i) => (
                <div className="content-card group overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
                  <EditableImage
                    value={member.image}
                    onCommit={(url) => patchMember(i, { image: url })}
                    uploadLabel={member.image ? "Replace photo" : "Upload photo"}
                    className="team-image-frame relative h-64 overflow-hidden block"
                  >
                    {member.image && (
                      <Image
                        src={member.image}
                        alt={member.name}
                        fill
                        className="team-image object-cover transition duration-500 group-hover:scale-105"
                      />
                    )}
                  </EditableImage>
                  <div className="p-4">
                    <p className="font-semibold">
                      <EditableText
                        value={member.name}
                        onCommit={(v) => patchMember(i, { name: v })}
                        placeholder="Name"
                      />
                    </p>
                    <p className="text-sm text-[var(--muted)]">
                      <EditableText
                        value={member.role}
                        onCommit={(v) => patchMember(i, { role: v })}
                        placeholder="Role"
                      />
                    </p>
                    <p className="mt-2 text-xs">
                      <EditableText
                        value={member.experience}
                        onCommit={(v) => patchMember(i, { experience: v })}
                        placeholder="Experience"
                      />
                      {" - "}
                      <EditableText
                        value={member.specialty}
                        onCommit={(v) => patchMember(i, { specialty: v })}
                        placeholder="Specialty"
                      />
                    </p>
                    <p className="mt-2 text-xs text-[var(--muted)]">
                      Image URL (optional, or use upload above):{" "}
                      <EditableText
                        value={member.image}
                        onCommit={(v) => patchMember(i, { image: v })}
                        placeholder="https://…"
                      />
                    </p>
                  </div>
                </div>
              )}
            />
          ) : (
            teamMembers.map((member) => (
              <div
                key={member.name}
                className="content-card group overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]"
              >
                <div className="team-image-frame relative h-64 overflow-hidden">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    className="team-image object-cover transition duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-4">
                  <p className="font-semibold">{member.name}</p>
                  <p className="text-sm text-[var(--muted)]">{member.role}</p>
                  <p className="mt-2 text-xs">
                    {member.experience} - {member.specialty}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </SectionBlock>
  );
}
