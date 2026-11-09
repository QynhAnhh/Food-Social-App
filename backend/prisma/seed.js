const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// 1. Danh muc mon an (Categories)
const categories = [
  {
    name: 'Bữa chính',
    slug: 'bua-chinh',
  },
  {
    name: 'Món tráng miệng',
    slug: 'mon-trang-mieng',
  },
  {
    name: 'Các loại bánh',
    slug: 'cac-loai-banh',
  },
];

// 2. Che do an kieng (Dietary Regimes)
const dietaryRegimes = [
  {
    name: 'Eat Clean',
    slug: 'eat-clean',
    description: 'Chế độ ăn tập trung vào thực phẩm tươi, tự nhiên, ít qua chế biến công nghiệp.',
  },
  {
    name: 'Keto (Ketogenic)',
    slug: 'keto',
    description: 'Chế độ ăn nhiều chất béo tốt, lượng đạm vừa phải và rất ít carbohydrate.',
  },
  {
    name: 'Ăn chay (Vegetarian)',
    slug: 'vegetarian',
    description: 'Chế độ ăn sử dụng thực vật, không sử dụng thịt động vật.',
  },
  {
    name: 'Low-Carb',
    slug: 'low-carb',
    description: 'Hạn chế hàm lượng carbohydrate từ ngũ cốc, các loại củ nhiều tinh bột và đồ ngọt.',
  },
  {
    name: 'Thuần chay (Vegan)',
    slug: 'vegan',
    description: 'Hoàn toàn loại bỏ mọi thực phẩm và chế phẩm từ động vật (trứng, sữa, mật ong).',
  },
];

