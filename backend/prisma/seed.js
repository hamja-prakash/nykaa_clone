const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Categories
  const categories = await Promise.all([
    prisma.category.upsert({ where: { slug: 'makeup' }, update: {}, create: { name: 'Makeup', slug: 'makeup', description: 'Face, eye, and lip makeup', image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400' } }),
    prisma.category.upsert({ where: { slug: 'skincare' }, update: {}, create: { name: 'Skincare', slug: 'skincare', description: 'Cleansers, moisturizers, serums', image: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400' } }),
    prisma.category.upsert({ where: { slug: 'haircare' }, update: {}, create: { name: 'Haircare', slug: 'haircare', description: 'Shampoos, conditioners, treatments', image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400' } }),
    prisma.category.upsert({ where: { slug: 'fragrance' }, update: {}, create: { name: 'Fragrance', slug: 'fragrance', description: 'Perfumes and body mists', image: 'https://images.unsplash.com/photo-1541643600914-78b084683702?w=400' } }),
    prisma.category.upsert({ where: { slug: 'wellness' }, update: {}, create: { name: 'Wellness', slug: 'wellness', description: 'Health and wellness products', image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=400' } }),
    prisma.category.upsert({ where: { slug: 'bath-body' }, update: {}, create: { name: 'Bath & Body', slug: 'bath-body', description: 'Soaps, scrubs, body lotions', image: 'https://images.unsplash.com/photo-1570194065650-d99fb4bedf0a?w=400' } }),
  ]);

  // Brands
  const brands = await Promise.all([
    prisma.brand.upsert({ where: { slug: 'lakme' }, update: {}, create: { name: 'Lakme', slug: 'lakme', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Lakme_logo.svg/200px-Lakme_logo.svg.png' } }),
    prisma.brand.upsert({ where: { slug: 'loreal' }, update: {}, create: { name: "L'Oreal", slug: 'loreal', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/L%27Or%C3%A9al_logo.svg/200px-L%27Or%C3%A9al_logo.svg.png' } }),
    prisma.brand.upsert({ where: { slug: 'maybeline' }, update: {}, create: { name: 'Maybelline', slug: 'maybeline', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fb/Maybelline_logo.svg/200px-Maybelline_logo.svg.png' } }),
    prisma.brand.upsert({ where: { slug: 'glamcart-cosmetics' }, update: {}, create: { name: 'GlamCart Cosmetics', slug: 'glamcart-cosmetics', logo: '' } }),
    prisma.brand.upsert({ where: { slug: 'mac' }, update: {}, create: { name: 'MAC', slug: 'mac', logo: '' } }),
    prisma.brand.upsert({ where: { slug: 'forest-essentials' }, update: {}, create: { name: 'Forest Essentials', slug: 'forest-essentials', logo: '' } }),
    prisma.brand.upsert({ where: { slug: 'biotique' }, update: {}, create: { name: 'Biotique', slug: 'biotique', logo: '' } }),
    prisma.brand.upsert({ where: { slug: 'dove' }, update: {}, create: { name: 'Dove', slug: 'dove', logo: '' } }),
  ]);

  const [makeup, skincare, haircare, fragrance, wellness, bathBody] = categories;
  const [lakme, loreal, maybelline, glamcartCosmetics, mac, forestEssentials, biotique, dove] = brands;

  // Products
  const products = [
    {
      name: 'Lakme Absolute Skin Natural Mousse Foundation',
      slug: 'lakme-absolute-skin-natural-mousse-foundation',
      description: 'Lightweight mousse foundation for a natural finish. Provides full coverage with SPF 25 protection. Available in 10 shades.',
      price: 695,
      mrp: 799,
      discount: 13,
      images: ['https://images.unsplash.com/photo-1631730486572-226d1f595058?w=400', 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400'],
      stock: 150,
      sku: 'LAK-FND-001',
      rating: 4.3,
      reviewCount: 1247,
      categoryId: makeup.id,
      brandId: lakme.id,
      tags: 'foundation,face,coverage,spf',
      isFeatured: true,
      isBestSeller: true,
    },
    {
      name: "L'Oreal Paris Revitalift Crystal Micro-Essence",
      slug: 'loreal-revitalift-crystal-micro-essence',
      description: 'Light as water micro-essence with salicylic acid to remove dead skin cells and reveal crystal clear skin.',
      price: 899,
      mrp: 1199,
      discount: 25,
      images: ['https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400'],
      stock: 200,
      sku: 'LOR-SKN-001',
      rating: 4.5,
      reviewCount: 892,
      categoryId: skincare.id,
      brandId: loreal.id,
      tags: 'serum,essence,salicylic acid,brightening',
      isFeatured: true,
    },
    {
      name: 'Maybelline Fit Me Matte+Poreless Foundation',
      slug: 'maybelline-fit-me-matte-poreless-foundation',
      description: 'Naturally matte finish that minimizes pores. Controls shine for 12 hours. 40 shades for every skin tone.',
      price: 415,
      mrp: 525,
      discount: 21,
      images: ['https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400'],
      stock: 300,
      sku: 'MAY-FND-001',
      rating: 4.2,
      reviewCount: 2156,
      categoryId: makeup.id,
      brandId: maybelline.id,
      tags: 'foundation,matte,pore minimizing',
      isBestSeller: true,
    },
    {
      name: 'GlamCart Cosmetics Wanderlust Eyeshadow Palette',
      slug: 'glamcart-wanderlust-eyeshadow-palette',
      description: '9-shade eyeshadow palette with matte, shimmer and glitter finishes. Long-lasting pigmented formula.',
      price: 649,
      mrp: 799,
      discount: 19,
      images: ['https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=400'],
      stock: 120,
      sku: 'NYK-EYE-001',
      rating: 4.4,
      reviewCount: 567,
      categoryId: makeup.id,
      brandId: glamcartCosmetics.id,
      tags: 'eyeshadow,palette,shimmer,matte',
      isFeatured: true,
    },
    {
      name: 'Forest Essentials Soundarya Radiance Cream',
      slug: 'forest-essentials-soundarya-radiance-cream',
      description: 'Luxurious skin brightening cream with 24-karat gold and SPF 25. Ayurvedic formula for radiant skin.',
      price: 3500,
      mrp: 3500,
      discount: 0,
      images: ['https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=400'],
      stock: 45,
      sku: 'FE-SKN-001',
      rating: 4.7,
      reviewCount: 234,
      categoryId: skincare.id,
      brandId: forestEssentials.id,
      tags: 'luxury,ayurvedic,brightening,gold',
      isFeatured: true,
    },
    {
      name: 'Biotique Bio Honey Gel Moisturizer',
      slug: 'biotique-bio-honey-gel-moisturizer',
      description: 'Refreshing honey gel moisturizer for oily to combination skin. Contains wild honey, dandelion and berberry extracts.',
      price: 199,
      mrp: 249,
      discount: 20,
      images: ['https://images.unsplash.com/photo-1570194065650-d99fb4bedf0a?w=400'],
      stock: 400,
      sku: 'BIO-SKN-001',
      rating: 4.1,
      reviewCount: 1893,
      categoryId: skincare.id,
      brandId: biotique.id,
      tags: 'moisturizer,gel,oily skin,honey',
      isBestSeller: true,
    },
    {
      name: "L'Oreal Paris Elvive Dream Lengths Shampoo",
      slug: 'loreal-elvive-dream-lengths-shampoo',
      description: 'Nourishing shampoo for long, damaged hair. With castor oil and vitamins B3 & B5 for strong, healthy growth.',
      price: 349,
      mrp: 399,
      discount: 13,
      images: ['https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=400'],
      stock: 250,
      sku: 'LOR-HAIR-001',
      rating: 4.3,
      reviewCount: 678,
      categoryId: haircare.id,
      brandId: loreal.id,
      tags: 'shampoo,long hair,castor oil,strengthening',
    },
    {
      name: 'Dove Deeply Nourishing Body Wash',
      slug: 'dove-deeply-nourishing-body-wash',
      description: 'Gentle body wash with 1/4 moisturizing cream. Leaves skin feeling soft and smooth after every shower.',
      price: 185,
      mrp: 225,
      discount: 18,
      images: ['https://images.unsplash.com/photo-1571781418606-70265b9cce90?w=400'],
      stock: 500,
      sku: 'DOVE-BB-001',
      rating: 4.5,
      reviewCount: 3421,
      categoryId: bathBody.id,
      brandId: dove.id,
      tags: 'body wash,moisturizing,gentle,dove',
      isBestSeller: true,
    },
    {
      name: 'MAC Ruby Woo Lipstick',
      slug: 'mac-ruby-woo-lipstick',
      description: 'Iconic matte red lipstick. Retro matte formula for vivid, true-blue red color that lasts all day.',
      price: 1800,
      mrp: 1800,
      discount: 0,
      images: ['https://images.unsplash.com/photo-1586495777744-4e6232bf6c36?w=400'],
      stock: 80,
      sku: 'MAC-LIP-001',
      rating: 4.8,
      reviewCount: 4567,
      categoryId: makeup.id,
      brandId: mac.id,
      tags: 'lipstick,red,matte,iconic,mac',
      isFeatured: true,
      isBestSeller: true,
    },
    {
      name: 'Lakme 9 to 5 Weightless Mousse Lip & Cheek Color',
      slug: 'lakme-9-to-5-weightless-mousse-lip-cheek',
      description: 'Ultra lightweight mousse formula for lips and cheeks. Natural look, featherlight feel. 12-hour wear.',
      price: 395,
      mrp: 449,
      discount: 12,
      images: ['https://images.unsplash.com/photo-1583241475880-083f84372725?w=400'],
      stock: 180,
      sku: 'LAK-LIP-001',
      rating: 4.1,
      reviewCount: 892,
      categoryId: makeup.id,
      brandId: lakme.id,
      tags: 'lip color,blush,mousse,natural',
    },
    {
      name: 'Maybelline Colossal Kajal',
      slug: 'maybelline-colossal-kajal',
      description: 'Intense black kajal for bold, long-lasting eye looks. Waterproof formula that lasts up to 24 hours.',
      price: 149,
      mrp: 199,
      discount: 25,
      images: ['https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=400'],
      stock: 600,
      sku: 'MAY-EYE-001',
      rating: 4.6,
      reviewCount: 8923,
      categoryId: makeup.id,
      brandId: maybelline.id,
      tags: 'kajal,eye,waterproof,black',
      isBestSeller: true,
    },
    {
      name: 'Biotique Morning Nectar Moisturizer SPF 30',
      slug: 'biotique-morning-nectar-moisturizer-spf30',
      description: 'Daily moisturizer with SPF 30 for flawless skin. Enriched with pure honey, wheat germ and berberry extracts.',
      price: 179,
      mrp: 225,
      discount: 20,
      images: ['https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400'],
      stock: 350,
      sku: 'BIO-SKN-002',
      rating: 4.0,
      reviewCount: 2134,
      categoryId: skincare.id,
      brandId: biotique.id,
      tags: 'moisturizer,spf,daily,natural',
    },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {},
      create: product,
    });
  }

  // Demo user
  const hashedPassword = await bcrypt.hash('password123', 10);
  await prisma.user.upsert({
    where: { email: 'demo@glamcart.com' },
    update: {},
    create: {
      email: 'demo@glamcart.com',
      password: hashedPassword,
      name: 'Demo User',
      phone: '9876543210',
    },
  });

  // Coupon
  await prisma.coupon.upsert({
    where: { code: 'GLAMCART10' },
    update: {},
    create: {
      code: 'GLAMCART10',
      type: 'PERCENT',
      value: 10,
      minOrder: 500,
      maxDiscount: 200,
      usageLimit: 100,
      isActive: true,
    },
  });

  console.log('Database seeded successfully!');
  console.log('Demo login: demo@glamcart.com / password123');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
