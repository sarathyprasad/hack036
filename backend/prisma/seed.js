import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.certificate.deleteMany({});
  await prisma.inspection.deleteMany({});
  await prisma.instrument.deleteMany({});
  await prisma.user.deleteMany({});

  const trader1 = await prisma.user.create({
    data: {
      name: 'Apex Grain Millers',
      email: 'trader1@apex.com',
      role: 'TRADER'
    }
  });

  const trader2 = await prisma.user.create({
    data: {
      name: 'City Petrol Pump',
      email: 'trader2@citypetrol.com',
      role: 'TRADER'
    }
  });

  const trader3 = await prisma.user.create({
    data: {
      name: 'Metro Retail Supermarket',
      email: 'trader3@metroretail.com',
      role: 'TRADER'
    }
  });

  const lmo1 = await prisma.user.create({
    data: {
      name: 'R. K. Sharma (Senior LMO)',
      email: 'lmo1@metrology.gov.in',
      role: 'LMO'
    }
  });

  const lmo2 = await prisma.user.create({
    data: {
      name: 'P. S. Verma (Field LMO)',
      email: 'lmo2@metrology.gov.in',
      role: 'LMO'
    }
  });

  const inst1 = await prisma.instrument.create({
    data: {
      type: 'Electronic Weighbridge (Class III)',
      capacity: 50000,
      serialNumber: 'WB-8842-IND',
      location: 'Plot 45, MIDC Industrial Area, Nagpur',
      traderId: trader1.id
    }
  });

  const inst2 = await prisma.instrument.create({
    data: {
      type: 'Counter Scale (Class III)',
      capacity: 50,
      serialNumber: 'CS-1092-IND',
      location: 'Shop 12, Main Market, Nagpur',
      traderId: trader1.id
    }
  });

  const inst3 = await prisma.instrument.create({
    data: {
      type: 'Fuel Dispenser Flow Meter (Class II)',
      capacity: 100,
      serialNumber: 'FD-5541-IND',
      location: 'Station Road, City Fuel Station, Pune',
      traderId: trader2.id
    }
  });

  const inst4 = await prisma.instrument.create({
    data: {
      type: 'Precision Lab Balance (Class II)',
      capacity: 5,
      serialNumber: 'PB-2201-IND',
      location: 'Quality Assurance Lab, Pune',
      traderId: trader2.id
    }
  });

  const inst5 = await prisma.instrument.create({
    data: {
      type: 'Platform Scale (Class III)',
      capacity: 500,
      serialNumber: 'PS-3304-IND',
      location: 'Warehouse 4, Metro Central Depot, Mumbai',
      traderId: trader3.id
    }
  });

  const insp1 = await prisma.inspection.create({
    data: {
      lmoId: lmo1.id,
      instrumentId: inst1.id,
      mpeReading: 0.02,
      status: 'PASSED',
      photoUrl: '/storage/uploads/insp_001.jpg',
      geotag: '18.5204° N, 73.8567° E'
    }
  });

  const insp2 = await prisma.inspection.create({
    data: {
      lmoId: lmo1.id,
      instrumentId: inst3.id,
      mpeReading: 0.01,
      status: 'PASSED',
      photoUrl: '/storage/uploads/insp_002.jpg',
      geotag: '18.5210° N, 73.8570° E'
    }
  });

  const insp3 = await prisma.inspection.create({
    data: {
      lmoId: lmo2.id,
      instrumentId: inst5.id,
      mpeReading: 0.03,
      status: 'PASSED',
      photoUrl: '/storage/uploads/insp_003.jpg',
      geotag: '19.0760° N, 72.8777° E'
    }
  });

  const now = new Date();
  const nextYear = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());

  await prisma.certificate.create({
    data: {
      inspectionId: insp1.id,
      qrHash: 'hmac_sha256_qr_hash_001_apex_wb8842',
      issueDate: now,
      expiryDate: nextYear,
      certificatePdfUrl: '/storage/reports/cert_001.pdf'
    }
  });

  await prisma.certificate.create({
    data: {
      inspectionId: insp2.id,
      qrHash: 'hmac_sha256_qr_hash_002_city_fd5541',
      issueDate: now,
      expiryDate: nextYear,
      certificatePdfUrl: '/storage/reports/cert_002.pdf'
    }
  });

  await prisma.certificate.create({
    data: {
      inspectionId: insp3.id,
      qrHash: 'hmac_sha256_qr_hash_003_metro_ps3304',
      issueDate: now,
      expiryDate: nextYear,
      certificatePdfUrl: '/storage/reports/cert_003.pdf'
    }
  });

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
