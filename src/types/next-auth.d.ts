import NextAuth from "next-auth";

declare module "next-auth" {
  /**
   * Extender la interfaz Session para incluir propiedades personalizadas
   */
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: string;
    };
  }

  /**
   * Extender la interfaz User para incluir propiedades personalizadas
   */
  interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string;
    roleId?: string | null;
  }
}

declare module "next-auth/jwt" {
  /**
   * Extender la interfaz JWT para incluir propiedades personalizadas
   */
  interface JWT {
    id?: string;
    role?: string;
  }
}