import { useEffect, useState } from 'react';
import { Plus, UserPlus, ArrowUp, ArrowDown, X, PhoneCall, ListOrdered, Trash2, Pencil, History } from 'lucide-react';
import { queueApi, tokenApi, errMsg } from '../services/api.js';
import { useToast } from '../context/ToastContext.jsx';
import { Modal, ConfirmDialog, PageLoader, ErrorBox, EmptyState, Spinner, StatusBadge } from '../components/ui.jsx';
import { fmtTime, fmtDateTime } from '../utils/format.js';

function NameModal({ open, onClose, title, label, initial = '', submitText, onSubmit }) {
  const [value, setValue] = useState(initial);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => { if (open) { setValue(initial); setErr(''); } }, [open, initial]);
  const submit = async (e) => {
    e.preventDefault();
    if (busy) return;
    if (!value.trim()) return setErr(`${label} is required`);
    setBusy(true);
    try { await onSubmit(value.trim()); onClose(); } catch (x) { setErr(errMsg(x)); } finally { setBusy(false); }
  };
  return (
    <Modal open={open} onClose={busy ? () => {} : onClose} title={title}>
      <form onSubmit={submit} noValidate>
        <label className="label" htmlFor="nm">{label}</label>
        <input id="nm" autoFocus className="input" maxLength={80} value={value} onChange={(e) => setValue(e.target.value)} />
        {err && <p className="mt-1 text-xs text-rose-600">{err}</p>}
        <div className="mt-5 flex justify-end gap-2">
          <button type="button" className="btn-secondary" onClick={onClose} disabled={busy}>Cancel</button>
          <button className="btn-primary" disabled={busy}>{busy && <Spinner className="h-4 w-4" />}{submitText}</button>
        </div>
      </form>
    </Modal>
  );
}

