/**
 * Popisek odkazu na přiložený soubor (`driveFileUrl` u pokusů, aktivit a úkolů).
 * Většinou jde o Google Drive, ale může to být i PDF na webu autora (např. MFF UK).
 */
export function fileLinkLabel(url: string): string {
  const host = new URL(url).hostname;
  return host === 'google.com' || host.endsWith('.google.com')
    ? 'Soubor na Google Drive ↗'
    : 'Soubor ke stažení ↗';
}
