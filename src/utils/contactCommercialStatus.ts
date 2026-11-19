export type ContactCommercialTag = 'PROSPECT' | 'CLIENT' | 'DO_NOT_CALL';

export interface ParsedContactNotes {
  explicitTag: ContactCommercialTag | null;
  cleanNotes: string;
}

const TAG_REGEX = /^\[TAG:(CLIENTE|NO_LLAMAR|PROSPECTO)\]\s*/i;

export function parseContactTagAndNotes(rawNotes?: string | null): ParsedContactNotes {
  if (!rawNotes) {
    return { explicitTag: null, cleanNotes: '' };
  }
  const match = rawNotes.match(TAG_REGEX);
  if (!match) {
    return { explicitTag: null, cleanNotes: rawNotes };
  }
  const code = match[1].toUpperCase();
  const explicitTag: ContactCommercialTag =
    code === 'CLIENTE'
      ? 'CLIENT'
      : code === 'NO_LLAMAR'
      ? 'DO_NOT_CALL'
      : 'PROSPECT';
  const cleanNotes = rawNotes.slice(match[0].length);
  return { explicitTag, cleanNotes };
}

export function buildContactNotesWithTag(
  notesInput: string | undefined | null,
  tag: ContactCommercialTag | null
): string {
  const { cleanNotes } = parseContactTagAndNotes(notesInput);
  const trimmed = cleanNotes.trim();
  if (!tag) {
    return trimmed;
  }
  const code =
    tag === 'CLIENT'
      ? 'CLIENTE'
      : tag === 'DO_NOT_CALL'
      ? 'NO_LLAMAR'
      : 'PROSPECTO';
  return trimmed ? `[TAG:${code}] ${trimmed}` : `[TAG:${code}]`;
}

export interface ContactCommercialStatusInfo {
  status: ContactCommercialTag;
  isAuto: boolean;
  label: string;
  shortLabel: string;
  cleanNotes: string;
  explicitTag: ContactCommercialTag | null;
}

export function getContactCommercialStatus(
  contact: { id: string; notes?: string | null },
  deals: { contactId?: string | null; stage?: string }[] = [],
  activities: { contactId?: string | null; result?: string | null }[] = []
): ContactCommercialStatusInfo {
  const { explicitTag, cleanNotes } = parseContactTagAndNotes(contact?.notes);

  if (explicitTag === 'CLIENT') {
    return {
      status: 'CLIENT',
      isAuto: false,
      label: 'Ya es Cliente',
      shortLabel: 'Ya es Cliente',
      cleanNotes,
      explicitTag,
    };
  }

  if (explicitTag === 'DO_NOT_CALL') {
    return {
      status: 'DO_NOT_CALL',
      isAuto: false,
      label: 'No llamar',
      shortLabel: 'No llamar',
      cleanNotes,
      explicitTag,
    };
  }

  if (explicitTag === 'PROSPECT') {
    return {
      status: 'PROSPECT',
      isAuto: false,
      label: 'Prospecto',
      shortLabel: 'Prospecto',
      cleanNotes,
      explicitTag,
    };
  }

  // Automatic detection if not explicitly tagged
  const hasWonDeal = deals.some(
    (d) => d.contactId === contact.id && d.stage === 'WON'
  );
  if (hasWonDeal) {
    return {
      status: 'CLIENT',
      isAuto: true,
      label: 'Cliente (Negocio Ganado)',
      shortLabel: 'Ya es Cliente',
      cleanNotes,
      explicitTag: null,
    };
  }

  const hasNoTargetActivity = activities.some(
    (a) => a.contactId === contact.id && a.result === 'NO_TARGET'
  );
  if (hasNoTargetActivity) {
    return {
      status: 'DO_NOT_CALL',
      isAuto: true,
      label: 'No llamar (No Target)',
      shortLabel: 'No llamar',
      cleanNotes,
      explicitTag: null,
    };
  }

  return {
    status: 'PROSPECT',
    isAuto: false,
    label: 'Prospecto',
    shortLabel: 'Prospecto',
    cleanNotes,
    explicitTag: null,
  };
}