export default function Queues() {
  const toast = useToast();
  const [queues, setQueues] = useState(null);
  const [activeId, setActiveId] = useState(localStorage.getItem('qf_active_queue'));
  const [tokens, setTokens] = useState({ waiting: [], history: [] });
  const [loading, setLoading] = useState(true);
  const [tokLoading, setTokLoading] = useState(false);
  const [error, setError] = useState('');
  const [busyAction, setBusyAction] = useState('');
  const [modal, setModal] = useState(null); // 'queue' | 'person' | 'rename'
  const [confirm, setConfirm] = useState(null); // { type, token? }
  const [justAdded, setJustAdded] = useState(null);

  const active = queues?.find((q) => q._id === activeId);

  const loadQueues = async (keep = true) => {
    try {
      const list = await queueApi.list();
      setQueues(list);
      setActiveId((cur) => (keep && list.some((q) => q._id === cur) ? cur : list[0]?._id || null));
      setError('');
    } catch (e) { setError(errMsg(e)); } finally { setLoading(false); }
  };
  const loadTokens = async (id) => {
    setTokLoading(true);
    try { setTokens(await tokenApi.list(id)); } catch (e) { toast.error(errMsg(e)); } finally { setTokLoading(false); }
  };

  useEffect(() => { loadQueues(); }, []);
  useEffect(() => {
    if (activeId) { localStorage.setItem('qf_active_queue', activeId); setJustAdded(null); loadTokens(activeId); }
  }, [activeId]);

  const syncCount = (n) => setQueues((qs) => qs.map((q) => (q._id === activeId ? { ...q, waitingCount: n } : q)));

  const run = async (key, fn, okMsg) => {
    if (busyAction) return;
    setBusyAction(key);
    try { const res = await fn(); if (okMsg) toast.success(okMsg(res)); return res; }
    catch (e) { toast.error(errMsg(e)); await loadTokens(activeId); }
    finally { setBusyAction(''); }
  };

  const move = (t, dir) => run(`${t._id}${dir}`, async () => {
    const d = await tokenApi.move(activeId, t._id, dir);
    setTokens((s) => ({ ...s, waiting: d.waiting }));
  });
  const serve = () => run('serve', async () => {
    const d = await tokenApi.serve(activeId);
    setTokens((s) => ({ waiting: d.waiting, history: [d.token, ...s.history] }));
    syncCount(d.waiting.length);
    return d;
  }, (d) => `Served #${d.token.tokenNumber} – ${d.token.personName}`);
  const cancel = async () => {
    const t = confirm.token;
    await run(`${t._id}x`, async () => {
      const d = await tokenApi.cancel(activeId, t._id);
      setTokens((s) => ({ waiting: d.waiting, history: [d.token, ...s.history] }));
      syncCount(d.waiting.length);
    }, () => `Cancelled #${t.tokenNumber}`);
    setConfirm(null);
  };
  const removeQueue = async () => {
    await run('del', () => queueApi.remove(activeId), () => 'Queue deleted');
    setConfirm(null);
    await loadQueues(false);
  };

  if (loading) return <PageLoader />;
  if (error) return <ErrorBox message={error} onRetry={() => { setLoading(true); loadQueues(); }} />;

  const modals = (
    <>
      <NameModal open={modal === 'queue'} onClose={() => setModal(null)} title="Create queue" label="Queue name" submitText="Create queue"
        onSubmit={async (name) => { const q = await queueApi.create(name); setQueues((qs) => [q, ...qs]); setActiveId(q._id); toast.success(`Queue “${q.name}” created`); }} />
    </>
  );

  if (!queues.length) {
    return (
      <>
        <div className="card"><EmptyState icon={ListOrdered} title="No queues yet" text="Create a queue, then add people to it."
          action={<button className="btn-primary mt-2" onClick={() => setModal('queue')}><Plus className="h-4 w-4" />Create queue</button>} /></div>
        {modals}
      </>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="flex min-w-0 flex-1 gap-2 overflow-x-auto pb-1">
          {queues.map((q) => (
            <button key={q._id} onClick={() => setActiveId(q._id)}
              className={`flex shrink-0 items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition ${q._id === activeId ? 'border-brand-600 bg-brand-600 text-white' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'}`}>
              <span className="max-w-[10rem] truncate">{q.name}</span>
              <span className={`rounded-full px-1.5 text-xs ${q._id === activeId ? 'bg-white/20' : 'bg-slate-100'}`}>{q.waitingCount}</span>
            </button>
          ))}
        </div>
        <button className="btn-secondary shrink-0" onClick={() => setModal('queue')}><Plus className="h-4 w-4" /><span className="hidden sm:inline">New queue</span></button>
      </div>

      {active && (
        <>
          <section className="card p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0">
                <h2 className="truncate text-lg font-semibold">{active.name}</h2>
                <p className="text-sm text-slate-500">{active.waitingCount} waiting</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button className="btn-secondary" onClick={() => setModal('rename')} aria-label="Rename queue"><Pencil className="h-4 w-4" /></button>
                <button className="btn-secondary text-rose-600" onClick={() => setConfirm({ type: 'queue' })} aria-label="Delete queue"><Trash2 className="h-4 w-4" /></button>
                <button className="btn-secondary" onClick={() => setModal('person')}><UserPlus className="h-4 w-4" />Add person</button>
                <button className="btn-primary" onClick={serve} disabled={!tokens.waiting.length || !!busyAction}>
                  {busyAction === 'serve' ? <Spinner className="h-4 w-4" /> : <PhoneCall className="h-4 w-4" />}Serve next
                </button>
              </div>
            </div>
            {justAdded && (
              <div className="mt-4 flex items-center gap-3 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">
                <span className="rounded-md bg-white px-2 py-1 font-semibold">#{justAdded.tokenNumber}</span>
                <span className="min-w-0 flex-1 truncate">Token issued to {justAdded.personName} – position {justAdded.queuePosition}</span>
                <button onClick={() => setJustAdded(null)} aria-label="Dismiss"><X className="h-4 w-4" /></button>
              </div>
            )}
          </section>

          <section className="card">
            {tokLoading ? <PageLoader /> : tokens.waiting.length === 0 ? (
              <EmptyState title="Nobody is waiting" text="Add a person to issue the first token." action={<button className="btn-primary mt-2" onClick={() => setModal('person')}><UserPlus className="h-4 w-4" />Add person</button>} />
            ) : (
              <ul className="divide-y divide-slate-100">
                {tokens.waiting.map((t, i) => {
                  const next = i === 0;
                  return (
                    <li key={t._id} className={`flex flex-wrap items-center gap-3 p-3 sm:p-4 ${next ? 'bg-brand-50/60' : ''}`}>
                      <span className="flex h-10 w-14 shrink-0 items-center justify-center rounded-lg bg-white text-sm font-semibold text-brand-700 ring-1 ring-brand-100">#{t.tokenNumber}</span>
                      <div className="min-w-0 flex-1 basis-40">
                        <p className="flex items-center gap-2 truncate font-medium">{t.personName}{next && <span className="rounded-full bg-brand-600 px-2 py-0.5 text-xs font-medium text-white">Next up</span>}</p>
                        <p className="text-xs text-slate-500">Position {t.queuePosition} · Added {fmtTime(t.createdAt)} · <StatusBadge status={t.status} /></p>
                      </div>
                      <div className="flex gap-1">
                        <button className="btn-secondary px-2" disabled={i === 0 || !!busyAction} onClick={() => move(t, 'up')} aria-label="Move up"><ArrowUp className="h-4 w-4" /></button>
                        <button className="btn-secondary px-2" disabled={i === tokens.waiting.length - 1 || !!busyAction} onClick={() => move(t, 'down')} aria-label="Move down"><ArrowDown className="h-4 w-4" /></button>
                        <button className="btn-secondary px-2 text-rose-600" disabled={!!busyAction} onClick={() => setConfirm({ type: 'token', token: t })} aria-label="Cancel token"><X className="h-4 w-4" /></button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          <section className="card p-4">
            <h3 className="mb-2 flex items-center gap-2 font-semibold"><History className="h-4 w-4 text-slate-400" />Recent history</h3>
            {tokens.history.length === 0 ? <p className="text-sm text-slate-500">Served and cancelled tokens will be listed here.</p> : (
              <ul className="divide-y divide-slate-100">
                {tokens.history.map((t) => (
                  <li key={t._id} className="flex flex-wrap items-center gap-2 py-2 text-sm">
                    <span className="w-12 font-semibold text-slate-600">#{t.tokenNumber}</span>
                    <span className="min-w-0 flex-1 basis-32 truncate">{t.personName}</span>
                    <StatusBadge status={t.status} />
                    <span className="text-xs text-slate-500">{fmtDateTime(t.servedAt || t.cancelledAt)}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}

      {modals}
      <NameModal open={modal === 'person'} onClose={() => setModal(null)} title="Add person" label="Person's name" submitText="Issue token"
        onSubmit={async (name) => {
          const t = await tokenApi.add(activeId, name);
          setJustAdded(t);
          await loadTokens(activeId);
          setQueues((qs) => qs.map((q) => (q._id === activeId ? { ...q, waitingCount: q.waitingCount + 1 } : q)));
          toast.success(`Token #${t.tokenNumber} issued to ${t.personName}`);
        }} />
      <NameModal open={modal === 'rename'} onClose={() => setModal(null)} title="Rename queue" label="Queue name" initial={active?.name} submitText="Save changes"
        onSubmit={async (name) => { const q = await queueApi.rename(activeId, name); setQueues((qs) => qs.map((x) => (x._id === q._id ? { ...x, name: q.name } : x))); toast.success('Queue renamed'); }} />
      <ConfirmDialog open={confirm?.type === 'token'} title="Cancel this token?" busy={!!busyAction}
        message={confirm?.token && `#${confirm.token.tokenNumber} (${confirm.token.personName}) will be marked as cancelled. It stays in your history.`}
        confirmText="Cancel token" onConfirm={cancel} onClose={() => setConfirm(null)} />
      <ConfirmDialog open={confirm?.type === 'queue'} title="Delete this queue?" busy={!!busyAction}
        message={`“${active?.name}” and all of its token history will be permanently deleted.`}
        confirmText="Delete queue" onConfirm={removeQueue} onClose={() => setConfirm(null)} />
    </div>
  );
}
