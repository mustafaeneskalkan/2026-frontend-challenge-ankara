import InvestigationDashboard from "@/components/InvestigationDashboard";
import {
  getInvestigationData,
  type InvestigationEventClient,
} from "@/lib/investigation";

export default async function Home() {
  const apiKey = process.env.JOTFORM_API_KEY;

  const data = await getInvestigationData({ apiKey, revalidateSeconds: 300 });
  const events: InvestigationEventClient[] = data.events.map((evt) => ({
    key: evt.key,
    source: evt.source,
    formId: evt.formId,
    submissionId: evt.submissionId,

    timestampMs: evt.timestampMs,
    timestampText: evt.timestampText,
    createdAtText: evt.createdAtText,

    location: evt.location,
    coordinates: evt.coordinates,

    people: evt.people,
    content: evt.content,
    reliability: evt.reliability,
  }));

  return (
    <InvestigationDashboard events={events} errors={data.errors} from={data.from} />
  );
}
