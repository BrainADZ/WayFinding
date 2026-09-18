import { networkInterfaces } from "node:os";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const publicHost = request.headers.get("x-forwarded-host") ?? requestUrl.host;
  const hostname = publicHost.split(":")[0];
  if (!["localhost", "127.0.0.1", "::1"].includes(hostname))
    return Response.json({ baseUrl: `${requestUrl.protocol}//${publicHost}` });
  const addresses = Object.values(networkInterfaces())
    .flat()
    .filter(
      (address) => address && address.family === "IPv4" && !address.internal,
    );
  const address =
    addresses.find((item) => item!.address.startsWith("192.168.")) ??
    addresses.find((item) => item!.address.startsWith("10.")) ??
    addresses[0];
  const port = requestUrl.port ? `:${requestUrl.port}` : "";
  return Response.json({
    baseUrl: address
      ? `${requestUrl.protocol}//${address.address}${port}`
      : requestUrl.origin,
    networkReady: Boolean(address),
  });
}
