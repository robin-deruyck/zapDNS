module.exports = {
  branches: ['main'],
  plugins: [
    [
      '@semantic-release/commit-analyzer',
      {
        preset: 'angular',
        releaseRules: [
          { type: 'docs', scope: 'README', release: 'patch' },
          { type: 'refactor', release: 'patch' },
          { type: 'style', release: 'patch' },
          { scope: 'no-release', release: false },
          { type: 'feat', release: 'minor' },
          { type: 'fix', release: 'patch' },
          { type: 'perf', release: 'patch' },
          // Gitmoji rules
          { message: ':sparkles:', release: 'minor' }, // ✨ New feature
          { message: ':bug:', release: 'patch' }, // 🐛 Bug fix
          { message: ':recycle:', release: 'patch' }, // ♻️ Refactor
          { message: ':zap:', release: 'patch' }, // ⚡️ Performance improvement
          { message: ':memo:', release: 'patch' }, // 📝 Documentation updates
          { message: ':rocket:', release: 'minor' }, // 🚀 Deployment stuff
          { message: ':tada:', release: 'major' }, // 🎉 Initial commit or major release
          { message: ':wrench:', release: 'patch' }, // 🔧 Configuration changes
          { message: ':package:', release: 'patch' }, // 📦 Dependencies
          { message: ':fire:', release: 'patch' } // 🔥 Removal of code/files
        ],
        parserOpts: {
          noteKeywords: ['BREAKING CHANGE', 'BREAKING CHANGES', 'BREAKING']
        }
      }
    ],
    '@semantic-release/release-notes-generator',
    '@semantic-release/npm',
    [
      '@semantic-release/exec',
      {
        prepareCmd: 'pnpm run build'
      }
    ],
    [
      '@semantic-release/github',
      {
        assets: [{ path: 'dist/zapdns.exe', label: 'ZapDNS Executable' }]
      }
    ],
    [
      '@semantic-release/git',
      {
        assets: ['package.json'],
        message: 'chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}'
      }
    ]
  ]
}
