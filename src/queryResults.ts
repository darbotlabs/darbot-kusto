export interface QueryColumn {
  name: string | null;
  type: string | null;
}

export interface QueryResultRow {
  [key: string]: any;
}

export interface QueryResult<T = QueryResultRow> {
  columns: QueryColumn[];
  rows: T[];
}
