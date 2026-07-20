import { z } from "zod";
import { COOKIE_NAME } from "../shared/const.js";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { searchParks, nearbyParks, parkDetails, parksByIds } from "./googlePlaces";

const parkCategorySchema = z.enum(["walk", "inclusive", "slide", "pet", "bike"]);

export const appRouter = router({
  // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // 公園資料:即時代理 Google Places API(金鑰只在伺服器端)
  parks: router({
    search: publicProcedure
      .input(
        z.object({
          text: z.string().optional(),
          city: z.string().optional(),
          categories: z.array(parkCategorySchema).optional(),
          latitude: z.number().optional(),
          longitude: z.number().optional(),
        })
      )
      .query(({ input }) => searchParks(input)),

    nearby: publicProcedure
      .input(z.object({ latitude: z.number(), longitude: z.number() }))
      .query(({ input }) => nearbyParks(input.latitude, input.longitude)),

    details: publicProcedure
      .input(z.object({ id: z.string().min(1) }))
      .query(({ input }) => parkDetails(input.id)),

    byIds: publicProcedure
      .input(z.object({ ids: z.array(z.string()).max(50) }))
      .query(({ input }) => (input.ids.length === 0 ? [] : parksByIds(input.ids))),
  }),
});

export type AppRouter = typeof appRouter;
