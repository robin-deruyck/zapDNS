export type Context = {
  getInterfacesName: () => string[]
  getDNSSettings: (error: Error | null, stdout: string, stderr: string, resolve: (value: unknown) => void) => void
  updateDNS: (interfaceName: string, dnsServers: string[]) => void
  deleteDNS: () => void
}

export enum DNSOptions {
  GOOGLE = 'google',
  CLOUDFLARE = 'cloudflare',
  BOTH = 'both',
  CUSTOM = 'custom',
  ERASED = 'erased'
}
