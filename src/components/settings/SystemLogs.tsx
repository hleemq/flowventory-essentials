
import { Card } from "@/components/ui/card";
import { ScrollText } from "lucide-react";

type SystemLogType = {
  id: string;
  action: string;
  created_at: string;
  details: any;
};

type SystemLogsProps = {
  logs: SystemLogType[];
  title: string;
  noLogsMessage: string;
};

const SystemLogs = ({ logs, title, noLogsMessage }: SystemLogsProps) => {
  return (
    <Card className="p-6 md:col-span-2">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <ScrollText className="h-5 w-5" />
        {title}
      </h2>
      <div className="overflow-auto max-h-[300px] rounded border">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-muted">
            <tr>
              <th className="px-4 py-2 text-start">Action</th>
              <th className="px-4 py-2 text-start">Details</th>
              <th className="px-4 py-2 text-start">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {logs.length > 0 ? (
              logs.map((log) => (
                <tr key={log.id}>
                  <td className="px-4 py-2">{log.action}</td>
                  <td className="px-4 py-2">
                    {log.details ? JSON.stringify(log.details) : '-'}
                  </td>
                  <td className="px-4 py-2">
                    {new Date(log.created_at).toLocaleString()}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="px-4 py-2 text-center text-muted-foreground">
                  {noLogsMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export default SystemLogs;
