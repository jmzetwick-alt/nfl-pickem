import { WeekPicksPage } from "@/components/WeekPicksPage";

type Props = {
  params: Promise<{ weekNumber: string }>;
};

export default async function WeekPage({ params }: Props) {
  const { weekNumber } = await params;
  return <WeekPicksPage weekNumber={parseInt(weekNumber, 10)} />;
}
