import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ==========================================
// danh mục món ăn (categories)
// ==========================================
const categories = [
  {
    name: 'Bữa chính',
    slug: 'bua-chinh',
    iconUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100',
  },
  {
    name: 'Món tráng miệng',
    slug: 'mon-trang-mieng',
    iconUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=100',
  },
  {
    name: 'Các loại bánh',
    slug: 'cac-loai-banh',
    iconUrl: 'https://images.unsplash.com/photo-1586985289688-ca3cf47d3e6e?w=100',
  },
];

// ==========================================
// chế độ ăn kiêng (dietary regimes)
// ==========================================
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

// ==========================================
// 50+ từ điển nguyên liệu chuẩn (ingredients)
// ==========================================
const ingredients = [
  // Thịt và Trứng
  { name: 'Thịt bò thăn', standardUnit: 'gram', imageUrl: null, isAllergenCommon: false },
  { name: 'Ức gà', standardUnit: 'gram', imageUrl: null, isAllergenCommon: false },
  { name: 'Thịt ba chỉ heo', standardUnit: 'gram', imageUrl: null, isAllergenCommon: false },
  { name: 'Thịt bò xay', standardUnit: 'gram', imageUrl: null, isAllergenCommon: false },
  { name: 'Thịt heo xay', standardUnit: 'gram', imageUrl: null, isAllergenCommon: false },
  { name: 'Đùi gà', standardUnit: 'gram', imageUrl: null, isAllergenCommon: false },
  { name: 'Trứng gà', standardUnit: 'quả', imageUrl: null, isAllergenCommon: true },
  { name: 'Trứng vịt', standardUnit: 'quả', imageUrl: null, isAllergenCommon: true },

  // Hải sản
  { name: 'Cá hồi phi lê', standardUnit: 'gram', imageUrl: null, isAllergenCommon: true },
  { name: 'Tôm sú', standardUnit: 'gram', imageUrl: null, isAllergenCommon: true },
  { name: 'Mực ống', standardUnit: 'gram', imageUrl: null, isAllergenCommon: true },
  { name: 'Cua biển', standardUnit: 'con', imageUrl: null, isAllergenCommon: true },
  { name: 'Nghêu (Ngao)', standardUnit: 'gram', imageUrl: null, isAllergenCommon: true },
  { name: 'Tôm khô', standardUnit: 'gram', imageUrl: null, isAllergenCommon: true },

  // Rau củ và Nấm
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

  // Chế phẩm đậu, sữa và bột
  { name: 'Sữa tươi không đường', standardUnit: 'ml', imageUrl: null, isAllergenCommon: true },
  { name: 'Đậu phộng (Lạc)', standardUnit: 'gram', imageUrl: null, isAllergenCommon: true },
  { name: 'Đậu hũ non', standardUnit: 'gram', imageUrl: null, isAllergenCommon: true },
  { name: 'Bột mì đa dụng', standardUnit: 'gram', imageUrl: null, isAllergenCommon: true },
  { name: 'Bơ lạt', standardUnit: 'gram', imageUrl: null, isAllergenCommon: true },
  { name: 'Phô mai Mozzarella', standardUnit: 'gram', imageUrl: null, isAllergenCommon: true },

  // Gia vị và Nguyên liệu khác
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

// ==========================================
// danh sách người dùng demo (demo chefs)
// ==========================================
const demoUsers = [
  {
    id: 'user-uuid-1',
    firebaseUid: 'firebase-uid-123',
    email: 'nhat.android@gmail.com',
    nickname: 'chef_nhat',
    fullName: 'Minh Nhất',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300',
    bio: 'Lập trình viên mê nấu nướng. Thích ăn ngon và khám phá công thức mới mẻ.',
  },
  {
    id: 'u-chef-tuan-0001',
    firebaseUid: 'firebase-chef-tuan',
    email: 'tuan.chef@foodsocial.app',
    nickname: 'chef_tuan',
    fullName: 'Nguyễn Anh Tuấn',
    avatarUrl: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=300',
    bio: 'Bếp trưởng 10 năm kinh nghiệm ẩm thực Việt & Á Đông. Yêu thích các món ăn gia đình đậm vị truyền thống.',
  },
  {
    id: 'u-maianh-eatclean-0002',
    firebaseUid: 'firebase-maianh-eatclean',
    email: 'maianh.fit@foodsocial.app',
    nickname: 'maianh_eatclean',
    fullName: 'Lê Mai Anh',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300',
    bio: 'Huấn luyện viên dinh dưỡng & Eat Clean. Chia sẻ các công thức giảm cân, lành mạnh và dễ nấu.',
  },
  {
    id: 'u-bepmebong-0003',
    firebaseUid: 'firebase-bepmebong',
    email: 'mebong.bep@foodsocial.app',
    nickname: 'bepmebong',
    fullName: 'Trần Bích Ngọc',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300',
    bio: 'Mẹ của hai bé Bon & Bông. Đam mê làm bánh ngọt, tráng miệng và chăm sóc tổ ấm nhỏ.',
  },
  {
    id: 'u-anchay-healthy-0004',
    firebaseUid: 'firebase-anchay-healthy',
    email: 'hoang.anchay@foodsocial.app',
    nickname: 'anchay_healthy',
    fullName: 'Phạm Minh Hoàng',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300',
    bio: 'Người theo đuổi lối sống thuần chay tích cực (Vegan & Plant-based). Nấu ăn là thiền định.',
  },
  {
    id: 'u-lanhuong-0005',
    firebaseUid: 'firebase-lanhuong',
    email: 'lanhuong.cook@foodsocial.app',
    nickname: 'lanhuong_cook',
    fullName: 'Vũ Lan Hương',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300',
    bio: 'Food blogger mê du lịch và ẩm thực fusion Âu - Á. Thích thử nghiệm những hương vị mới lạ.',
  },
];

// ==========================================
// mối quan hệ theo dõi (follow relations)
// ==========================================
const followRelations = [
  // chef_nhat theo dõi 4 đầu bếp nổi bật để News Feed ngập tràn công thức
  { followerId: 'user-uuid-1', followingId: 'u-chef-tuan-0001' },
  { followerId: 'user-uuid-1', followingId: 'u-maianh-eatclean-0002' },
  { followerId: 'user-uuid-1', followingId: 'u-bepmebong-0003' },
  { followerId: 'user-uuid-1', followingId: 'u-anchay-healthy-0004' },
  // Các đầu bếp theo dõi chéo lẫn nhau
  { followerId: 'u-maianh-eatclean-0002', followingId: 'u-chef-tuan-0001' },
  { followerId: 'u-maianh-eatclean-0002', followingId: 'u-anchay-healthy-0004' },
  { followerId: 'u-bepmebong-0003', followingId: 'u-maianh-eatclean-0002' },
  { followerId: 'u-bepmebong-0003', followingId: 'u-lanhuong-0005' },
  { followerId: 'u-lanhuong-0005', followingId: 'u-chef-tuan-0001' },
  { followerId: 'u-lanhuong-0005', followingId: 'u-bepmebong-0003' },
  { followerId: 'u-chef-tuan-0001', followingId: 'u-lanhuong-0005' },
];

// ==========================================
// 20 công thức chuẩn hoàn chỉnh (20 recipes)
// ==========================================
interface RawRecipeSeed {
  id: string;
  authorId: string;
  categorySlug: string;
  dietarySlugs: string[];
  title: string;
  description: string;
  thumbnailUrl: string;
  servings: number;
  cookingTime: number;
  ingredients: { name: string; quantity: number; note?: string }[];
  steps: { stepNumber: number; instruction: string; timerSeconds?: number }[];
  reviews: { userId: string; rating: number; comment: string }[];
  cooksnaps: { userId: string; imageUrl: string; caption: string }[];
}

const recipes20: RawRecipeSeed[] = [
  {
    id: 'recipe-01-pho-bo-tai-lan',
    authorId: 'u-chef-tuan-0001',
    categorySlug: 'bua-chinh',
    dietarySlugs: [],
    title: 'Phở bò tái lăn Hà Nội',
    description: 'Món phở bò tái lăn chuẩn vị Hà Thành với thịt bò thăn xào lửa lớn cùng tỏi gừng thơm nức mũi, hòa quyện trong nước dùng thanh ngọt đậm đà.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=800',
    servings: 2,
    cookingTime: 45,
    ingredients: [
      { name: 'Thịt bò thăn', quantity: 300, note: 'thái mỏng ngang thớ' },
      { name: 'Hành tây', quantity: 1, note: 'thái lát mỏng' },
      { name: 'Gừng tươi', quantity: 1, note: 'đập dập băm nhỏ' },
      { name: 'Tỏi', quantity: 5, note: 'băm nhuyễn phi thơm' },
      { name: 'Hành lá', quantity: 50, note: 'thái nhỏ' },
      { name: 'Ngò rí (Rau mùi)', quantity: 30, note: 'rửa sạch thái nhỏ' },
      { name: 'Nước mắm truyền thống', quantity: 30, note: 'nêm nếm vừa miệng' },
    ],
    steps: [
      { stepNumber: 1, instruction: 'Sơ chế nguyên liệu: Thịt bò thái mỏng ngang thớ. Gừng, tỏi đập dập băm nhỏ. Hành lá, ngò rí rửa sạch thái nhỏ. Hành tây thái mỏng ngâm nước đá.', timerSeconds: 600 },
      { stepNumber: 2, instruction: 'Ướp thịt bò với 1 thìa tỏi băm, gừng băm, 1 thìa nước mắm và chút tiêu xay trong 15 phút.', timerSeconds: 900 },
      { stepNumber: 3, instruction: 'Xào thịt bò tái lăn: Đun chảo thật nóng với dầu ăn, phi thơm tỏi gừng, trút thịt bò vào đảo nhanh tay trên lửa lớn trong 1-2 phút cho thịt vừa chín tái rồi trút ra đĩa.', timerSeconds: 120 },
      { stepNumber: 4, instruction: 'Trần bánh phở xếp vào tô, đặt thịt bò tái lăn, hành lá, ngò rí và hành tây lên trên. Chan nước dùng sôi sùng sục vào tô và thưởng thức nóng kèm tương ớt, chanh tươi.', timerSeconds: 180 },
    ],
    reviews: [
      { userId: 'user-uuid-1', rating: 5, comment: 'Công thức quá chuẩn, xào thịt bò lửa lớn thịt mềm tan không bị dai chút nào!' },
      { userId: 'u-lanhuong-0005', rating: 5, comment: 'Nước dùng đậm đà, mùi gừng tỏi xào quyến rũ đúng điệu phở tái lăn phố cổ.' },
    ],
    cooksnaps: [
      { userId: 'user-uuid-1', imageUrl: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=600', caption: 'Mình nấu cho cả gia đình ăn sáng Chủ nhật, ai cũng tấm tắc khen ngon hơn ngoài hàng!' },
    ],
  },
  {
    id: 'recipe-02-bo-sot-tieu-den',
    authorId: 'u-lanhuong-0005',
    categorySlug: 'bua-chinh',
    dietarySlugs: ['keto', 'low-carb'],
    title: 'Bò sốt tiêu đen kèm khoai tây nghiền',
    description: 'Thăn bò áp chảo mềm mọng nước phủ sốt tiêu đen cay nồng ấm cúng, ăn kèm khoai tây nghiền bơ sữa béo ngậy chuẩn phong cách bistro.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800',
    servings: 2,
    cookingTime: 35,
    ingredients: [
      { name: 'Thịt bò thăn', quantity: 400, note: 'cắt miếng steak dày 2.5cm' },
      { name: 'Khoai tây', quantity: 2, note: 'luộc chín bóc vỏ' },
      { name: 'Bơ lạt', quantity: 40, note: 'chia làm 2 phần' },
      { name: 'Sữa tươi không đường', quantity: 60, note: 'đun ấm hòa cùng khoai' },
      { name: 'Tiêu đen xay', quantity: 15, note: 'xay dập hạt to' },
      { name: 'Tỏi', quantity: 4, note: 'đập dập' },
      { name: 'Dầu hào', quantity: 20, note: 'tạo độ sánh thơm cho sốt' },
    ],
    steps: [
      { stepNumber: 1, instruction: 'Ướp thăn bò với muối, tiêu đen xay dập và chút dầu ăn trong 15 phút. Luộc khoai tây chín mềm rồi bóc vỏ.', timerSeconds: 900 },
      { stepNumber: 2, instruction: 'Nghiền nhuyễn khoai tây khi còn nóng cùng bơ lạt, sữa tươi không đường và một nhúm muối nhỏ cho đến khi kết cấu mịn mượt.', timerSeconds: 300 },
      { stepNumber: 3, instruction: 'Áp chảo bò: Làm nóng chảo với chút bơ và tỏi, áp chảo bò mỗi mặt 2-3 phút tùy độ chín mong muốn, sau đó để thịt nghỉ 5 phút.', timerSeconds: 360 },
      { stepNumber: 4, instruction: 'Làm sốt tiêu đen: Dùng chảo vừa áp chảo thịt, phi thơm tỏi, cho tiêu đen xay, dầu hào, chút nước và bơ lạt vào đun sệt lại. Rưới sốt lên thịt bò và thưởng thức cùng khoai tây nghiền.', timerSeconds: 240 },
    ],
    reviews: [
      { userId: 'u-chef-tuan-0001', rating: 5, comment: 'Sốt tiêu đen cân bằng rất tốt, khoai tây nghiền mịn ngậy tuyệt hảo.' },
      { userId: 'user-uuid-1', rating: 4, comment: 'Thịt bò mọng nước mềm thơm, rất hợp cho bữa tối lãng mạn cuối tuần.' },
    ],
    cooksnaps: [
      { userId: 'u-maianh-eatclean-0002', imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600', caption: 'Làm theo hướng dẫn để thịt nghỉ 5 phút giúp giữ trọn vẹn nước ngọt trong thịt!' },
    ],
  },
  {
    id: 'recipe-03-salad-uc-ga-me-rang',
    authorId: 'u-maianh-eatclean-0002',
    categorySlug: 'bua-chinh',
    dietarySlugs: ['eat-clean', 'low-carb'],
    title: 'Salad ức gà áp chảo sốt mè rang',
    description: 'Món salad thanh mát giàu đạm với ức gà áp chảo giòn ngoài mọng trong, kết hợp rau xà lách tươi giòn, dưa leo và cà chua sốt mè thơm bùi.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800',
    servings: 2,
    cookingTime: 20,
    ingredients: [
      { name: 'Ức gà', quantity: 300, note: 'khía nhẹ bề mặt' },
      { name: 'Xà lách', quantity: 150, note: 'rửa sạch vắt ráo nước' },
      { name: 'Cà chua', quantity: 2, note: 'thái múi cau hoặc lát mỏng' },
      { name: 'Dưa leo', quantity: 1, note: 'thái lát tròn giòn' },
      { name: 'Dầu ăn thực vật', quantity: 10, note: 'áp chảo chống dính' },
      { name: 'Muối tinh', quantity: 5, note: 'ướp gà' },
      { name: 'Tiêu đen xay', quantity: 5, note: 'rắc thơm bề mặt' },
    ],
    steps: [
      { stepNumber: 1, instruction: 'Ức gà khứa nhẹ vài đường, ướp với chút muối, tiêu đen và dầu ăn trong 10 phút.', timerSeconds: 600 },
      { stepNumber: 2, instruction: 'Rau xà lách ngâm nước muối loãng, rửa sạch vắt ráo rồi cắt khúc vừa ăn. Cà chua, dưa leo thái lát mỏng.', timerSeconds: 300 },
      { stepNumber: 3, instruction: 'Áp chảo ức gà trên chảo chống dính với lửa vừa mỗi mặt 5-6 phút cho vàng ruộm hai mặt và chín đều bên trong.', timerSeconds: 600 },
      { stepNumber: 4, instruction: 'Thái ức gà thành các lát xéo mỏng. Bày rau xà lách, cà chua, dưa leo ra đĩa, xếp ức gà lên trên và rưới nước sốt mè rang trộn đều trước khi dùng.', timerSeconds: 180 },
    ],
    reviews: [
      { userId: 'u-bepmebong-0003', rating: 5, comment: 'Món ăn giảm cân yêu thích của mình, ức gà không bị khô ráp chút nào.' },
      { userId: 'user-uuid-1', rating: 5, comment: 'Rau giòn ngọt, sốt mè rang thơm bùi ăn cực cuốn.' },
    ],
    cooksnaps: [
      { userId: 'u-lanhuong-0005', imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600', caption: 'Ăn trưa Eat Clean nhẹ bụng mà vẫn no lâu cả buổi chiều.' },
    ],
  },
  {
    id: 'recipe-04-ca-hoi-ap-chao-bo-toi',
    authorId: 'u-chef-tuan-0001',
    categorySlug: 'bua-chinh',
    dietarySlugs: ['eat-clean', 'keto', 'low-carb'],
    title: 'Cá hồi áp chảo sốt bơ tỏi chanh',
    description: 'Cá hồi Na Uy áp chảo da giòn rụm, thịt hồng mềm ngọt ngào quyện cùng sốt bơ tỏi sánh ngậy và vị chua nhẹ tinh tế từ chanh tươi.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800',
    servings: 2,
    cookingTime: 25,
    ingredients: [
      { name: 'Cá hồi phi lê', quantity: 350, note: 'để ráo thấm khô da' },
      { name: 'Bơ lạt', quantity: 30, note: 'thêm vào chảo khi gần chín' },
      { name: 'Tỏi', quantity: 4, note: 'đập dập phi vàng thơm' },
      { name: 'Chanh tươi', quantity: 1, note: 'vắt lấy nước cốt' },
      { name: 'Muối tinh', quantity: 5, note: 'ướp đều hai mặt cá' },
      { name: 'Tiêu đen xay', quantity: 5, note: 'rắc mặt cá' },
    ],
    steps: [
      { stepNumber: 1, instruction: 'Thấm khô phi lê cá hồi bằng khăn giấy sạch. Rắc đều muối tinh và tiêu đen xay lên hai mặt miếng cá.', timerSeconds: 300 },
      { stepNumber: 2, instruction: 'Làm nóng chảo chống dính với chút dầu ăn. Đặt mặt da cá xuống áp chảo lửa vừa trong 4 phút cho da vàng giòn rụm.', timerSeconds: 240 },
      { stepNumber: 3, instruction: 'Lật mặt cá, hạ nhỏ lửa áp chảo thêm 2 phút. Cho bơ lạt đập dập tỏi vào chảo, nghiêng chảo múc bơ rưới liên tục lên mình cá.', timerSeconds: 180 },
      { stepNumber: 4, instruction: 'Vắt nước cốt nửa quả chanh tươi vào chảo bơ đảo đều rồi tắt bếp ngay. Bày cá hồi ra đĩa và rưới sốt bơ tỏi chanh lên trên.', timerSeconds: 120 },
    ],
    reviews: [
      { userId: 'u-maianh-eatclean-0002', rating: 5, comment: 'Da cá giòn tan rôm rốp, thịt mềm ngọt không bị tanh chút nào!' },
      { userId: 'user-uuid-1', rating: 5, comment: 'Món ăn sang xịn mịn như nhà hàng 5 sao mà nấu siêu nhanh.' },
    ],
    cooksnaps: [
      { userId: 'u-bepmebong-0003', imageUrl: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=600', caption: 'Lần đầu tiên làm cá hồi mà da giòn được như thế này, cảm ơn thầy Tuấn!' },
    ],
  },
  {
    id: 'recipe-05-tom-su-hap-sa-gung',
    authorId: 'u-lanhuong-0005',
    categorySlug: 'bua-chinh',
    dietarySlugs: ['eat-clean', 'low-carb'],
    title: 'Tôm sú hấp sả gừng tươi',
    description: 'Tôm sú tươi sống chắc thịt ngọt lịm được hấp chín tới cùng sả cây đập dập và gừng thái chỉ, giữ trọn vẹn hương vị biển cả.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=800',
    servings: 3,
    cookingTime: 15,
    ingredients: [
      { name: 'Tôm sú', quantity: 500, note: 'tôm tươi còn bơi' },
      { name: 'Sả tươi', quantity: 5, note: 'đập dập cắt khúc' },
      { name: 'Gừng tươi', quantity: 1, note: 'thái chỉ sợi mỏng' },
      { name: 'Chanh tươi', quantity: 1, note: 'pha muối tiêu chanh' },
      { name: 'Muối tinh', quantity: 10, note: 'chấm kèm' },
      { name: 'Tiêu đen xay', quantity: 5, note: 'chấm kèm' },
    ],
    steps: [
      { stepNumber: 1, instruction: 'Tôm sú rửa sạch, cắt bớt râu và ngạnh nhọn, rút chỉ đen trên lưng tôm.', timerSeconds: 300 },
      { stepNumber: 2, instruction: 'Sả đập dập cắt khúc 5cm. Gừng cạo vỏ thái sợi mỏng. Lót 1/2 lượng sả gừng xuống đáy xửng hấp.', timerSeconds: 300 },
      { stepNumber: 3, instruction: 'Xếp tôm sú lên trên lớp sả gừng, rải phần sả gừng còn lại lên mình tôm. Đậy nắp hấp lửa lớn trong 7-8 phút đến khi tôm chuyển màu đỏ cam cong tròn.', timerSeconds: 480 },
      { stepNumber: 4, instruction: 'Bày tôm ra đĩa, chấm cùng muối tiêu chanh tươi hoặc nước mắm ớt chua ngọt.', timerSeconds: 120 },
    ],
    reviews: [
      { userId: 'u-chef-tuan-0001', rating: 5, comment: 'Hấp đúng độ thời gian tôm giòn sần sật ngọt lịm.' },
      { userId: 'user-uuid-1', rating: 4, comment: 'Đơn giản mà ngon tuyệt, chấm muối ớt xanh thì hết nước chấm.' },
    ],
    cooksnaps: [],
  },
  {
    id: 'recipe-06-dau-hu-non-sot-nam',
    authorId: 'u-anchay-healthy-0004',
    categorySlug: 'bua-chinh',
    dietarySlugs: ['vegetarian', 'vegan', 'eat-clean'],
    title: 'Đậu hũ non sốt nấm xì dầu',
    description: 'Đậu hũ non mềm tan trong miệng kết hợp cùng nấm kim châm và nấm đùi gà dai ngọt tự nhiên, hòa quyện sốt xì dầu sánh nâu đậm vị cơm nhà.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800',
    servings: 2,
    cookingTime: 20,
    ingredients: [
      { name: 'Đậu hũ non', quantity: 300, note: 'cắt khoanh dày 2cm' },
      { name: 'Nấm kim châm', quantity: 150, note: 'cắt gốc rửa sạch' },
      { name: 'Nấm đùi gà', quantity: 100, note: 'thái lát xéo vừa ăn' },
      { name: 'Nước tương (Xì dầu)', quantity: 30, note: 'sốt nấm' },
      { name: 'Dầu hào', quantity: 15, note: 'dầu hào chay' },
      { name: 'Hành lá', quantity: 20, note: 'rắc bề mặt' },
      { name: 'Tỏi', quantity: 3, note: 'băm nhỏ phi thơm' },
    ],
    steps: [
      { stepNumber: 1, instruction: 'Đậu hũ non cắt khoanh tròn hoặc miếng vuông dày 2cm, xếp ra đĩa sâu lòng rồi đem hấp cách thủy 5 phút.', timerSeconds: 300 },
      { stepNumber: 2, instruction: 'Nấm kim châm cắt gốc rửa sạch tách nhỏ. Nấm đùi gà thái lát mỏng vừa ăn.', timerSeconds: 300 },
      { stepNumber: 3, instruction: 'Phi thơm tỏi băm trên chảo dầu nóng, trút nấm đùi gà và nấm kim châm vào xào chín tới. Nêm nước tương, dầu hào và chút nước lọc đun sôi lăn tăn.', timerSeconds: 300 },
      { stepNumber: 4, instruction: 'Rưới toàn bộ sốt nấm xì dầu còn nóng hổi lên đĩa đậu hũ non, rắc hành lá thái nhỏ và chút tiêu xay lên trên mặt.', timerSeconds: 120 },
    ],
    reviews: [
      { userId: 'u-bepmebong-0003', rating: 5, comment: 'Đậu mềm mượt, nấm thơm ngọt tự nhiên, cả nhà mình đều thích mê.' },
      { userId: 'user-uuid-1', rating: 5, comment: 'Món chay xuất sắc, ăn với cơm nóng thì vào cơm không tưởng.' },
    ],
    cooksnaps: [
      { userId: 'u-maianh-eatclean-0002', imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600', caption: 'Ăn chay nhẹ bụng thanh tịnh mà vẫn đầy đủ dưỡng chất.' },
    ],
  },
  {
    id: 'recipe-07-bong-cai-xao-nam-dui-ga',
    authorId: 'u-anchay-healthy-0004',
    categorySlug: 'bua-chinh',
    dietarySlugs: ['vegetarian', 'vegan', 'eat-clean'],
    title: 'Bông cải xanh xào nấm đùi gà',
    description: 'Món xào chay giòn ngọt thanh đạm từ súp lơ xanh mướt và nấm đùi gà tươi, giàu chất xơ và vitamin cho bữa cơm gia đình khỏe mạnh.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800',
    servings: 2,
    cookingTime: 15,
    ingredients: [
      { name: 'Bông cải xanh (Súp lơ)', quantity: 300, note: 'tách nhánh vừa ăn' },
      { name: 'Nấm đùi gà', quantity: 150, note: 'thái lát xéo' },
      { name: 'Tỏi', quantity: 4, note: 'đập dập phi thơm' },
      { name: 'Dầu ăn thực vật', quantity: 15, note: 'xào lửa lớn' },
      { name: 'Hạt nêm', quantity: 10, note: 'hạt nêm nấm chay' },
      { name: 'Tiêu đen xay', quantity: 5, note: 'rắc mặt đĩa' },
    ],
    steps: [
      { stepNumber: 1, instruction: 'Bông cải xanh cắt miếng vừa ăn, ngâm nước muối loãng 5 phút rồi rửa sạch. Nấm đùi gà thái lát xéo.', timerSeconds: 300 },
      { stepNumber: 2, instruction: 'Trần sơ bông cải xanh trong nước sôi có pha nhúm muối nhỏ khoảng 1 phút rồi vớt ngay ra âu nước đá để giữ màu xanh giòn.', timerSeconds: 120 },
      { stepNumber: 3, instruction: 'Làm nóng chảo với dầu ăn, phi thơm tỏi băm rồi trút nấm vào xào trước trong 2 phút cho nấm mềm ngọt.', timerSeconds: 120 },
      { stepNumber: 4, instruction: 'Trút bông cải xanh vào xào chung trên lửa lớn, nêm hạt nêm vừa vị, đảo nhanh tay trong 2 phút rồi rắc tiêu ra đĩa.', timerSeconds: 120 },
    ],
    reviews: [
      { userId: 'u-lanhuong-0005', rating: 5, comment: 'Bí quyết ngâm nước đá giúp súp lơ xanh mướt và giòn sần sật!' },
    ],
    cooksnaps: [],
  },
  {
    id: 'recipe-08-canh-ngao-chua-thanh-mat',
    authorId: 'u-chef-tuan-0001',
    categorySlug: 'bua-chinh',
    dietarySlugs: [],
    title: 'Canh ngao chua thanh mát',
    description: 'Bát canh ngao nấu chua với cà chua đỏ au, vị chua dịu nhẹ thanh nhiệt xua tan oi bức của ngày hè, đưa cơm vô cùng.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=800',
    servings: 4,
    cookingTime: 25,
    ingredients: [
      { name: 'Nghêu (Ngao)', quantity: 600, note: 'ngâm nhả sạch cát' },
      { name: 'Cà chua', quantity: 3, note: 'bổ múi cau xào lấy màu' },
      { name: 'Hành lá', quantity: 40, note: 'thái nhỏ' },
      { name: 'Ngò rí (Rau mùi)', quantity: 30, note: 'thái nhỏ' },
      { name: 'Nước mắm truyền thống', quantity: 20, note: 'nêm nếm' },
      { name: 'Hành tây', quantity: 1, note: 'thái mỏng' },
    ],
    steps: [
      { stepNumber: 1, instruction: 'Ngao ngâm nước có cắt vài lát ớt trong 1-2 tiếng để nhả sạch cát, sau đó rửa lại nhiều lần cho thật sạch vỏ.', timerSeconds: 600 },
      { stepNumber: 2, instruction: 'Luộc ngao với lượng nước vừa đủ ngập mặt. Khi ngao hé miệng thì vớt ra gỡ lấy thịt, nước luộc để lắng rồi gạn lấy phần nước trong.', timerSeconds: 300 },
      { stepNumber: 3, instruction: 'Phi thơm hành với dầu ăn, xào cà chua bổ múi cau cho mềm nhuyễn tạo màu đỏ đẹp. Cho thịt ngao vào xào săn với chút nước mắm.', timerSeconds: 240 },
      { stepNumber: 4, instruction: 'Đổ nước luộc ngao trong vào nồi đun sôi. Nêm nếm lại gia vị vừa miệng, tắt bếp cho hành lá ngò rí thái nhỏ vào rồi múc ra bát thưởng thức.', timerSeconds: 180 },
    ],
    reviews: [
      { userId: 'u-bepmebong-0003', rating: 5, comment: 'Canh chua thanh dịu ngọt, các bé nhà mình húp sạch cả tô.' },
      { userId: 'user-uuid-1', rating: 5, comment: 'Món canh giải nhiệt quốc dân, hướng dẫn chi tiết dễ làm.' },
    ],
    cooksnaps: [
      { userId: 'user-uuid-1', imageUrl: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=600', caption: 'Nước canh trong veo ngọt lịm từ ngao tươi.' },
    ],
  },
  {
    id: 'recipe-09-thit-ba-chi-rang-chay-canh',
    authorId: 'u-chef-tuan-0001',
    categorySlug: 'bua-chinh',
    dietarySlugs: [],
    title: 'Thịt ba chỉ rang cháy cạnh sả ớt',
    description: 'Ba chỉ heo thái mỏng xém vàng cạnh giòn sần sật, thấm đẫm sốt mắm đường cay nồng vị sả ớt thái nhỏ, món ăn kinh điển tốn cơm.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=800',
    servings: 3,
    cookingTime: 25,
    ingredients: [
      { name: 'Thịt ba chỉ heo', quantity: 400, note: 'thái miếng mỏng đều' },
      { name: 'Sả tươi', quantity: 4, note: 'băm nhỏ nhuyễn' },
      { name: 'Hành tây', quantity: 1, note: 'băm nhỏ phi cùng sả' },
      { name: 'Nước mắm truyền thống', quantity: 25, note: 'nước mắm cốt nhĩ' },
      { name: 'Đường trắng', quantity: 15, note: 'hòa cùng nước mắm' },
      { name: 'Tiêu đen xay', quantity: 5, note: 'rắc khi tắt bếp' },
    ],
    steps: [
      { stepNumber: 1, instruction: 'Thịt ba chỉ rửa sạch, thái miếng mỏng vừa ăn. Sả tươi bóc bẹ già băm nhỏ. Hành khô băm nhỏ.', timerSeconds: 300 },
      { stepNumber: 2, instruction: 'Cho thịt vào chảo không cần dầu, đảo đều lửa vừa cho thịt ra bớt mỡ và xém vàng đều các cạnh.', timerSeconds: 480 },
      { stepNumber: 3, instruction: 'Gạn bớt mỡ thừa trong chảo ra bát, trút sả băm và hành vào đảo đều cùng thịt cho dậy mùi thơm nức.', timerSeconds: 180 },
      { stepNumber: 4, instruction: 'Pha nước mắm cùng đường và tiêu cho tan, rưới vào chảo thịt đảo liên tục trên lửa nhỏ cho sốt bám bóng đều quanh miếng thịt rồi tắt bếp.', timerSeconds: 180 },
    ],
    reviews: [
      { userId: 'u-lanhuong-0005', rating: 5, comment: 'Đúng vị mẹ nấu ngày xưa, thịt giòn thơm béo ngậy không ngấy.' },
    ],
    cooksnaps: [],
  },
  {
    id: 'recipe-10-muc-xao-ot-chuong',
    authorId: 'u-lanhuong-0005',
    categorySlug: 'bua-chinh',
    dietarySlugs: ['low-carb'],
    title: 'Mực ống xào ớt chuông cần tây',
    description: 'Mực ống tươi dày thịt khía vảy rồng giòn sần sật xào cùng ớt chuông ba màu rực rỡ và cần tây thơm giòn, đậm đà màu sắc Á Đông.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=800',
    servings: 2,
    cookingTime: 20,
    ingredients: [
      { name: 'Mực ống', quantity: 350, note: 'khía vảy rồng thái miếng vừa ăn' },
      { name: 'Ớt chuông', quantity: 2, note: 'thái miếng vuông quân cờ' },
      { name: 'Hành tây', quantity: 1, note: 'thái múi cau' },
      { name: 'Tỏi', quantity: 4, note: 'băm nhỏ' },
      { name: 'Dầu hào', quantity: 20, note: 'gia vị xào đậm đà' },
      { name: 'Tiêu đen xay', quantity: 5, note: 'rắc thơm' },
    ],
    steps: [
      { stepNumber: 1, instruction: 'Mực làm sạch túi mực và màng ngoài, khía vảy rồng chéo thân rồi cắt miếng vuông vừa ăn. Trần nhanh qua nước sôi có gừng để khử tanh.', timerSeconds: 300 },
      { stepNumber: 2, instruction: 'Ớt chuông bỏ ruột thái miếng vuông. Hành tây thái múi cau. Tỏi đập dập băm nhỏ.', timerSeconds: 240 },
      { stepNumber: 3, instruction: 'Làm nóng chảo với dầu ăn, phi thơm tỏi rồi cho mực vào xào lửa lớn trong 1 phút cho mực săn lại rồi trút ra đĩa riêng.', timerSeconds: 120 },
      { stepNumber: 4, instruction: 'Vẫn dùng chảo đó, xào ớt chuông và hành tây chín tới. Đổ mực trở lại chảo, nêm dầu hào và hạt tiêu đảo đều tay 1 phút rồi tắt bếp.', timerSeconds: 120 },
    ],
    reviews: [
      { userId: 'u-chef-tuan-0001', rating: 5, comment: 'Kỹ thuật khía mực rất đẹp mắt, mực giòn ngọt không ra nước.' },
    ],
    cooksnaps: [],
  },
  {
    id: 'recipe-11-trung-cuon-pho-mai',
    authorId: 'u-maianh-eatclean-0002',
    categorySlug: 'bua-chinh',
    dietarySlugs: ['keto', 'eat-clean'],
    title: 'Trứng cuộn phô mai bơ tỏi',
    description: 'Bữa sáng giàu protein hoàn hảo: lớp trứng vàng óng cuộn chặt phô mai Mozzarella kéo sợi béo ngậy tan chảy cùng hương bơ tỏi thơm lừng.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=800',
    servings: 2,
    cookingTime: 15,
    ingredients: [
      { name: 'Trứng gà', quantity: 4, note: 'đánh tan đều' },
      { name: 'Phô mai Mozzarella', quantity: 80, note: 'bào sợi kéo sợi dài' },
      { name: 'Bơ lạt', quantity: 15, note: 'thoa chảo chống dính' },
      { name: 'Hành lá', quantity: 20, note: 'thái nhỏ' },
      { name: 'Muối tinh', quantity: 3, note: 'nêm trứng' },
      { name: 'Tiêu đen xay', quantity: 3, note: 'rắc thơm' },
    ],
    steps: [
      { stepNumber: 1, instruction: 'Đập trứng gà vào tô, thêm muối, tiêu và hành lá thái nhỏ rồi đánh tan đều nhưng không đánh sủi bọt quá nhiều.', timerSeconds: 180 },
      { stepNumber: 2, instruction: 'Làm nóng chảo chống dính hình chữ nhật hoặc chảo tròn, thoa đều một lớp bơ lạt mỏng.', timerSeconds: 60 },
      { stepNumber: 3, instruction: 'Đổ 1/3 lượng trứng láng mỏng mặt chảo. Khi trứng hơi se mặt, rải phô mai Mozzarella vào một đầu rồi nhẹ nhàng cuộn lại.', timerSeconds: 120 },
      { stepNumber: 4, instruction: 'Đẩy cuộn trứng về mép chảo, đổ tiếp lớp trứng mới tiếp giáp cuộn cũ và lặp lại thao tác cho đến hết trứng. Cắt khoanh tròn và dùng nóng.', timerSeconds: 180 },
    ],
    reviews: [
      { userId: 'u-bepmebong-0003', rating: 5, comment: 'Phô mai kéo sợi thơm ngậy, món ruột của cả nhà mình mỗi sáng.' },
    ],
    cooksnaps: [
      { userId: 'user-uuid-1', imageUrl: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=600', caption: 'Làm siêu nhanh mà ăn no nguyên buổi sáng đi làm!' },
    ],
  },
  {
    id: 'recipe-12-ga-cuon-nam-kim-cham',
    authorId: 'u-maianh-eatclean-0002',
    categorySlug: 'bua-chinh',
    dietarySlugs: ['eat-clean', 'keto'],
    title: 'Gà cuộn nấm kim châm áp chảo',
    description: 'Ức gà dần mềm cuộn tròn nấm kim châm giòn sần sật, áp chảo sốt xì dầu mật ong vàng nâu óng ả, món ăn Eat Clean không hề khô ngán.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=800',
    servings: 2,
    cookingTime: 25,
    ingredients: [
      { name: 'Ức gà', quantity: 300, note: 'lạng mỏng bản to dần mềm' },
      { name: 'Nấm kim châm', quantity: 150, note: 'chia cụm cuộn giữa' },
      { name: 'Nước tương (Xì dầu)', quantity: 20, note: 'pha sốt rim' },
      { name: 'Mật ong nguyên chất', quantity: 15, note: 'tạo độ bóng óng ả' },
      { name: 'Tỏi', quantity: 3, note: 'băm nhỏ' },
      { name: 'Dầu ăn thực vật', quantity: 10, note: 'áp chảo' },
    ],
    steps: [
      { stepNumber: 1, instruction: 'Ức gà lạng mỏng bản to, dùng búa dần thịt dần nhẹ cho thớ thịt mềm. Ướp thịt với chút tiêu và hạt nêm trong 10 phút.', timerSeconds: 600 },
      { stepNumber: 2, instruction: 'Nấm kim châm cắt gốc, rửa sạch chia thành các cụm nhỏ. Trải miếng thịt gà ra, đặt nấm vào giữa và cuộn chặt tay.', timerSeconds: 300 },
      { stepNumber: 3, instruction: 'Làm nóng chảo với chút dầu ăn, đặt mép cuộn thịt xuống áp chảo trước để định hình. Lăn đều các mặt đến khi thịt chín vàng ươm.', timerSeconds: 360 },
      { stepNumber: 4, instruction: 'Khuấy tan nước tương, mật ong và tỏi băm, rưới vào chảo rim nhỏ lửa cho sốt sánh sệt áo đều quanh cuộn gà rồi tắt bếp.', timerSeconds: 180 },
    ],
    reviews: [
      { userId: 'u-lanhuong-0005', rating: 5, comment: 'Nấm ngọt nước hòa quyện làm miếng ức gà mọng nước bất ngờ.' },
    ],
    cooksnaps: [],
  },
  {
    id: 'recipe-13-che-hat-sen-long-nhan',
    authorId: 'u-bepmebong-0003',
    categorySlug: 'mon-trang-mieng',
    dietarySlugs: ['vegetarian'],
    title: 'Chè hạt sen long nhãn táo đỏ',
    description: 'Món chè cung đình thanh nhã, bổ dưỡng giúp an thần tĩnh tâm với hạt sen bở tơi bùi bùi, long nhãn giòn ngọt và nước đường phèn trong veo.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800',
    servings: 4,
    cookingTime: 40,
    ingredients: [
      { name: 'Đường trắng', quantity: 150, note: 'đường phèn thanh ngọt' },
      { name: 'Gừng tươi', quantity: 1, note: 'thái lát mỏng cho ấm vị' },
      { name: 'Đậu phộng (Lạc)', quantity: 30, note: 'rang vàng rắc kèm nếu thích' },
    ],
    steps: [
      { stepNumber: 1, instruction: 'Hạt sen rửa sạch, bỏ tâm sen để không bị đắng. Hấp hoặc luộc hạt sen chín bở mềm tơi nhưng không bị nát.', timerSeconds: 900 },
      { stepNumber: 2, instruction: 'Đun sôi nước với đường phèn và vài lát gừng tươi thái mỏng cho thơm và thanh họng.', timerSeconds: 300 },
      { stepNumber: 3, instruction: 'Trút hạt sen đã chín mềm và long nhãn vào nồi nước đường, đun sôi nhỏ lửa 10 phút cho ngấm vị ngọt thanh.', timerSeconds: 600 },
      { stepNumber: 4, instruction: 'Tắt bếp để chè nguội bớt. Múc chè ra bát, có thể dùng nóng ấm hoặc thêm đá lạnh tùy thích.', timerSeconds: 180 },
    ],
    reviews: [
      { userId: 'u-anchay-healthy-0004', rating: 5, comment: 'Chè ngọt thanh tao, hạt sen bở tơi ăn rất thư thái.' },
      { userId: 'user-uuid-1', rating: 5, comment: 'Hương thơm của gừng và long nhãn thoang thoảng tuyệt vời.' },
    ],
    cooksnaps: [
      { userId: 'u-lanhuong-0005', imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600', caption: 'Ăn một bát chè sen mát lạnh vào ngày hè oi bức thật không gì sánh bằng.' },
    ],
  },
  {
    id: 'recipe-14-sua-chua-dam-hoa-qua',
    authorId: 'u-maianh-eatclean-0002',
    categorySlug: 'mon-trang-mieng',
    dietarySlugs: ['eat-clean'],
    title: 'Sữa chua dầm hoa quả mật ong',
    description: 'Món tráng miệng healthy giải nhiệt tức thì: sữa chua sánh mịn không đường kết hợp trái cây tươi giòn ngọt và mật ong rừng ngọt lịm.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=800',
    servings: 2,
    cookingTime: 10,
    ingredients: [
      { name: 'Sữa tươi không đường', quantity: 100, note: 'pha sữa chua' },
      { name: 'Mật ong nguyên chất', quantity: 30, note: 'rưới ngọt thanh' },
      { name: 'Dưa leo', quantity: 1, note: 'thái hạt lựu' },
      { name: 'Chanh tươi', quantity: 1, note: 'vài giọt nước cốt' },
      { name: 'Đậu phộng (Lạc)', quantity: 20, note: 'rang giã dập' },
    ],
    steps: [
      { stepNumber: 1, instruction: 'Sơ chế trái cây: Gọt vỏ dưa leo, cắt hạt lựu vuông vức nhỏ xinh. Đậu phộng rang chín giã dập.', timerSeconds: 300 },
      { stepNumber: 2, instruction: 'Cho sữa chua không đường ra ly hoặc bát thủy tinh, thêm 1 thìa nước cốt chanh tươi để tạo vị thơm thanh.', timerSeconds: 120 },
      { stepNumber: 3, instruction: 'Xếp lớp trái cây xen kẽ sữa chua, rưới đều mật ong rừng nguyên chất lên trên cùng.', timerSeconds: 120 },
      { stepNumber: 4, instruction: 'Rắc đậu phộng rang giã dập lên trên mặt ly tạo độ giòn bùi và thưởng thức ngay khi còn mát lạnh.', timerSeconds: 60 },
    ],
    reviews: [
      { userId: 'u-bepmebong-0003', rating: 5, comment: 'Đơn giản mà bổ dưỡng, tráng miệng xịn sò cho cả nhà.' },
    ],
    cooksnaps: [],
  },
  {
    id: 'recipe-15-kem-chuoi-nuoc-cot-dua',
    authorId: 'u-bepmebong-0003',
    categorySlug: 'mon-trang-mieng',
    dietarySlugs: [],
    title: 'Kem chuối nước cốt dừa đậu phộng',
    description: 'Món kem tuổi thơ ngọt bùi khó quên: chuối tây ép dẹt bọc đẫm nước cốt dừa béo ngậy thơm vani, phủ kín đậu phộng rang vàng giòn rụm.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1501443762994-82bd5dace89a?w=800',
    servings: 4,
    cookingTime: 30,
    ingredients: [
      { name: 'Sữa tươi không đường', quantity: 150, note: 'nấu cốt dừa béo' },
      { name: 'Đậu phộng (Lạc)', quantity: 50, note: 'rang vàng giòn giã dập' },
      { name: 'Đường trắng', quantity: 40, note: 'nêm nước cốt' },
      { name: 'Bột mì đa dụng', quantity: 15, note: 'tạo độ sánh mịn' },
    ],
    steps: [
      { stepNumber: 1, instruction: 'Đậu phộng rang vàng giòn, bóc vỏ rồi giã dập nhỏ.', timerSeconds: 300 },
      { stepNumber: 2, instruction: 'Nấu nước cốt dừa: Hòa tan sữa tươi, đường và chút bột mì, đun lửa nhỏ khuấy đều tay cho hỗn hợp sánh mịn.', timerSeconds: 300 },
      { stepNumber: 3, instruction: 'Chuối bóc vỏ, cho vào túi nilon sạch dùng dao ép dẹt. Múc nước cốt dừa vừa nấu rưới đều lên hai mặt quả chuối.', timerSeconds: 240 },
      { stepNumber: 4, instruction: 'Rắc thật nhiều đậu phộng rang lên mặt kem chuối. Cho vào ngăn đá tủ lạnh ít nhất 4 tiếng để kem đông cứng lại.', timerSeconds: 120 },
    ],
    reviews: [
      { userId: 'u-chef-tuan-0001', rating: 5, comment: 'Hương vị tuổi thơ ùa về, béo ngậy giòn bùi rất vừa miệng.' },
    ],
    cooksnaps: [],
  },
  {
    id: 'recipe-16-banh-flan-caramel',
    authorId: 'u-bepmebong-0003',
    categorySlug: 'cac-loai-banh',
    dietarySlugs: [],
    title: 'Bánh flan caramel mềm mịn bất bại',
    description: 'Bánh flan caramen béo ngậy núng nính, không bị rỗ mặt nhờ kỹ thuật lọc trứng mịn màng và căn chỉnh nhiệt độ hấp chuẩn từng phút.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1528975604071-b4dc52a2d18c?w=800',
    servings: 6,
    cookingTime: 40,
    ingredients: [
      { name: 'Trứng gà', quantity: 5, note: '3 quả nguyên + 2 lòng đỏ' },
      { name: 'Sữa tươi không đường', quantity: 400, note: 'đun ấm không sôi' },
      { name: 'Đường trắng', quantity: 100, note: 'thắng caramen và pha sữa' },
      { name: 'Bơ lạt', quantity: 10, note: 'quết thành khuôn' },
      { name: 'Chanh tươi', quantity: 1, note: 'vài giọt vào caramen' },
    ],
    steps: [
      { stepNumber: 1, instruction: 'Thắng caramen: Đun 60g đường cùng 20ml nước trên lửa vừa đến khi đường chuyển màu cánh gián, vắt vài giọt chanh rồi tráng đều đáy khuôn bánh.', timerSeconds: 300 },
      { stepNumber: 2, instruction: 'Đun ấm sữa tươi cùng 40g đường còn lại (không đun sôi). Đánh tan nhẹ trứng gà rồi rót từ từ sữa ấm vào quấy đều theo một chiều.', timerSeconds: 240 },
      { stepNumber: 3, instruction: 'Lọc hỗn hợp trứng sữa qua rây 2-3 lần để loại bỏ lợn cợn bọt khí giúp bánh mượt mịn tuyệt đối, sau đó rót vào các khuôn caramen.', timerSeconds: 300 },
      { stepNumber: 4, instruction: 'Xếp khuôn vào xửng hấp với lửa thật nhỏ trong 25-30 phút, phủ khăn sạch lên miệng nồi để tránh nước đọng nhỏ vào bánh làm rỗ mặt.', timerSeconds: 1800 },
    ],
    reviews: [
      { userId: 'u-maianh-eatclean-0002', rating: 5, comment: 'Bánh núng nính mịn mướt như lụa, không một lỗ rỗ nào luôn!' },
      { userId: 'user-uuid-1', rating: 5, comment: 'Vị ngọt thanh caramen hơi đắng nhẹ quyện bơ sữa béo ngậy mê ly.' },
    ],
    cooksnaps: [
      { userId: 'u-anchay-healthy-0004', imageUrl: 'https://images.unsplash.com/photo-1528975604071-b4dc52a2d18c?w=600', caption: 'Làm theo công thức của mẹ Bông mẻ bánh thành công rực rỡ!' },
    ],
  },
  {
    id: 'recipe-17-banh-chuoi-yen-mach',
    authorId: 'u-maianh-eatclean-0002',
    categorySlug: 'cac-loai-banh',
    dietarySlugs: ['eat-clean', 'low-carb'],
    title: 'Bánh chuối yến mạch nho khô Eat Clean',
    description: 'Món bánh nướng không đường tinh luyện, tận dụng vị ngọt tự nhiên của chuối tiêu chín và bột yến mạch nguyên cám, no lâu và tốt cho tim mạch.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1607958996333-41aef7caefaa?w=800',
    servings: 4,
    cookingTime: 45,
    ingredients: [
      { name: 'Bột mì đa dụng', quantity: 100, note: 'bột mì nguyên cám' },
      { name: 'Trứng gà', quantity: 2, note: 'đánh tan' },
      { name: 'Mật ong nguyên chất', quantity: 30, note: 'tạo ngọt tự nhiên' },
      { name: 'Sữa tươi không đường', quantity: 50, note: 'trộn bột' },
      { name: 'Bơ lạt', quantity: 20, note: 'đun chảy' },
    ],
    steps: [
      { stepNumber: 1, instruction: 'Dầm nhuyễn 2 quả chuối chín kỹ bằng dĩa trong một tô lớn.', timerSeconds: 180 },
      { stepNumber: 2, instruction: 'Thêm trứng gà, mật ong, bơ lạt đun chảy và sữa tươi vào tô chuối khuấy đều tạo hỗn hợp ướt.', timerSeconds: 180 },
      { stepNumber: 3, instruction: 'Rây bột mì và yến mạch vào tô, trộn đều theo kỹ thuật fold nhẹ nhàng cho hỗn hợp vừa hòa quyện không vón cục.', timerSeconds: 180 },
      { stepNumber: 4, instruction: 'Lót giấy nướng vào khuôn bánh, đổ bột vào và nướng ở 175°C trong 35-40 phút cho bánh nở phồng vàng ruộm.', timerSeconds: 2400 },
    ],
    reviews: [
      { userId: 'u-bepmebong-0003', rating: 5, comment: 'Bánh ẩm xốp ngọt tự nhiên không cần đường, ăn sáng hay ăn xế đều tiện.' },
    ],
    cooksnaps: [],
  },
  {
    id: 'recipe-18-muffin-viet-quat-pho-mai',
    authorId: 'u-bepmebong-0003',
    categorySlug: 'cac-loai-banh',
    dietarySlugs: [],
    title: 'Bánh muffin việt quất phô mai thơm ngậy',
    description: 'Muffin nở xốp mềm thơm mùi bơ sữa nướng lò, cắn ngập ngụa phô mai béo ngậy và sốt quả mọng chua ngọt bung tỏa nơi đầu lưỡi.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1586985289688-ca3cf47d3e6e?w=800',
    servings: 6,
    cookingTime: 35,
    ingredients: [
      { name: 'Bột mì đa dụng', quantity: 200, note: 'rây mịn' },
      { name: 'Trứng gà', quantity: 2, note: 'nhiệt độ phòng' },
      { name: 'Bơ lạt', quantity: 60, note: 'đun chảy' },
      { name: 'Phô mai Mozzarella', quantity: 60, note: 'cắt hạt lựu nhỏ' },
      { name: 'Đường trắng', quantity: 80, note: 'đánh cùng bơ trứng' },
      { name: 'Sữa tươi không đường', quantity: 80, note: 'hòa trộn đều' },
    ],
    steps: [
      { stepNumber: 1, instruction: 'Làm chảy bơ lạt, đánh tan cùng đường, trứng gà và sữa tươi không đường trong âu lớn.', timerSeconds: 180 },
      { stepNumber: 2, instruction: 'Trộn bột mì đa dụng cùng bột nở, rây từ từ vào âu chất lỏng rồi trộn nhẹ tay đến khi bột vừa ẩm đều.', timerSeconds: 180 },
      { stepNumber: 3, instruction: 'Chia phô mai cắt hạt lựu vào trộn đều cùng bột bánh.', timerSeconds: 120 },
      { stepNumber: 4, instruction: 'Múc bột vào các cốc giấy muffin đến 2/3 khuôn, nướng ở 180°C trong 20-25 phút đến khi bánh chín nở vàng đẹp mắt.', timerSeconds: 1500 },
    ],
    reviews: [
      { userId: 'u-lanhuong-0005', rating: 5, comment: 'Bánh xốp ẩm thơm ngát cả gian bếp khi nướng!' },
    ],
    cooksnaps: [],
  },
  {
    id: 'recipe-19-pancake-mat-ong',
    authorId: 'u-maianh-eatclean-0002',
    categorySlug: 'cac-loai-banh',
    dietarySlugs: ['eat-clean'],
    title: 'Bánh pancake sữa yến mạch mật ong',
    description: 'Từng lớp bánh pancake vàng ruộm bông xốp xếp chồng lên nhau, rưới mật ong óng ánh cho bữa sáng đầy năng lượng và khởi đầu ngày mới tuyệt vời.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800',
    servings: 2,
    cookingTime: 20,
    ingredients: [
      { name: 'Bột mì đa dụng', quantity: 120, note: 'bột mì làm bánh mềm' },
      { name: 'Sữa tươi không đường', quantity: 120, note: 'trộn bột sánh' },
      { name: 'Trứng gà', quantity: 1, note: 'đánh tan' },
      { name: 'Mật ong nguyên chất', quantity: 40, note: 'rưới bề mặt khi ăn' },
      { name: 'Bơ lạt', quantity: 15, note: 'thoa nhẹ chảo' },
    ],
    steps: [
      { stepNumber: 1, instruction: 'Đánh tan trứng gà cùng sữa tươi và một thìa mật ong trong âu.', timerSeconds: 120 },
      { stepNumber: 2, instruction: 'Rây bột mì vào âu sữa trứng, khuấy nhẹ tay cho bột tan đều thành hỗn hợp sánh mịn không vón cục.', timerSeconds: 180 },
      { stepNumber: 3, instruction: 'Làm nóng chảo chống dính với lửa nhỏ nhất, thoa một lớp bơ lạt cực mỏng. Múc 1 muôi bột đổ vào giữa chảo tạo hình tròn.', timerSeconds: 60 },
      { stepNumber: 4, instruction: 'Khi mặt bánh xuất hiện nhiều lỗ bọt khí nhỏ vỡ ra thì lật bánh, nướng thêm 1 phút cho vàng đều rồi gắp ra đĩa, rưới mật ong lên trên.', timerSeconds: 120 },
    ],
    reviews: [
      { userId: 'u-bepmebong-0003', rating: 5, comment: 'Pancake bông xốp mềm mượt, các bé nhà mình mê tít!' },
      { userId: 'user-uuid-1', rating: 5, comment: 'Làm siêu dễ và nhanh, ăn sáng cùng ly cà phê thì không gì bằng.' },
    ],
    cooksnaps: [
      { userId: 'user-uuid-1', imageUrl: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=600', caption: 'Bánh pancake làm sáng Chủ nhật, xốp mềm thơm mùi mật ong.' },
    ],
  },
  {
    id: 'recipe-20-crepe-ngan-lop',
    authorId: 'u-bepmebong-0003',
    categorySlug: 'cac-loai-banh',
    dietarySlugs: [],
    title: 'Bánh crepe ngàn lớp sốt xoài dừa',
    description: 'Bánh crepe nghìn lớp mỏng dính như lụa xếp xen kẽ lớp kem tươi thơm mùi vani béo ngậy, phủ sốt trái cây nhiệt đới ngọt ngào quyến rũ.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1519869325930-281384150729?w=800',
    servings: 6,
    cookingTime: 50,
    ingredients: [
      { name: 'Bột mì đa dụng', quantity: 150, note: 'rây mịn 2 lần' },
      { name: 'Trứng gà', quantity: 3, note: 'đánh tan không tạo bọt' },
      { name: 'Sữa tươi không đường', quantity: 350, note: 'hòa tan cùng bột' },
      { name: 'Bơ lạt', quantity: 30, note: 'đun chảy để nguội' },
      { name: 'Đường trắng', quantity: 50, note: 'trộn bột bánh' },
    ],
    steps: [
      { stepNumber: 1, instruction: 'Trộn đều bột mì, đường, trứng gà và bơ lạt đun chảy, từ từ rót sữa tươi vào khuấy đều rồi lọc qua rây 2 lần cho mịn tuyệt đối.', timerSeconds: 300 },
      { stepNumber: 2, instruction: 'Để bột nghỉ trong ngăn mát tủ lạnh 30 phút để bột nở ổn định kết cấu dai mềm.', timerSeconds: 1800 },
      { stepNumber: 3, instruction: 'Láng một lớp bơ mỏng lên chảo chống dính đáy phẳng, múc 1 muôi bột láng thật mỏng đều khắp mặt chảo, rán chín 1 mặt trong 1 phút rồi khẽ gắp ra đĩa để nguội.', timerSeconds: 600 },
      { stepNumber: 4, instruction: 'Lặp lại thao tác tráng 15-20 lớp bánh crepe mỏng. Xếp từng lớp bánh xen kẽ kem tươi đánh bông, để lạnh 2 tiếng trước khi cắt miếng tam giác thưởng thức.', timerSeconds: 600 },
    ],
    reviews: [
      { userId: 'u-chef-tuan-0001', rating: 5, comment: 'Kỹ thuật tráng bánh crepe rất đỉnh, từng lớp bánh mỏng dính và dai mềm hoàn hảo.' },
      { userId: 'user-uuid-1', rating: 5, comment: 'Bánh đẹp như ngoài tiệm bánh Pháp, ăn mát lạnh béo thơm.' },
    ],
    cooksnaps: [
      { userId: 'u-lanhuong-0005', imageUrl: 'https://images.unsplash.com/photo-1519869325930-281384150729?w=600', caption: 'Món tráng miệng điểm 10 cho các bữa tiệc sinh nhật gia đình!' },
    ],
  },
];

// ==========================================
// HÀM CHÍNH SEED DỮ LIỆU (Main Runner)
// ==========================================
async function main() {
  console.log('🚀 Bắt đầu nạp dữ liệu mẫu (Seed Data) hoàn chỉnh để Demo...');

  // categories
  console.log('1. Nạp danh mục món ăn (Categories)...');
  const categoryMap = new Map<string, number>();
  for (const cat of categories) {
    const saved = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, iconUrl: cat.iconUrl },
      create: cat,
    });
    categoryMap.set(saved.slug, saved.id);
  }
  console.log(`✅ Đã nạp ${categories.length} danh mục.`);

  // dietary regimes
  console.log('2. Nạp chế độ ăn kiêng (Dietary Regimes)...');
  const dietaryMap = new Map<string, number>();
  for (const regime of dietaryRegimes) {
    const saved = await prisma.dietaryRegime.upsert({
      where: { slug: regime.slug },
      update: { name: regime.name, description: regime.description },
      create: regime,
    });
    dietaryMap.set(saved.slug, saved.id);
  }
  console.log(`✅ Đã nạp ${dietaryRegimes.length} chế độ ăn kiêng.`);

  // ingredients
  console.log('3. Nạp từ điển nguyên liệu chuẩn (Ingredients)...');
  const ingredientMap = new Map<string, number>();
  for (const ing of ingredients) {
    const saved = await prisma.ingredient.upsert({
      where: { name: ing.name },
      update: {
        standardUnit: ing.standardUnit,
        imageUrl: ing.imageUrl,
        isAllergenCommon: ing.isAllergenCommon,
      },
      create: ing,
    });
    ingredientMap.set(saved.name, saved.id);
  }
  console.log(`✅ Đã nạp ${ingredients.length} nguyên liệu chuẩn.`);

  // demo users
  console.log('4. Nạp người dùng mẫu & Hồ sơ đầu bếp (Users)...');
  for (const u of demoUsers) {
    await prisma.user.upsert({
      where: { id: u.id },
      update: {
        email: u.email,
        nickname: u.nickname,
        fullName: u.fullName,
        avatarUrl: u.avatarUrl,
        bio: u.bio,
      },
      create: {
        id: u.id,
        firebaseUid: u.firebaseUid,
        email: u.email,
        nickname: u.nickname,
        fullName: u.fullName,
        avatarUrl: u.avatarUrl,
        bio: u.bio,
      },
    });
  }
  console.log(`✅ Đã nạp ${demoUsers.length} tài khoản người dùng demo.`);

  // follow relations
  console.log('5. Thiết lập mạng lưới theo dõi đầu bếp (Follows)...');
  for (const f of followRelations) {
    await prisma.follow.upsert({
      where: {
        followerId_followingId: {
          followerId: f.followerId,
          followingId: f.followingId,
        },
      },
      update: {},
      create: f,
    });
  }
  console.log(`✅ Đã thiết lập ${followRelations.length} quan hệ theo dõi.`);

  // 20 recipes & steps & ingredients & reviews & cooksnaps
  console.log('6. Nạp 20 công thức chuẩn kèm nguyên liệu, các bước nấu, đánh giá sao & Cooksnap...');
  let totalReviewsCount = 0;
  let totalCooksnapsCount = 0;

  for (const r of recipes20) {
    const categoryId = categoryMap.get(r.categorySlug);
    if (!categoryId) {
      console.warn(`Không tìm thấy category: ${r.categorySlug}`);
      continue;
    }

    // Upsert Recipe
    const recipe = await prisma.recipe.upsert({
      where: { id: r.id },
      update: {
        title: r.title,
        description: r.description,
        thumbnailUrl: r.thumbnailUrl,
        servings: r.servings,
        cookingTime: r.cookingTime,
        categoryId,
        authorId: r.authorId,
      },
      create: {
        id: r.id,
        title: r.title,
        description: r.description,
        thumbnailUrl: r.thumbnailUrl,
        servings: r.servings,
        cookingTime: r.cookingTime,
        categoryId,
        authorId: r.authorId,
        averageRating: 0,
      },
    });

    // Recipe Dietary Tags
    for (const slug of r.dietarySlugs) {
      const dietaryId = dietaryMap.get(slug);
      if (dietaryId) {
        await prisma.recipeDietaryTag.upsert({
          where: {
            recipeId_dietaryRegimeId: {
              recipeId: recipe.id,
              dietaryRegimeId: dietaryId,
            },
          },
          update: {},
          create: {
            recipeId: recipe.id,
            dietaryRegimeId: dietaryId,
          },
        });
      }
    }

    // Recipe Ingredients
    for (const ing of r.ingredients) {
      const ingId = ingredientMap.get(ing.name);
      if (ingId) {
        await prisma.recipeIngredient.upsert({
          where: {
            recipeId_ingredientId: {
              recipeId: recipe.id,
              ingredientId: ingId,
            },
          },
          update: {
            quantity: ing.quantity,
            note: ing.note ?? null,
          },
          create: {
            recipeId: recipe.id,
            ingredientId: ingId,
            quantity: ing.quantity,
            note: ing.note ?? null,
          },
        });
      }
    }

    // Recipe Steps
    for (const s of r.steps) {
      await prisma.recipeStep.upsert({
        where: {
          recipeId_stepNumber: {
            recipeId: recipe.id,
            stepNumber: s.stepNumber,
          },
        },
        update: {
          instruction: s.instruction,
          timerSeconds: s.timerSeconds ?? null,
        },
        create: {
          recipeId: recipe.id,
          stepNumber: s.stepNumber,
          instruction: s.instruction,
          timerSeconds: s.timerSeconds ?? null,
        },
      });
    }

    // Reviews & Rating Calculation
    let totalScore = 0;
    for (const rev of r.reviews) {
      await prisma.review.upsert({
        where: {
          recipeId_userId: {
            recipeId: recipe.id,
            userId: rev.userId,
          },
        },
        update: {
          rating: rev.rating,
          comment: rev.comment,
        },
        create: {
          recipeId: recipe.id,
          userId: rev.userId,
          rating: rev.rating,
          comment: rev.comment,
        },
      });
      totalScore += rev.rating;
      totalReviewsCount++;
    }

    const calculatedAvg =
      r.reviews.length > 0 ? Number((totalScore / r.reviews.length).toFixed(2)) : 0;

    await prisma.recipe.update({
      where: { id: recipe.id },
      data: {
        averageRating: calculatedAvg,
        ratingCount: r.reviews.length,
        status: 'PUBLISHED',
      },
    });

    // Cooksnaps
    for (const cs of r.cooksnaps) {
      const existing = await prisma.cooksnap.findFirst({
        where: { recipeId: recipe.id, userId: cs.userId },
      });
      if (!existing) {
        await prisma.cooksnap.create({
          data: {
            recipeId: recipe.id,
            userId: cs.userId,
            imageUrl: cs.imageUrl,
            caption: cs.caption,
          },
        });
      }
      totalCooksnapsCount++;
    }
  }

  console.log(`✅ Đã nạp thành công 20 công thức chuẩn.`);
  console.log(`✅ Đã nạp ${totalReviewsCount} đánh giá và cập nhật avg_rating tự động.`);
  console.log(`✅ Đã nạp ${totalCooksnapsCount} ảnh Cooksnap thành phẩm.`);

  // thiết bị người dùng (user_devices) & thông báo mẫu (notifications)
  console.log('7. Nạp thiết bị người dùng (user_devices) & Thông báo mẫu...');
  await prisma.userDevice.upsert({
    where: { token: 'fcm-token-demo-chef-nhat-device-android-1' },
    update: { userId: 'user-uuid-1', platform: 'android' },
    create: {
      userId: 'user-uuid-1',
      token: 'fcm-token-demo-chef-nhat-device-android-1',
      platform: 'android',
    },
  });

  const demoNotifications = [
    {
      recipientId: 'user-uuid-1',
      actorId: 'u-chef-tuan-0001',
      type: 'NEW_FOLLOWER' as const,
      title: 'Người theo dõi mới',
      body: 'Nguyễn Anh Tuấn vừa bắt đầu theo dõi bạn.',
      data: { followerId: 'u-chef-tuan-0001' },
      isRead: false,
    },
    {
      recipientId: 'user-uuid-1',
      actorId: 'u-maianh-eatclean-0002',
      type: 'NEW_REVIEW' as const,
      title: 'Đánh giá mới cho công thức của bạn',
      body: 'Lê Mai Anh đã đánh giá 5⭐ cho món ăn của bạn.',
      data: { recipeId: 'recipe-01-pho-bo-tai-lan' },
      isRead: false,
    },
    {
      recipientId: 'user-uuid-1',
      actorId: 'u-lanhuong-0005',
      type: 'NEW_COOKSNAP' as const,
      title: 'Có ảnh thành phẩm Cooksnap mới!',
      body: 'Vũ Lan Hương vừa khoe ảnh nấu thành công món ăn của bạn.',
      data: { recipeId: 'recipe-02-bo-sot-tieu-den' },
      isRead: true,
    },
  ];

  for (const notif of demoNotifications) {
    const existing = await prisma.notification.findFirst({
      where: {
        recipientId: notif.recipientId,
        actorId: notif.actorId,
        type: notif.type,
      },
    });
    if (!existing) {
      await prisma.notification.create({ data: notif });
    }
  }
  console.log(`✅ Đã nạp ${demoNotifications.length} thông báo mẫu.`);

  console.log('🎉 Toàn bộ dữ liệu mẫu (Seed Data) chuẩn mực cho Demo đã được hoàn tất thành công!');
}

main()
  .catch((e) => {
    console.error('Lỗi trong quá trình nạp dữ liệu:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
