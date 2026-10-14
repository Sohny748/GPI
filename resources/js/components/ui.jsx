import { X } from 'lucide-react';

function Badge({ children, color = 'bg-slate-100 text-slate-500 border-slate-200' }) {
    return (
        <span className={`anim-badge inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${color}`}>
            {children}
        </span>
    );
}

export { Badge };
export default Badge;

/* Bouton « Modifier » : orange (action d'édition) */
export function EditButton({ onClick, label = 'Modifier', icon: Icon }) {
    return (
        <button
            onClick={onClick}
            title={label}
            className="btn-moderne inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-orange-200/60 bg-orange-100 hover:bg-orange-200 text-orange-400 text-xs font-semibold"
        >
            {Icon && <Icon size={13} />}
            {label}
        </button>
    );
}

/* Modale d'édition réutilisable (création + modification) — backdrop en fondu, contenu en pop */
export function EditModal({ open, onClose, title, mode = 'create', children, onSubmit, busy, submitLabel, width = 'max-w-2xl' }) {
    if (! open) return null;
    const fermer = () => { onClose(); };
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm anim-fade-in" onMouseDown={(e) => { if (e.target === e.currentTarget) fermer(); }}>
            <div className={`anim-pop bg-card rounded-2xl shadow-2xl w-full ${width} max-h-[90vh] flex flex-col border border-slate-200/50`}>
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200/50 shrink-0">
                    <h2 className="font-bold text-slate-800 flex items-center gap-2">
                        {title}
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded font-mono ${
                            mode === 'edit'
                                ? 'bg-orange-100 text-orange-400'
                                : 'bg-vert-100 text-vert-400'
                        }`}>
                            {mode === 'edit' ? 'EDITION' : 'NOUVEAU'}
                        </span>
                    </h2>
                    <button onClick={fermer} className="p-1.5 text-slate-400 hover:text-slate-800 transition hover:rotate-90"><X size={18} /></button>
                </div>
                <form onSubmit={onSubmit} className="flex-1 flex flex-col min-h-0">
                    <div className="p-5 overflow-y-auto flex-1">{children}</div>
                    <div className="flex justify-end gap-2 px-5 py-4 border-t border-slate-200/50 shrink-0">
                        <button type="button" onClick={fermer} className="px-4 py-2 rounded-lg border border-slate-200/50 text-sm font-semibold text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition">
                            Annuler
                        </button>
                        <button
                            disabled={busy}
                            className="btn-moderne px-4 py-2 rounded-lg bg-vert-600 hover:bg-vert-700 disabled:opacity-60 text-white text-sm font-bold shadow-sm shadow-vert-600/30 inline-flex items-center gap-1.5"
                        >
                            {busy ? 'Enregistrement…' : (submitLabel ?? (mode === 'edit' ? 'Enregistrer les modifications' : 'Créer'))}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

/* Bouton principal vert avec micro-interaction press */
export function PrimaryButton({ children, onClick, disabled, type = 'button', className = '' }) {
    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`btn-moderne inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-vert-600 hover:bg-vert-700 disabled:opacity-60 text-white text-sm font-bold shadow-sm shadow-vert-600/30 ${className}`}
        >
            {children}
        </button>
    );
}

export function Spinner({ label = 'Chargement…' }) {
    return (
        <div className="flex flex-col items-center justify-center py-16 text-slate-500">
            <div className="w-8 h-8 border-3 border-slate-300 border-t-blue-600 rounded-full animate-spin" />
            <p className="mt-3 text-sm">{label}</p>
        </div>
    );
}

/* Squelette de chargement : cartes grises animées, envoyées en attendant l'API */
export function SkeletonPage({ lignes = 6 }) {
    return (
        <div className="anim-fade-in" aria-busy="true">
            <div className="flex items-center justify-between mb-6">
                <div className="space-y-2">
                    <div className="skeleton h-6 w-64" />
                    <div className="skeleton h-3 w-40" />
                </div>
                <div className="skeleton h-9 w-28 rounded-lg" />
            </div>
            <div className="skeleton h-14 rounded-xl mb-4" />
            <div className="bg-card rounded-2xl border border-slate-200/50 shadow-sm overflow-hidden">
                {Array.from({ length: lignes }).map((_, i) => (
                    <div key={i} className="flex items-center gap-4 px-4 py-3 border-b border-slate-100 last:border-0">
                        <div className="skeleton h-8 w-8 rounded-lg shrink-0" style={{ animationDelay: `${i * 120}ms` }} />
                        <div className="skeleton h-3.5 flex-1 max-w-[220px]" style={{ animationDelay: `${i * 120 + 40}ms` }} />
                        <div className="skeleton h-3.5 w-24 hidden sm:block" style={{ animationDelay: `${i * 120 + 80}ms` }} />
                        <div className="skeleton h-3.5 w-16 hidden md:block" style={{ animationDelay: `${i * 120 + 120}ms` }} />
                    </div>
                ))}
            </div>
        </div>
    );
}

export function PageHeader({ title, subtitle, actions }) {
    return (
        <div className="anim-slide flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
                <h1 className="text-xl font-bold text-slate-800 tracking-tight">{title}</h1>
                {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
            </div>
            {actions && <div className="anim-fade-up anim-d2 flex items-center gap-2">{actions}</div>}
        </div>
    );
}

export function EmptyState({ icon: Icon, title, hint }) {
    return (
        <div className="anim-fade-up flex flex-col items-center justify-center py-14 text-center">
            {Icon && (
                <div className="anim-pop w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mb-3">
                    <Icon size={24} />
                </div>
            )}
            <p className="text-sm font-semibold text-slate-700">{title}</p>
            {hint && <p className="text-xs text-slate-500 mt-1">{hint}</p>}
        </div>
    );
}

export function Field({ label, children, required }) {
    return (
        <label className="block">
            <span className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1">
                {label} {required && <span className="text-rose-400">*</span>}
            </span>
            {children}
        </label>
    );
}

export const inputClass =
    'champ-moderne block w-full px-3 py-2 bg-card-high border border-slate-200/50 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/60 focus:border-blue-400';

export function ErrorText({ errors }) {
    if (! errors || Object.keys(errors).length === 0) return null;
    return (
        <div className="anim-shake rounded-lg bg-rose-50 border border-rose-200 p-3 text-xs text-rose-400 space-y-1 mb-3">
            {Object.entries(errors).map(([field, messages]) => (
                <p key={field}>{messages.join(' ')}</p>
            ))}
        </div>
    );
}
