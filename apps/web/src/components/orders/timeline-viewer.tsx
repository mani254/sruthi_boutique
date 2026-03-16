import { TimelineEntry } from "@shruthi-boutique/types";
import { format } from "date-fns";
import { CheckCircle2, Clock } from "lucide-react";

interface TimelineViewerProps {
  timeline: TimelineEntry[];
}

export function TimelineViewer({ timeline }: TimelineViewerProps) {
  if (!timeline || timeline.length === 0) {
    return <div className="p-4 text-center text-muted-foreground">No history available for this order.</div>;
  }

  // Sort timeline by timestamp desc
  const sortedTimeline = [...timeline].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
      {sortedTimeline.map((item, index) => (
        <div key={index} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
          {/* Icon */}
          <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-300 group-[.is-active]:bg-primary text-slate-500 group-[.is-active]:text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
            {index === 0 ? <CheckCircle2 className="h-5 w-5" /> : <Clock className="h-5 w-5" />}
          </div>
          {/* Content */}
          <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded border border-slate-200 bg-white shadow">
            <div className="flex items-center justify-between space-x-2 mb-1">
              <div className="font-bold text-slate-900 capitalize">{item.statusTo}</div>
              <time className="font-medium text-primary text-xs italic">{format(new Date(item.timestamp), "MMM dd, yyyy HH:mm")}</time>
            </div>
            <div className="text-slate-500 text-sm">{item.message}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
