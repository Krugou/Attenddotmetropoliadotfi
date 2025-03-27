import {ResultSetHeader, RowDataPacket} from 'mysql2';
import practicum from '../models/practicummodels.js';
import work_log_entries, {
  PracticumEntry,
} from '../models/work_log_entrymodel.js';
import work_log_practicum_instructors from '../models/work_log_practicum_instructormodel.js';
import logger from '../utils/logger.js';

interface Instructor {
  email: string;
}

export interface PracticumCreate {
  name: string;
  startDate: Date | string;
  endDate: Date | string;
  description: string;
  requiredHours: number;
  instructors?: Instructor[];
}

export interface PracticumUpdate {
  name?: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  required_hours?: number;
  instructors?: string[];
}

export interface PracticumData extends RowDataPacket {
  work_log_practicum_id: number;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  created_at?: string;
  required_hours: number;
  instructor_name?: string;
  userid?: number;
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
}

export interface PracticumDetails {
  practicum?: PracticumData;
  entries?: PracticumEntry[];
}

const practicumController = {
  async createPracticum(practicumData: PracticumCreate) {
    try {
      const result = await practicum.createPracticum(
        practicumData.name,
        practicumData.startDate,
        practicumData.endDate,
        practicumData.description,
        practicumData.requiredHours,
      );

      const practicumId = result.insertId;

      if (practicumData.instructors?.length) {
        await work_log_practicum_instructors.addInstructorsToPracticum(
          practicumData.instructors,
          practicumId,
        );
      }

      return result;
    } catch (error) {
      logger.error('Error in createPracticum:', error);
      throw error;
    }
  },

  async getPracticumDetails(practicumId: number): Promise<PracticumDetails> {
    try {
      const practicumDetails = await practicum.getPracticumById(practicumId);
      const entries = await work_log_entries.getWorkLogEntriesByPracticum(
        practicumId,
      );
      const instructors =
        await work_log_practicum_instructors.getInstructorsByPracticum(
          practicumId,
        );

      const formattedPracticum: PracticumData = {
        ...practicumDetails[0],
        start_date: practicumDetails[0].start_date.toISOString(),
        end_date: practicumDetails[0].end_date.toISOString(),
        created_at: practicumDetails[0].created_at?.toISOString(),
        instructor_name: instructors.map((i) => i.email).join(','),
      };

      return {
        practicum: formattedPracticum,
        entries,
      };
    } catch (error) {
      logger.error('Error in getPracticumDetails:', error);
      throw error;
    }
  },

  async updatePracticum(
    practicumId: number,
    updates: PracticumUpdate,
  ): Promise<ResultSetHeader> {
    try {
      const existingPracticum = await practicum.getPracticumById(practicumId);
      if (!existingPracticum?.length) {
        throw new Error('Practicum not found');
      }

      const practicumUpdateResult = await practicum.updatePracticum(
        practicumId,
        {
          name: updates.name,
          description: updates.description,
          start_date: updates.start_date,
          end_date: updates.end_date,
          required_hours: updates.required_hours,
        },
      );

      if (updates.instructors && updates.instructors.length > 0) {
        await work_log_practicum_instructors.removeAllPracticumInstructors(
          practicumId,
        );
        await work_log_practicum_instructors.addInstructorsToPracticum(
          updates.instructors.map((email) => ({email})),
          practicumId,
        );
      }

      return practicumUpdateResult;
    } catch (error) {
      logger.error('Error in updatePracticum:', error);
      throw error;
    }
  },

  async deletePracticum(practicumId: number): Promise<ResultSetHeader> {
    try {
      const result = await practicum.deletePracticum(practicumId);
      if (result.affectedRows === 0) {
        throw new Error('Practicum not found');
      }
      return result;
    } catch (error) {
      logger.error('Error in deletePracticum:', error);
      throw error;
    }
  },

  async getPracticumsByInstructor(userId: number): Promise<RowDataPacket[]> {
    try {
      return await work_log_practicum_instructors.getPracticumsByInstructor(
        userId,
      );
    } catch (error) {
      logger.error('Error in getPracticumsByInstructor:', error);
      throw error;
    }
  },

  async assignStudentToPracticum(practicumId: number, userId: number) {
    try {
      const result = await practicum.assignStudentToPracticum(
        practicumId,
        userId,
      );
      if (result.affectedRows === 0) {
        throw new Error('Failed to assign student to practicum');
      }
      return {success: true, message: 'Student assigned successfully'};
    } catch (error) {
      logger.error('Controller: Error assigning student to practicum:', error);
      throw error;
    }
  },

  async getPracticumByStudentEmail(email: string): Promise<PracticumData[]> {
    try {
      const practicums = await practicum.getPracticumByStudentEmail(email);
      return practicums.map((p) => ({
        ...p,
        start_date: p.start_date.toISOString(),
        end_date: p.end_date.toISOString(),
        created_at: p.created_at?.toISOString(),
      }));
    } catch (error) {
      logger.error('Error in getPracticumByStudentEmail:', error);
      throw error;
    }
  },
};

export default practicumController;
