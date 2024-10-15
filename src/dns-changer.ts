import { DNSContext, DNSOptions } from './types'
import inquirer from 'inquirer'
import chalk from 'chalk'
import { getServers } from 'node:dns'
import { networkInterfaces, platform as plf } from 'node:os'
import { createPlatformHandler } from './platform-handlers'

export class DNSChanger {
  private readonly platformHandler: DNSContext
  private readonly knownDNS = {
    google: ['8.8.4.4', '8.8.8.8', '2001:4860:4860::8844', '2001:4860:4860::8888'],
    cloudflare: ['1.1.1.1', '1.0.0.1', '2606:4700:4700::1111', '2606:4700:4700::1001']
  }

  constructor() {
    this.platformHandler = createPlatformHandler(plf())
  }

  async start(): Promise<void> {
    try {
      console.log(chalk.blue('Fetching current DNS settings...'))
      this.displayCurrentDNS()

      const { dnsOption, interfaceNames } = await this.promptDNSChange()
      if (!interfaceNames.length) {
        console.log(chalk.yellow('No interface selected. Exiting...'))
        return
      }

      await this.processDNSChanges(dnsOption, interfaceNames)
      this.waitForExit()
    } catch (error) {
      console.error(chalk.red(`Error: ${error instanceof Error ? error.message : String(error)}`))
    }
  }

  private displayCurrentDNS(): void {
    const dnsAddresses = getServers()
    console.log(chalk.magenta(`You currently have ${dnsAddresses.length} addresses:`))
    dnsAddresses.forEach((address, index) => {
      console.log(chalk.magenta(`DNS server ${index + 1}: ${address}`))
    })
  }

  private async processDNSChanges(option: DNSOptions, interfaceNames: string[]): Promise<void> {
    const servers = await this.getDnsServers(option)
    for (const interfaceName of interfaceNames) {
      if (option === DNSOptions.ERASED) {
        this.platformHandler.deleteDNS(interfaceName)
      } else {
        await this.updateDNS(interfaceName, servers)
      }
    }
  }

  private async getDnsServers(option: DNSOptions): Promise<string[]> {
    switch (option) {
      case DNSOptions.GOOGLE:
        return this.knownDNS.google
      case DNSOptions.CLOUDFLARE:
        return this.knownDNS.cloudflare
      case DNSOptions.BOTH:
        return [...this.knownDNS.google, ...this.knownDNS.cloudflare]
      case DNSOptions.CUSTOM:
        return this.promptCustomDNS()
      default:
        return []
    }
  }

  private async updateDNS(interfaceName: string, servers: string[]): Promise<void> {
    console.log('Updating DNS addresses for', chalk.yellow(interfaceName), 'with servers', servers)
    const currentServers = getServers()
    // Silently remove any servers that are already in the list
    const newServers = servers.filter((server) => !currentServers.includes(server))
    this.platformHandler.updateDNS(interfaceName, newServers)
  }

  private async promptDNSChange(): Promise<{ dnsOption: DNSOptions; interfaceNames: string[] }> {
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

  private async promptCustomDNS(): Promise<string[]> {
    const { ipv4DNS, ipv6DNS } = await inquirer.prompt([
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
    return [ipv4DNS, ipv6DNS].filter(Boolean)
  }

  private waitForExit(): void {
    console.log('Press any key to exit...')
    process.stdin.setRawMode(true)
    process.stdin.resume()
    process.stdin.once('data', () => process.exit(0))
  }
}
