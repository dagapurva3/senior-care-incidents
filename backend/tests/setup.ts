import '../src/app';
// Patch the Incident model mock so that Incident.init is a no-op and the model is a class with static methods
jest.mock('../src/models/incident', () => {
    const mockIncident = {
        id: 1,
        userId: 'test-user-id',
        type: 'fall',
        description: 'Test incident description',
        status: 'open',
        summary: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        save: jest.fn().mockResolvedValue(true),
    };

    return {
        __esModule: true,
        default: class MockIncident {
            static init = jest.fn();
            static findAll = jest.fn().mockResolvedValue([mockIncident]);
            static findByPk = jest.fn().mockResolvedValue(mockIncident);
            static findOne = jest.fn().mockResolvedValue(mockIncident);
            static create = jest.fn().mockResolvedValue(mockIncident);
            static update = jest.fn().mockResolvedValue([1, [mockIncident]]);
            static destroy = jest.fn().mockResolvedValue(1);
            static findAndCountAll = jest.fn().mockResolvedValue({
                count: 1,
                rows: [mockIncident]
            });

            // Instance methods
            id = mockIncident.id;
            userId = mockIncident.userId;
            type = mockIncident.type;
            description = mockIncident.description;
            status = mockIncident.status;
            summary = mockIncident.summary;
            createdAt = mockIncident.createdAt;
            updatedAt = mockIncident.updatedAt;
            save = mockIncident.save;
        }
    };
});

// Mock the database connection for tests
jest.mock('../src/config/database', () => ({
    __esModule: true,
    default: {
        authenticate: jest.fn().mockResolvedValue(true),
        sync: jest.fn().mockResolvedValue(true),
        close: jest.fn().mockResolvedValue(true),
        define: jest.fn(),
        model: jest.fn(),
    },
}));

// Mock Firebase Admin
jest.mock('firebase-admin', () => {
  const actual = jest.requireActual('firebase-admin');
  return {
    ...actual,
    apps: [],
    initializeApp: jest.fn(),
    credential: {
      cert: jest.fn(),
      applicationDefault: jest.fn(),
    },
    auth: jest.fn().mockReturnValue({
      verifyIdToken: jest.fn().mockResolvedValue({ uid: 'test-user-id', email: 'test@example.com' }),
    }),
  };
});

// Mock OpenAI
jest.mock('openai', () => {
    return {
        __esModule: true,
        default: class MockOpenAI {
            chat = {
                completions: {
                    create: jest.fn().mockResolvedValue({
                        choices: [
                            {
                                message: {
                                    content: 'Mocked AI summary of the incident',
                                },
                            },
                        ],
                    }),
                },
            };
        },
    };
});

// Global test setup
beforeAll(async () => {
    // Set test environment
    process.env.NODE_ENV = 'test';
    process.env.DB_HOST = 'localhost';
    process.env.DB_PORT = '5432';
    process.env.DB_NAME = 'test_db';
    process.env.DB_USER = 'test_user';
    process.env.DB_PASSWORD = 'test_password';
});

// Global test cleanup
afterAll(async () => {
    // Clean up any test data
});

// Suppress console.error in tests unless explicitly needed
const originalError = console.error;
beforeEach(() => {
    console.error = jest.fn();
});

afterEach(() => {
    console.error = originalError;
}); 