import type { Profile } from "@/lib/profile";

interface ProfileFicheProps {
  profile: Profile;
  onChange: (profile: Profile) => void;
}

export function ProfileFiche({ profile, onChange }: ProfileFicheProps) {
  function update(field: keyof Profile, value: string) {
    onChange({ ...profile, [field]: value });
  }

  return (
    <aside className="fiche profile-fiche" aria-labelledby="fiche-profil">
      <span className="tape" aria-hidden="true" />
      <h2 id="fiche-profil" className="kicker">
        Fiche profil
      </h2>
      <div className="field">
        <label htmlFor="name">Qui</label>
        <input
          id="name"
          name="name"
          autoComplete="name"
          value={profile.name}
          onChange={(event) => update("name", event.target.value)}
        />
      </div>
      <div className="field">
        <label htmlFor="headline">En une ligne</label>
        <textarea
          id="headline"
          name="headline"
          rows={2}
          value={profile.headline}
          onChange={(event) => update("headline", event.target.value)}
        />
      </div>
      <div className="field">
        <label htmlFor="practice">Pratique actuelle</label>
        <textarea
          id="practice"
          name="practice"
          rows={4}
          value={profile.practice}
          onChange={(event) => update("practice", event.target.value)}
        />
      </div>
      <div className="field">
        <label htmlFor="notThis">Pas ça</label>
        <textarea
          id="notThis"
          name="notThis"
          rows={3}
          value={profile.notThis}
          onChange={(event) => update("notThis", event.target.value)}
        />
      </div>
      <div className="field">
        <label htmlFor="evidence">Preuves</label>
        <textarea
          id="evidence"
          name="evidence"
          rows={4}
          value={profile.evidence}
          onChange={(event) => update("evidence", event.target.value)}
        />
      </div>
      <div className="field">
        <label htmlFor="tools">Outils</label>
        <textarea
          id="tools"
          name="tools"
          rows={2}
          value={profile.tools}
          onChange={(event) => update("tools", event.target.value)}
        />
      </div>
    </aside>
  );
}
