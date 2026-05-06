declare global {
  interface CustomJwtSessionClaims {
    metadata: {
      role?: string;
    };
  }
}

export {};
