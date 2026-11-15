export const prismaMock = {
  user: {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    upsert: jest.fn(),
    update: jest.fn(),
  },
  userAllergy: {
    deleteMany: jest.fn(),
    createMany: jest.fn(),
    findMany: jest.fn(),
  },
  userFridgeItem: {
    findMany: jest.fn(),
    findFirst: jest.fn(),
    upsert: jest.fn(),
    update: jest.fn(),
    deleteMany: jest.fn(),
  },
  recipe: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
  },
  favoriteRecipe: {
    findUnique: jest.fn(),
  },
  $transaction: jest.fn((callback: any) => callback(prismaMock)),
};

export const firebaseAuthMock = {
  verifyIdToken: jest.fn(),
};

export const fileSaveMock = jest.fn().mockResolvedValue(undefined);
export const firebaseBucketMock = {
  name: 'food-social-app.appspot.com',
  file: jest.fn(() => ({
    save: fileSaveMock,
  })),
};

jest.mock('../src/config/prisma', () => ({
  prisma: prismaMock,
}));

jest.mock('../src/config/firebase', () => ({
  firebaseAuth: firebaseAuthMock,
  firebaseBucket: firebaseBucketMock,
}));

beforeEach(() => {
  jest.clearAllMocks();
  firebaseAuthMock.verifyIdToken.mockResolvedValue({
    uid: 'firebase-uid-123',
    email: 'nhat.android@gmail.com',
    name: 'Minh Nhất',
    picture: 'https://lh3.googleusercontent.com/a/default-user',
  });
  prismaMock.user.findUnique.mockResolvedValue({
    id: 'user-uuid-1',
    firebaseUid: 'firebase-uid-123',
    email: 'nhat.android@gmail.com',
    nickname: 'chef_nhat',
    fullName: 'Minh Nhất',
    role: 'USER',
  });
});
