declare module 'better-sqlite3' {
  interface Database {
    prepare(sql: string): any;
    exec(sql: string): any;
    close(): void;
  }
  
  class Database {
    constructor(filename: string);
  }
  
  export = Database;
}
