import GoScreen from "../../components/wayfinding/go-screen";

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
  return (
    <GoScreen
      destinationId={destination}
      originNodeId={origin}
      accessible={accessible === "1"}
    />
  );
}
