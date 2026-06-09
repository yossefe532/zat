import type { AuditLogSummary, BackupSummary } from '@/lib/portal';
import { StatusBadge } from '@/components/console/StatusBadge';

type AuditPanelsProps = {
  auditLogs: AuditLogSummary[];
  backups: BackupSummary[];
  onRunBackup: () => void;
  backupBusy: boolean;
};

export function AuditPanels({
  auditLogs,
  backups,
  onRunBackup,
  backupBusy,
}: AuditPanelsProps) {
  return (
    <section className="grid gap-6 xl:grid-cols-[1.1fr,0.9fr]">
      <div className="table-shell rounded-[2rem] p-5 md:p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-foreground">سجل العمليات</h2>
            <p className="text-sm text-muted-foreground">يتتبع جميع التعديلات على الموظفين والأكواد والرسائل</p>
          </div>
          <StatusBadge>{auditLogs.length} حدث</StatusBadge>
        </div>

        <div className="space-y-3">
          {auditLogs.map((log) => (
            <div key={log.id} className="rounded-[1.5rem] border border-border/70 bg-card/55 p-4">
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="font-black text-foreground">{log.action}</p>
                  <p className="text-sm text-muted-foreground">
                    {log.actorName} | {log.actorRole} | {log.targetTable}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground">
                  {new Date(log.createdAt).toLocaleString('ar-EG')}
                </p>
              </div>
              {log.metadata ? (
                <pre className="mt-3 overflow-x-auto rounded-2xl bg-background/60 p-3 text-xs text-muted-foreground">
                  {JSON.stringify(log.metadata, null, 2)}
                </pre>
              ) : null}
            </div>
          ))}
        </div>
      </div>

      <div className="hero-panel rounded-[2rem] p-5 md:p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-foreground">النسخ الاحتياطية</h2>
            <p className="text-sm text-muted-foreground">إنشاء نسخ فورية وتشغيل نسخ دورية عبر Vercel Cron</p>
          </div>
          <button
            type="button"
            onClick={onRunBackup}
            disabled={backupBusy}
            className="action-primary rounded-2xl px-4 py-2 text-sm font-black disabled:opacity-60"
          >
            {backupBusy ? 'جارٍ الإنشاء' : 'تشغيل نسخة الآن'}
          </button>
        </div>

        <div className="space-y-3">
          {backups.map((backup) => (
            <div key={backup.id} className="rounded-[1.5rem] border border-border/70 bg-card/55 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-black text-foreground">{backup.backupType}</p>
                  <p className="text-sm text-muted-foreground">{backup.createdBy}</p>
                </div>
                <StatusBadge tone="success">
                  {new Date(backup.createdAt).toLocaleString('ar-EG')}
                </StatusBadge>
              </div>
              {backup.summary ? (
                <pre className="mt-3 overflow-x-auto rounded-2xl bg-background/60 p-3 text-xs text-muted-foreground">
                  {JSON.stringify(backup.summary, null, 2)}
                </pre>
              ) : null}
            </div>
          ))}
          {backups.length === 0 ? (
            <p className="rounded-[1.5rem] bg-card/55 p-6 text-center text-sm text-muted-foreground">
              لم يتم إنشاء أي نسخة احتياطية بعد.
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
