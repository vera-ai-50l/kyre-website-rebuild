import { IntentDetailScreen } from "@/components/agnost/screens/IntentDetail";
import { adapter, currentRange } from "@/lib/data/adapter";

/* Static export: the prerendered routes come from the adapter rather than the
   fixtures, so switching NEXT_PUBLIC_DATA_SOURCE changes which intent pages get
   built without touching this file. */
export async function generateStaticParams() {
  const intents = await adapter.getIntents(currentRange());
  return intents.map((intent) => ({ id: intent.slug }));
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <IntentDetailScreen id={id} />;
}
