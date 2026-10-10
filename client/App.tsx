import { useEffect, useState } from 'react';
import { emptyLease, type LeaseInput } from '../shared/types';
import { Lease, premisesAddress } from '../shared/Lease';
import { StepForm } from './Steps';
import { STEPS, stepLabel, validate, validateAll } from './validate';

const DRAFT_KEY = 'leaseDraft';

function loadDraft(): LeaseInput {
  const raw = localStorage.getItem(DRAFT_KEY);
  return raw ? { ...emptyLease, ...(JSON.parse(raw) as LeaseInput) } : emptyLease;
}

function fileName(lease: LeaseInput): string {
  return `Lease - ${premisesAddress(lease).replace(/[^\w ,.-]/g, '')} - ${lease.term.start}.pdf`;
}

export function App() {
  const [lease, setLease] = useState<LeaseInput>(loadDraft);
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const current = STEPS[step];

  useEffect(() => {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(lease));
  }, [lease]);

  const set = (patch: Partial<LeaseInput>) => setLease((l) => ({ ...l, ...patch }));

  function go(i: number) {
    setStep(i);
    setErrors([]);
  }

  function next() {
    const errs = validate(current, lease);
    setErrors(errs);
    if (errs.length === 0) setStep(step + 1);
  }

  async function generate() {
    const errs = validateAll(lease);
    setErrors(errs);
    if (errs.length > 0) return;
    setBusy(true);
    try {
      const res = await fetch('/api/lease', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(lease),
      });
      if (!res.ok) throw new Error(await res.text());
      const url = URL.createObjectURL(await res.blob());
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName(lease);
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setErrors([String(e)]);
    } finally {
      setBusy(false);
    }
  }

  function newLease() {
    setLease({ ...emptyLease, landlord: lease.landlord });
    go(0);
  }

  return (
    <div className="app">
      <aside className="form">
        <header>
          <h1>Lease Generator</h1>
          <button onClick={newLease}>New lease</button>
        </header>
        <nav>
          {STEPS.map((s, i) => (
            <button key={s} className={i === step ? 'active' : ''} onClick={() => go(i)}>
              {i + 1}. {stepLabel(s, lease)}
            </button>
          ))}
        </nav>
        <section className="step">
          <h2>{stepLabel(current, lease)}</h2>
          <StepForm step={current} lease={lease} set={set} />
        </section>
        {errors.length > 0 && (
          <ul className="errors">
            {errors.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
        )}
        <footer className="actions">
          {step > 0 && <button onClick={() => go(step - 1)}>Back</button>}
          {step < STEPS.length - 1 ? (
            <button className="primary" onClick={next}>
              Next
            </button>
          ) : (
            <button className="primary" disabled={busy} onClick={generate}>
              {busy ? 'Generating...' : 'Generate lease PDF'}
            </button>
          )}
        </footer>
      </aside>
      <main className="preview">
        <div className="paper">
          <Lease input={lease} />
        </div>
      </main>
    </div>
  );
}
