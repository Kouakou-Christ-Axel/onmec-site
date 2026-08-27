/** Lien de telechargement direct — le backend redirige (302) vers le fichier R2. */
export function DocumentDownloadLink({ href }: { href: string }) {
  return (
    <a
      href={href}
      className="inline-flex h-[54px] w-fit items-center gap-2.5 rounded-sm bg-orange-500 px-7 text-[1.0625rem] font-semibold text-white transition-colors duration-150 ease-out hover:bg-orange-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
    >
      Télécharger le guide <span>→</span>
    </a>
  );
}
