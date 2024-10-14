import { Context } from '../types'

export const linuxContext: Context = {
  getInterfacesName: () => {
    return []
  },
  getDNSSettings: () => {},
  updateDNS: () => {},
  deleteDNS: () => {}
}
