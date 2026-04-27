import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin, username } from "better-auth/plugins";
import { db } from "@/db/index";
import * as schema from "@/db/schema";

export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "pg",
        schema: {
            user: schema.users,
            session: schema.session,
            account: schema.account,
            verification: schema.verification,
        }
    }),
    emailAndPassword: {
        enabled: true, // Biarkan true agar mekanisme password hash aktif, meski login pakai username
    },
    session: {
        expiresIn: 60 * 60 * 24 * 7, // Sesion expires dalam 7 hari
        updateAge: 60 * 60 * 24, // Refresh setiap hari
        cookieCache: {
            enabled: true,
            maxAge: 5 * 60, // Stateless cache check (performa cepat & lebih kebal jika konek hilang)
        }
    },
    advanced: {
        // Keamanan Anti-Maling Cookies! Set jadi `true` jika proses build produksi.
        useSecureCookies: process.env.NODE_ENV === "production",
        cookiePrefix: "prtl",
    },
    plugins: [
        username(), // Menambahkan fitur login/register dengan Username
        admin(),    // Otomatis men-handle logic banned/roles (admin vs user/kasir)
    ],
    user: {
        additionalFields: {
            storeId: {
                type: "string",
                required: false,
            }
        }
    }
});
