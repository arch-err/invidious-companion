const hosts = Array.from(Deno.readDirSync('/security/chains'))
    .filter(x => x.name.endsWith('.pem')).map(x => x.name.slice(0, -4));
try {
    const control = await fetch('https://example.com', { signal: AbortSignal.timeout(15000) });
    await control.body?.cancel();
    for (const host of hosts) {
        try {
            const response = await fetch('https://' + host, { signal: AbortSignal.timeout(15000) });
            await response.body?.cancel();
            throw new Error('Compromised chain accepted: ' + host);
        } catch (error) {
            const reason = error instanceof Error ? `${error.message}: ${error.cause}` : String(error);
            if (!/UnknownIssuer|CertRevoked|CertDistrusted|certificate revoked|unknown issuer/i.test(reason)) throw error;
            console.log('PASS:', host, reason);
        }
    }
    Deno.exit(0);
} catch (error) {
    console.error(error);
    Deno.exit(1);
}
// Loaded by the compiled application's existing fetch-client extension point.
export function getFetchClient() { return fetch; }
