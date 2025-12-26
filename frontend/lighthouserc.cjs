module.exports = {
  ci: {
    collect: {
      startServerCommand: 'npm start',
      url: ['http://localhost:3000/'],
      numberOfRuns: 3,
      settings: {
        preset: 'desktop', // Adjust if you want mobile by default (Lighthouse default is mobile)
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
    assert: {
      preset: 'lighthouse:recommended',
      assertions: {
        'categories:performance': ['warn', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'dom-size': 'off',
      },
    },
  },
};
