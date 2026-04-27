import { z } from "zod";

export const reportSchema = z.object({
  salesGroceries: z.coerce.number().int("Nominal harus angka bulat").min(0, "Sales tidak boleh negatif").default(0),
  salesLpg: z.coerce.number().int("Nominal harus angka bulat").min(0, "Sales tidak boleh negatif").default(0),
  salesPelumas: z.coerce.number().int("Nominal harus angka bulat").min(0, "Sales tidak boleh negatif").default(0),
  
  fulfillmentPb: z.coerce.number().int("Fulfillment harus angka").min(0).max(100, "Maksimal 100%").default(0),
  avgFulfillmentDc: z.coerce.number().int("Fulfillment harus angka").min(0).max(100, "Maksimal 100%").default(0),
  
  itemOos: z.array(z.object({
    name: z.string()
      .min(1, "Nama item wajib diisi jika ada barisnya")
      .regex(/^[a-zA-Z0-9\s]+$/, "Item hanya boleh huruf dan angka")
  })).default([]),
  
  stockLpg3kg: z.coerce.number().int("Stock harus angka bulat").min(0).default(0),
  stockLpg5kg: z.coerce.number().int("Stock harus angka bulat").min(0).default(0),
  stockLpg12kg: z.coerce.number().int("Stock harus angka bulat").min(0).default(0),
  
  waste: z.coerce.number().int("Nominal harus angka bulat").min(0).default(0),
  losses: z.coerce.number().int("Nominal harus angka bulat").min(0).default(0),
  
  needSupport: z.string().optional(),
});

export type ReportFormValues = z.infer<typeof reportSchema>;
