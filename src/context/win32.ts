import { execSync } from 'child_process'
import { Context } from '../types'

export const win32Context: Context = {
  getInterfacesName: () => {
    return []
  },
  getDNSSettings: () => {},
  updateDNS: (interfaceName, dnsServers) => {
    try {
      let index = 1
      for (const server of dnsServers) {
        execSync(`netsh interface ip add dns name="${interfaceName}" ${server} validate=yes`)
        index++
      }
    } catch (error: any) {
      console.error(`Error updating DNS for ${interfaceName}: ${error.message}`)
    }
  },
  deleteDNS: () => {}
}
