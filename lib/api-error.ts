export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly body: unknown,
  ) {
    super(`Requete API en echec (${status})`);
    this.name = "ApiError";
  }
}
