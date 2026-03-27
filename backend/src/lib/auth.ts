import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
  trustedOrigins: ["http://localhost:5173"],
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          await prisma.document.create({
            data: {
              title: "Getting Started",
              content: {
                type: "doc",
                content: [
                  {
                    type: "heading",
                    attrs: { level: 1 },
                    content: [{ type: "text", text: "Welcome to your new notes!" }],
                  },
                  {
                    type: "paragraph",
                    content: [
                      {
                        type: "text",
                        text: "This is a default document to help you get started. Feel free to edit or delete it.",
                      },
                    ],
                  },
                ],
              },
              ownerId: user.id,
            },
          });
        },
      },
    },
  },
});
