import GoScreen from "../../components/wayfinding/go-screen";
import { redirect } from "next/navigation";

export default async function GoPage({
  searchParams,
}: {
  searchParams: Promise<{
    destination?: string;
    origin?: string;
    accessible?: string;
  }>;
}) {
  const { destination, origin, accessible } = await searchParams;
  if (!destination) redirect("/");
  return (
    <GoScreen
      destinationId={destination}
      originNodeId={origin}
      accessible={accessible === "1"}
    />
  );
}
