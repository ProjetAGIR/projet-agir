export interface DBQuery {
    limit: number;
    offset: number;
}

export const DEFAULT_DB_QUERY: DBQuery = {
    limit: 10,
    offset: 0
}