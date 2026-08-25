import { ChangerMotDePasseView } from "@/components/features/admin-auth/changer-mot-de-passe-view";

export default function ChangerMotDePassePage() {
  return (
    <div className="fixed inset-0 z-[200] flex flex-col items-center overflow-y-auto bg-ink px-5 py-10">
      <div className="relative m-auto flex w-full max-w-103 flex-col items-center gap-5.5">
        <div className="w-full rounded-lg bg-white p-9 shadow-overlay">
          <img src="/assets/logo/mec-lockup.png" alt="MEC" className="mb-6.5 h-8 w-auto" />
          <ChangerMotDePasseView />
        </div>
      </div>
    </div>
  );
}
