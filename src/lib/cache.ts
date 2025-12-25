import Database from "better-sqlite3";
import path from "path";

// Инициализация базы данных в корне проекта
const db = new Database(path.join(process.cwd(), "cache.db"));

// Создаем таблицу для транзакций, если она не существует
db.exec(`
    CREATE TABLE IF NOT EXISTS transactions (
        signature TEXT PRIMARY KEY,
        data TEXT,
        created_at INTEGER
    )
`);

export function getCachedTransaction(signature: string) {
    try {
        const row = db.prepare("SELECT data FROM transactions WHERE signature = ?").get(signature) as { data: string } | undefined;
        return row ? JSON.parse(row.data) : null;
    } catch (error) {
        console.error("Cache read error:", error);
        return null;
    }
}

export function saveTransactionToCache(signature: string, data: any) {
    try {
        const stmt = db.prepare("INSERT OR REPLACE INTO transactions (signature, data, created_at) VALUES (?, ?, ?)");
        stmt.run(signature, JSON.stringify(data), Date.now());
    } catch (error) {
        console.error("Cache write error:", error);
    }
}
