import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

/**
 * GameState type definition
 * Mirrors the state structure from progression.ts
 */
interface GameState {
  studentId: string;
  episodeId: string;
  completedMissions: string[];
  currentMissionIndex: number;
  points: number;
  badges: string[];
  lastModified: number;
}

/**
 * DatabaseService
 *
 * Persistent storage for game progression using SQLite
 * - Replaces in-memory Map storage
 * - Provides ACID compliance
 * - Supports audit logging
 * - File-based, no external dependencies
 */
class DatabaseService {
  private db: Database.Database;
  private dbPath: string;

  constructor() {
    // Create data directory if it doesn't exist
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    // Initialize database connection
    this.dbPath = path.join(dataDir, 'progression.db');
    this.db = new Database(this.dbPath);

    // Enable foreign keys and other optimizations
    this.db.pragma('foreign_keys = ON');
    this.db.pragma('journal_mode = WAL');  // Write-Ahead Logging for better concurrency

    // Initialize schema
    this.initializeSchema();

    console.log(`✅ Database initialized at: ${this.dbPath}`);
  }

  /**
   * Initialize database schema
   * Creates tables if they don't exist
   */
  private initializeSchema(): void {
    try {
      // Create progression table
      this.db.exec(`
        CREATE TABLE IF NOT EXISTS progression (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          student_id TEXT UNIQUE NOT NULL,
          episode_id TEXT NOT NULL DEFAULT 'ep_1',
          completed_missions TEXT NOT NULL DEFAULT '[]',
          current_mission_index INTEGER NOT NULL DEFAULT 0,
          points INTEGER NOT NULL DEFAULT 0,
          badges TEXT NOT NULL DEFAULT '[]',
          last_modified INTEGER NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Create audit log table for fraud detection
      this.db.exec(`
        CREATE TABLE IF NOT EXISTS audit_logs (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          student_id TEXT NOT NULL,
          event_type TEXT NOT NULL,
          details TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Create index on student_id for faster lookups
      this.db.exec(`
        CREATE INDEX IF NOT EXISTS idx_progression_student_id
        ON progression(student_id);
      `);

      console.log('✅ Database schema initialized');
    } catch (error) {
      console.error('❌ Failed to initialize schema:', error);
      throw error;
    }
  }

  /**
   * Save or update game progression state
   * Uses UPSERT pattern for atomicity
   */
  async saveProgressionToDatabase(state: GameState): Promise<GameState> {
    try {
      const stmt = this.db.prepare(`
        INSERT INTO progression (
          student_id, episode_id, completed_missions,
          current_mission_index, points, badges, last_modified
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(student_id) DO UPDATE SET
          episode_id = ?,
          completed_missions = ?,
          current_mission_index = ?,
          points = ?,
          badges = ?,
          last_modified = ?,
          updated_at = CURRENT_TIMESTAMP
      `);

      const result = stmt.run(
        state.studentId,
        state.episodeId,
        JSON.stringify(state.completedMissions),
        state.currentMissionIndex,
        state.points,
        JSON.stringify(state.badges),
        state.lastModified,
        // Update values (duplicate parameters for ON CONFLICT clause)
        state.episodeId,
        JSON.stringify(state.completedMissions),
        state.currentMissionIndex,
        state.points,
        JSON.stringify(state.badges),
        state.lastModified
      );

      console.log(`✅ Saved progression for student ${state.studentId}`);
      return state;
    } catch (error) {
      console.error('❌ Failed to save progression:', error);
      throw error;
    }
  }

  /**
   * Load game progression state by student ID
   * Returns null if student not found
   */
  async loadProgressionFromDatabase(studentId: string): Promise<GameState | null> {
    try {
      const stmt = this.db.prepare(`
        SELECT * FROM progression WHERE student_id = ?
      `);

      const row = stmt.get(studentId) as any;

      if (!row) {
        console.log(`ℹ️ No progression found for student ${studentId}`);
        return null;
      }

      // Convert database row to GameState
      const state: GameState = {
        studentId: row.student_id,
        episodeId: row.episode_id,
        completedMissions: JSON.parse(row.completed_missions),
        currentMissionIndex: row.current_mission_index,
        points: row.points,
        badges: JSON.parse(row.badges),
        lastModified: row.last_modified,
      };

      console.log(`✅ Loaded progression for student ${studentId}`);
      return state;
    } catch (error) {
      console.error(`❌ Failed to load progression for ${studentId}:`, error);
      throw error;
    }
  }

  /**
   * Delete progression state
   * Used for reset/clear operations
   */
  async clearProgressionFromDatabase(studentId: string): Promise<void> {
    try {
      const stmt = this.db.prepare(`
        DELETE FROM progression WHERE student_id = ?
      `);

      stmt.run(studentId);
      console.log(`✅ Cleared progression for student ${studentId}`);
    } catch (error) {
      console.error(`❌ Failed to clear progression for ${studentId}:`, error);
      throw error;
    }
  }

  /**
   * Record audit log entry
   * Used for fraud detection and compliance
   */
  async recordAuditLog(
    studentId: string,
    eventType: string,
    details: Record<string, unknown>
  ): Promise<void> {
    try {
      const stmt = this.db.prepare(`
        INSERT INTO audit_logs (student_id, event_type, details)
        VALUES (?, ?, ?)
      `);

      stmt.run(studentId, eventType, JSON.stringify(details));
      console.log(`📊 [Audit] ${studentId}: ${eventType}`);
    } catch (error) {
      console.error('❌ Failed to record audit log:', error);
      throw error;
    }
  }

  /**
   * Health check - verify database connection
   */
  health(): boolean {
    try {
      this.db.exec('SELECT 1');
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get database statistics
   */
  getStats(): { tables: number; progressionRecords: number; auditRecords: number } {
    try {
      const progressionCount = (
        this.db.prepare('SELECT COUNT(*) as count FROM progression').get() as any
      ).count;

      const auditCount = (
        this.db.prepare('SELECT COUNT(*) as count FROM audit_logs').get() as any
      ).count;

      return {
        tables: 2,
        progressionRecords: progressionCount,
        auditRecords: auditCount,
      };
    } catch (error) {
      console.error('Failed to get stats:', error);
      return { tables: 0, progressionRecords: 0, auditRecords: 0 };
    }
  }

  /**
   * Get top players sorted by points
   */
  async getTopPlayers(limit: number = 10): Promise<Array<{
    rank: number;
    studentId: string;
    points: number;
    badges: number;
    missionsCompleted: number;
  }>> {
    try {
      // 1. Get stats from DB
      const stmt = this.db.prepare(`
        SELECT student_id, points, badges, completed_missions
        FROM progression
        ORDER BY points DESC, updated_at DESC
        LIMIT ?
      `);

      const rows = stmt.all(limit) as any[];

      // 2. Map to return format
      return rows.map((row, index) => ({
        rank: index + 1,
        studentId: row.student_id,
        // Mock name for privacy, or could be stored in a users table
        studentName: `Student ${row.student_id.substring(0, 4)}`,
        points: row.points,
        badges: JSON.parse(row.badges).length,
        missionsCompleted: JSON.parse(row.completed_missions).length
      }));
    } catch (error) {
      console.error('❌ Failed to get leaderboard:', error);
      return [];
    }
  }

  /**
   * Graceful shutdown - close database connection
   */
  close(): void {
    try {
      this.db.close();
      console.log('✅ Database connection closed');
    } catch (error) {
      console.error('❌ Error closing database:', error);
    }
  }
}

// Export singleton instance
export const databaseService = new DatabaseService();

// Export type for use in other files
export type { GameState };
