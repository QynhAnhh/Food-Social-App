export const prismaMock = {
  user: {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    upsert: jest.fn(),
    update: jest.fn(),
    count: jest.fn(),
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
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    deleteMany: jest.fn(),
    count: jest.fn(),
  },
  recipeStep: {
    createMany: jest.fn(),
    deleteMany: jest.fn(),
  },
  recipeIngredient: {
    createMany: jest.fn(),
    deleteMany: jest.fn(),
  },
  recipeDietaryTag: {
    createMany: jest.fn(),
    deleteMany: jest.fn(),
  },
  category: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
  },
  ingredient: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
  },
  dietaryRegime: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
  },
  favoriteRecipe: {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
    deleteMany: jest.fn(),
    count: jest.fn(),
  },
  savedFilter: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn(),
    delete: jest.fn(),
    deleteMany: jest.fn(),
  },
  shoppingListItem: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    upsert: jest.fn(),
    delete: jest.fn(),
    deleteMany: jest.fn(),
  },
  shoppingListRecipeSource: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    upsert: jest.fn(),
    delete: jest.fn(),
    deleteMany: jest.fn(),
  },
  userDevice: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    upsert: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    deleteMany: jest.fn(),
  },
  deviceToken: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    upsert: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    deleteMany: jest.fn(),
  },
  follow: {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
    deleteMany: jest.fn(),
    count: jest.fn(),
  },
  review: {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    deleteMany: jest.fn(),
    count: jest.fn(),
    aggregate: jest.fn(),
  },
  cooksnap: {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
    deleteMany: jest.fn(),
    count: jest.fn(),
  },
  notification: {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn(),
    delete: jest.fn(),
    deleteMany: jest.fn(),
    count: jest.fn(),
  },
  $transaction: jest.fn((callback: any) => callback(prismaMock)),
};

export const firebaseAuthMock = {
  verifyIdToken: jest.fn(),
};

export const firebaseMessagingMock = {
  sendEachForMulticast: jest.fn().mockResolvedValue({ responses: [] }),
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
  firebaseMessaging: firebaseMessagingMock,
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
  prismaMock.userDevice.findMany.mockResolvedValue([]);
  prismaMock.notification.create.mockResolvedValue({ id: 'mock-notif-id' });
});