// 3. 50+ Tu dien nguyen lieu chuan (Ingredients)
const ingredients = [
  // Thit va Trung
  { name: 'Thịt bò thăn', standardUnit: 'gram', imageUrl: null, isAllergenCommon: false },
  { name: 'Ức gà', standardUnit: 'gram', imageUrl: null, isAllergenCommon: false },
  { name: 'Thịt ba chỉ heo', standardUnit: 'gram', imageUrl: null, isAllergenCommon: false },
  { name: 'Thịt bò xay', standardUnit: 'gram', imageUrl: null, isAllergenCommon: false },
  { name: 'Thịt heo xay', standardUnit: 'gram', imageUrl: null, isAllergenCommon: false },
  { name: 'Đùi gà', standardUnit: 'gram', imageUrl: null, isAllergenCommon: false },
  { name: 'Trứng gà', standardUnit: 'quả', imageUrl: null, isAllergenCommon: true },
  { name: 'Trứng vịt', standardUnit: 'quả', imageUrl: null, isAllergenCommon: true },

  // Hai san
  { name: 'Cá hồi phi lê', standardUnit: 'gram', imageUrl: null, isAllergenCommon: true },
  { name: 'Tôm sú', standardUnit: 'gram', imageUrl: null, isAllergenCommon: true },
  { name: 'Mực ống', standardUnit: 'gram', imageUrl: null, isAllergenCommon: true },
  { name: 'Cua biển', standardUnit: 'con', imageUrl: null, isAllergenCommon: true },
  { name: 'Nghêu (Ngao)', standardUnit: 'gram', imageUrl: null, isAllergenCommon: true },
  { name: 'Tôm khô', standardUnit: 'gram', imageUrl: null, isAllergenCommon: true },

  // Rau cu va Nam
  { name: 'Cà chua', standardUnit: 'quả', imageUrl: null, isAllergenCommon: false },
  { name: 'Hành tây', standardUnit: 'củ', imageUrl: null, isAllergenCommon: false },
  { name: 'Tỏi', standardUnit: 'tép', imageUrl: null, isAllergenCommon: false },
  { name: 'Ớt chuông', standardUnit: 'quả', imageUrl: null, isAllergenCommon: false },
  { name: 'Bông cải xanh (Súp lơ)', standardUnit: 'gram', imageUrl: null, isAllergenCommon: false },
  { name: 'Khoai tây', standardUnit: 'củ', imageUrl: null, isAllergenCommon: false },
  { name: 'Cà rốt', standardUnit: 'củ', imageUrl: null, isAllergenCommon: false },
  { name: 'Hành lá', standardUnit: 'gram', imageUrl: null, isAllergenCommon: false },
  { name: 'Nấm hương tươi', standardUnit: 'gram', imageUrl: null, isAllergenCommon: false },
  { name: 'Nấm kim châm', standardUnit: 'gram', imageUrl: null, isAllergenCommon: false },
  { name: 'Nấm đùi gà', standardUnit: 'gram', imageUrl: null, isAllergenCommon: false },
  { name: 'Bắp cải trắng', standardUnit: 'gram', imageUrl: null, isAllergenCommon: false },
  { name: 'Xà lách', standardUnit: 'gram', imageUrl: null, isAllergenCommon: false },
  { name: 'Rau muống', standardUnit: 'gram', imageUrl: null, isAllergenCommon: false },
  { name: 'Giá đỗ', standardUnit: 'gram', imageUrl: null, isAllergenCommon: true },
  { name: 'Dưa leo', standardUnit: 'trái', imageUrl: null, isAllergenCommon: false },
  { name: 'Chanh tươi', standardUnit: 'trái', imageUrl: null, isAllergenCommon: false },
  { name: 'Gừng tươi', standardUnit: 'củ', imageUrl: null, isAllergenCommon: false },
  { name: 'Sả tươi', standardUnit: 'nhánh', imageUrl: null, isAllergenCommon: false },
  { name: 'Húng quế', standardUnit: 'gram', imageUrl: null, isAllergenCommon: false },
  { name: 'Ngò rí (Rau mùi)', standardUnit: 'gram', imageUrl: null, isAllergenCommon: false },

  // Che pham dau, sua va bot
  { name: 'Sữa tươi không đường', standardUnit: 'ml', imageUrl: null, isAllergenCommon: true },
  { name: 'Đậu phộng (Lạc)', standardUnit: 'gram', imageUrl: null, isAllergenCommon: true },
  { name: 'Đậu hũ non', standardUnit: 'gram', imageUrl: null, isAllergenCommon: true },
  { name: 'Bột mì đa dụng', standardUnit: 'gram', imageUrl: null, isAllergenCommon: true },
  { name: 'Bơ lạt', standardUnit: 'gram', imageUrl: null, isAllergenCommon: true },
  { name: 'Phô mai Mozzarella', standardUnit: 'gram', imageUrl: null, isAllergenCommon: true },

  // Gia vi va Nguyen lieu khac
  { name: 'Dầu ăn thực vật', standardUnit: 'ml', imageUrl: null, isAllergenCommon: false },
  { name: 'Nước mắm truyền thống', standardUnit: 'ml', imageUrl: null, isAllergenCommon: false },
  { name: 'Nước tương (Xì dầu)', standardUnit: 'ml', imageUrl: null, isAllergenCommon: true },
  { name: 'Đường trắng', standardUnit: 'gram', imageUrl: null, isAllergenCommon: false },
  { name: 'Muối tinh', standardUnit: 'gram', imageUrl: null, isAllergenCommon: false },
  { name: 'Tiêu đen xay', standardUnit: 'gram', imageUrl: null, isAllergenCommon: false },
  { name: 'Dầu hào', standardUnit: 'ml', imageUrl: null, isAllergenCommon: true },
  { name: 'Hạt nêm', standardUnit: 'gram', imageUrl: null, isAllergenCommon: false },
  { name: 'Tương ớt', standardUnit: 'gram', imageUrl: null, isAllergenCommon: false },
  { name: 'Giấm gạo', standardUnit: 'ml', imageUrl: null, isAllergenCommon: false },
  { name: 'Mật ong nguyên chất', standardUnit: 'ml', imageUrl: null, isAllergenCommon: false },
];

async function main() {
  console.log('Bat dau nap du lieu tu dien vao co so du lieu...');

  // 1. Nap danh muc mon an (Categories - Upsert theo slug)
  console.log('Dang nap danh muc mon an...');
  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: { name: category.name },
      create: category,
    });
  }
  console.log(`Da nap thanh cong ${categories.length} danh muc mon an.`);

  // 2. Nap che do an kieng (Dietary Regimes - Upsert theo slug)
  console.log('Dang nap danh muc che do an kieng...');
  for (const regime of dietaryRegimes) {
    await prisma.dietaryRegime.upsert({
      where: { slug: regime.slug },
      update: {
        name: regime.name,
        description: regime.description,
      },
      create: regime,
    });
  }
  console.log(`Da nap thanh cong ${dietaryRegimes.length} che do an kieng.`);

  // 3. Nap tu dien nguyen lieu chuan (Ingredients - Upsert theo ten)
  console.log('Dang nap tu dien nguyen lieu chuan...');
  for (const ingredient of ingredients) {
    await prisma.ingredient.upsert({
      where: { name: ingredient.name },
      update: {
        standardUnit: ingredient.standardUnit,
        imageUrl: ingredient.imageUrl,
        isAllergenCommon: ingredient.isAllergenCommon,
      },
      create: ingredient,
    });
  }
  console.log(`Da nap thanh cong ${ingredients.length} nguyen lieu chuan.`);

  console.log('Toan bo du lieu tu dien da duoc nap thanh cong!');
}

main()
  .catch((e) => {
    console.error('Loi trong qua trinh nap du lieu:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
