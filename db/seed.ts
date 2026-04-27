import "dotenv/config";
import { db } from "./index";
import { store, users, account } from "./schema";
import { eq } from "drizzle-orm";
import { hashPassword } from "better-auth/crypto";

const seedData = async () => {
    console.log("Memulai proses seeding data Stores...");

    // 1. DATA STORES
    const storeDatas = [
        {
            id: "store_bsd03",
            name: "Bright BSD 03",
            type: "Bright Store", // Company Owned Company Operated
            location: "Tangerang Selatan, BSD City",
            operationalYear: 2013,
            seName: "Pipin Suhandi",
            saCount: 4,
            operationalHours: "24 Jam",
            priceCluster: "Public",
            targetSpd: 7500000,
        },
        {
            id: "store_bintaro01",
            name: "Bright Bintaro 01",
            type: "Bright Store",
            location: "Bintaro Sektor 7",
            operationalYear: 2015,
            seName: "Andi Saputra",
            saCount: 3,
            operationalHours: "24 Jam",
            priceCluster: "Public",
            targetSpd: 6500000,
        },
        {
            id: "store_fatmawati02",
            name: "Bright Fatmawati 02",
            type: "DODO", // Dealer Owned Dealer Operated
            location: "Jakarta Selatan, Jl. Fatmawati",
            operationalYear: 2018,
            seName: "Budi Santoso",
            saCount: 5,
            operationalHours: "06:00 - 22:00",
            priceCluster: "Premium",
            targetSpd: 8500000,
        }
    ];

    try {
        for (const s of storeDatas) {
            // Cek apakah data sudah ada
            const existing = await db.query.store.findFirst({
                where: eq(store.id, s.id)
            });

            if (!existing) {
                await db.insert(store).values(s);
                console.log(`✅ Store ${s.name} berhasil ditambahkan.`);
            } else {
                console.log(`ℹ️ Store ${s.name} sudah ada.`);
            }
        }

        console.log("\nMemulai proses seeding data Users...");

        // 2. DATA USERS & AKUN (Untuk Login)
        // Note: Password di bawah idealnya di-hash oleh bcrypt sesuai implementasi better-auth.
        const userDatas = [
            {
                id: "usr_001",
                name: "Kasir BSD",
                email: "kasir.bsd@bright.com",
                role: "kasir",
                storeId: "store_bsd03"
            },
            {
                id: "usr_002",
                name: "Kasir Bintaro",
                email: "kasir.bintaro@bright.com",
                role: "kasir",
                storeId: "store_bintaro01"
            },
            {
                id: "usr_003",
                name: "Admin Fatmawati",
                email: "admin.fatmawati@bright.com",
                role: "admin",
                storeId: "store_fatmawati02"
            }
        ];

        const dateNow = new Date();
        const seededPassword = "password123";

        for (const u of userDatas) {
            const existingUser = await db.query.users.findFirst({
                where: eq(users.id, u.id)
            });

            if(!existingUser) {
                await db.insert(users).values({
                    id: u.id,
                    name: u.name,
                    email: u.email,
                    emailVerified: true,
                    role: u.role,
                    storeId: u.storeId,
                    createdAt: dateNow,
                    updatedAt: dateNow
                });

                console.log(`✅ User ${u.name} berhasil ditambahkan.`);
            } else {
                console.log(`ℹ️ User ${u.name} sudah ada.`);
            }

            // Better Auth memakai format hash internal; jangan hash manual pakai bcryptjs.
            const hash = await hashPassword(seededPassword);
            const existingAccount = await db.query.account.findFirst({
                where: eq(account.userId, u.id)
            });

            if (existingAccount) {
                await db.update(account)
                    .set({
                        accountId: u.email,
                        providerId: "credential",
                        password: hash,
                        updatedAt: dateNow
                    })
                    .where(eq(account.id, existingAccount.id));
                console.log(`🔐 Password akun ${u.email} diperbarui (Password: ${seededPassword}).`);
            } else {
                await db.insert(account).values({
                    id: `acc_${u.id}`,
                    accountId: u.email,
                    providerId: "credential",
                    userId: u.id,
                    password: hash,
                    createdAt: dateNow,
                    updatedAt: dateNow
                });
                console.log(`🔐 Account ${u.email} berhasil ditambahkan (Password: ${seededPassword}).`);
            }
        }
        console.log("\n✅ Semua proses Seeding selesai!");

    } catch (error) {
        console.error("❌ Terjadi kesalahan saat seeding:", error);
    } 
};

seedData();
