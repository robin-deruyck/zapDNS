export type DNSContext = {
  updateDNS: (interfaceName: string, dnsServers: string[]) => void
  deleteDNS: (interfaceName: string) => void
}

export enum DNSOptions {
  GOOGLE = 'google',
  CLOUDFLARE = 'cloudflare',
  BOTH = 'both',
  CUSTOM = 'custom',
  ERASED = 'erased'
}
