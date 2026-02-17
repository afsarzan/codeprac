const DB_NAME = 'index.db';
const DB_VERSION = 1;

const openDb = () =>
  new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      if (!db.objectStoreNames.contains('patents')) {
        const store = db.createObjectStore('patents', {
          keyPath: 'id',
          autoIncrement: true,
        });
        store.createIndex('number', 'number', { unique: true });
        store.createIndex('workstreamId', 'workstreamId', { unique: false });
      }

      if (!db.objectStoreNames.contains('workstreams')) {
        db.createObjectStore('workstreams', {
          keyPath: 'id',
          autoIncrement: true,
        });
      }

      if (!db.objectStoreNames.contains('intelligence')) {
        db.createObjectStore('intelligence', {
          keyPath: 'id',
          autoIncrement: true,
        });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

const withStore = async (storeName, mode, callback) => {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, mode);
    const store = transaction.objectStore(storeName);
    const result = callback(store);

    transaction.oncomplete = () => resolve(result);
    transaction.onerror = () => reject(transaction.error);
  });
};

export const getAll = (storeName) =>
  withStore(storeName, 'readonly', (store) => {
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  });

export const getById = (storeName, id) =>
  withStore(storeName, 'readonly', (store) => {
    return new Promise((resolve, reject) => {
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  });

export const addItem = (storeName, value) =>
  withStore(storeName, 'readwrite', (store) => {
    return new Promise((resolve, reject) => {
      const request = store.add(value);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  });

export const putItem = (storeName, value) =>
  withStore(storeName, 'readwrite', (store) => {
    return new Promise((resolve, reject) => {
      const request = store.put(value);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  });

export const deleteById = (storeName, id) =>
  withStore(storeName, 'readwrite', (store) => {
    return new Promise((resolve, reject) => {
      const request = store.delete(id);
      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error);
    });
  });

export const ensureSeedData = async () => {
  const existing = await getAll('patents');
  if (existing.length > 0) {
    return;
  }

  const now = new Date().toISOString();

  const workstreams = [
    { name: 'Photonics portfolio', stage: 'In review', progress: 74 },
    { name: 'Biopolymer claims', stage: 'Drafting', progress: 52 },
    { name: 'Grid storage strategy', stage: 'Negotiation', progress: 81 },
  ];

  for (const workstream of workstreams) {
    await addItem('workstreams', workstream);
  }

  const seededWorkstreams = await getAll('workstreams');

  const patents = [
    {
      number: 'US-11223344-B2',
      title: 'Quantum photonic routing device',
      jurisdiction: 'US',
      assignee: 'Aurum Labs',
      techTag: 'Photonics',
      workstreamId: seededWorkstreams[0]?.id,
      strengthScore: 86,
      riskLevel: 'Low',
      confidence: 92,
      valueProxy: 'High',
      claimsIndependent: 4,
      claimsDependent: 16,
      citationsForward: 18,
      citationsBackward: 6,
      familySize: 7,
      driversPositive: ['Strong forward citations', 'Wide jurisdictional coverage'],
      driversNegative: ['Moderate prior art density'],
      legalEvents: ['US allowance received', 'EU search report favorable'],
      updatedAt: now,
    },
    {
      number: 'EP-99887766-A1',
      title: 'Biopolymer lattice for implant stability',
      jurisdiction: 'EP',
      assignee: 'Helix Materials',
      techTag: 'Biopolymers',
      workstreamId: seededWorkstreams[1]?.id,
      strengthScore: 61,
      riskLevel: 'Medium',
      confidence: 78,
      valueProxy: 'Medium',
      claimsIndependent: 2,
      claimsDependent: 12,
      citationsForward: 8,
      citationsBackward: 14,
      familySize: 4,
      driversPositive: ['Balanced claim breadth', 'Stable maintenance record'],
      driversNegative: ['Prior art overlap in EU'],
      legalEvents: ['Office action issued', 'Response submitted'],
      updatedAt: now,
    },
    {
      number: 'WO-2024-554433',
      title: 'Grid storage dispatch optimizer',
      jurisdiction: 'WO',
      assignee: 'Voltage Dynamics',
      techTag: 'Energy storage',
      workstreamId: seededWorkstreams[2]?.id,
      strengthScore: 73,
      riskLevel: 'Low',
      confidence: 84,
      valueProxy: 'High',
      claimsIndependent: 3,
      claimsDependent: 9,
      citationsForward: 12,
      citationsBackward: 9,
      familySize: 5,
      driversPositive: ['High grant velocity', 'Strong market fit'],
      driversNegative: ['Moderate opposition heat'],
      legalEvents: ['JP national phase entered'],
      updatedAt: now,
    },
  ];

  for (const patent of patents) {
    await addItem('patents', patent);
  }

  const intelligence = [
    {
      title: 'New priority citation',
      detail: 'JP-2025-9981 linked to your core claim set.',
      timestamp: now,
    },
    {
      title: 'Competitor shift',
      detail: 'Zenith Labs increased filings by 18% in optics.',
      timestamp: now,
    },
    {
      title: 'Grant velocity',
      detail: 'Median review time dropped to 11.2 months.',
      timestamp: now,
    },
  ];

  for (const event of intelligence) {
    await addItem('intelligence', event);
  }
};
