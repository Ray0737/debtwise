import { useT } from '../i18n'

export function Badge({ status }: { status: 'verified' | 'needs_review' | 'user_stated' | 'sample' }) {
  const t = useT()
  const cls = status === 'verified' ? 'dot' : status === 'needs_review' ? 'dot warn' : 'dot hollow'
  return <span className="badge"><i className={cls} />{t(`status.${status}` as const)}</span>
}
