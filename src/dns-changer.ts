import { Context, DNSOptions } from './types'
import inquirer from 'inquirer'
import chalk from 'chalk'
import { getServers } from 'node:dns'
import { networkInterfaces, platform as plf } from 'node:os'
import { createPlatformHandler } from './platform-handlers'

export class DNSChanger {
  platformHandler: Context | null = null
  knowDNS = {
    google: ['8.8.4.4', '8.8.8.8', '2001:4860:4860::8844', '2001:4860:4860::8888'],
    cloudflare: ['1.1.1.1', '1.0.0.1', '2606:4700:4700::1111', '2606:4700:4700::1001']
  }

  async start() {
    try {
      this.init()

      console.log(chalk.blue('Fetching current DNS settings...'))
      this.displayCurrentDNS()

      const { dnsOption, interfaceNames } = await this.promptDNSChange()
      if (!interfaceNames.length) {
        console.log(chalk.yellow('No interface selected. Exiting...'))
        return
      }

      let servers = []
      if (dnsOption === DNSOptions.GOOGLE) {
        servers = this.knowDNS.google
      } else if (dnsOption === DNSOptions.CLOUDFLARE) {
        servers = this.knowDNS.cloudflare
      } else if (dnsOption === DNSOptions.BOTH) {
        servers = [...this.knowDNS.google, ...this.knowDNS.cloudflare]
      } else if (dnsOption === DNSOptions.CUSTOM) {
        const { ipv4DNS, ipv6DNS } = await this.promptCustomDNS()
        servers = [ipv4DNS, ipv6DNS].filter(Boolean)
      } else if (dnsOption === DNSOptions.ERASED) {
        //  delete all DNS
      }

      for (const interfaceName of interfaceNames) {
        await this.updateDNS(interfaceName, servers)
      }

      this.waitForExit()
    } catch (error: any) {
      console.error(chalk.red(`Error: ${error.message}`))
    }
  }

  init() {
    this.platformHandler = createPlatformHandler(plf())
  }

  async updateDNS(interfaceName: string, servers: string[] = []) {
    console.log('Updating DNS addresses for ', chalk.yellow(interfaceName), 'with servers', servers)

    const currentServers = getServers()
    const newServers = servers.filter((server) => !currentServers.includes(server))
    this.platformHandler!.updateDNS(interfaceName, newServers)
  }

  displayCurrentDNS() {
    const dnsAddresses = getServers()
    console.log(chalk.magenta(`You currently have ${dnsAddresses.length}  addresses : `))
    dnsAddresses.forEach((address, index) => {
      console.log(chalk.magenta(`DNS server ${index + 1}: ${address}`))
    })
  }

  async promptDNSChange() {
    return inquirer.prompt([
      {
        type: 'list',
        name: 'dnsOption',
        message: 'Select DNS change option:',
        choices: [
          { name: '1. Add Google DNS', value: DNSOptions.GOOGLE },
          { name: '2. Add Cloudflare DNS', value: DNSOptions.CLOUDFLARE },
          { name: '3. Add both Google and Cloudflare DNS', value: DNSOptions.BOTH },
          { name: '4. Custom DNS', value: DNSOptions.CUSTOM },
          { name: '5. Reset DNS list', value: DNSOptions.ERASED }
        ]
      },
      {
        type: 'checkbox',
        name: 'interfaceNames',
        message: 'Choose one or more interfaces to update',
        choices: Object.keys(networkInterfaces())
      }
    ])
  }

  async promptCustomDNS() {
    return inquirer.prompt([
      {
        type: 'input',
        name: 'ipv4DNS',
        message: 'Enter custom IPv4 DNS (or leave blank to skip):'
      },
      {
        type: 'input',
        name: 'ipv6DNS',
        message: 'Enter custom IPv6 DNS (or leave blank to skip):'
      }
    ])
  }

  waitForExit() {
    console.log('Press any key to exit...')
    process.stdin.setRawMode(true)
    process.stdin.resume()
    process.stdin.on('data', process.exit.bind(process, 0))
  }
}
