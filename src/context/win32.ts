import { execSync } from 'child_process'
import { DNSContext } from '../types'

export const win32Context: DNSContext = {
  updateDNS: (interfaceName, dnsServers) => {
    const [ipv4Servers, ipv6Servers] = separateIPv4AndIPv6(dnsServers)
    try {
      updateDNSServers('ipv4', interfaceName, ipv4Servers)
      updateDNSServers('ipv6', interfaceName, ipv6Servers)
    } catch (error) {
      console.error(`Error updating DNS for ${interfaceName}:`, error)
      throw error
    }
  },

  deleteDNS: (interfaceName) => {
    try {
      execSync(`netsh interface ipv4 set dns name="${interfaceName}" source=dhcp`)
      execSync(`netsh interface ipv6 set dns name="${interfaceName}" source=dhcp`)
      console.log(`All DNS entries removed for ${interfaceName}`)
    } catch (error: any) {
      console.error(`Error deleting DNS for ${interfaceName}: ${error.message}`)
      throw error
    }
  }
}

const separateIPv4AndIPv6 = (dnsServers: string[]): [string[], string[]] => {
  return dnsServers.reduce<[string[], string[]]>(
    ([ipv4, ipv6], server) => {
      if (server.includes(':')) {
        ipv6.push(server)
      } else {
        ipv4.push(server)
      }
      return [ipv4, ipv6]
    },
    [[], []]
  )
}

const updateDNSServers = (ipVersion: 'ipv4' | 'ipv6', interfaceName: string, servers: string[]) => {
  for (const [index, server] of servers.entries()) {
    execSync(`netsh interface ${ipVersion} add dnsservers "${interfaceName}" ${server} index=${index + 2}`)
  }
}
