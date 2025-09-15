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
      console.log("row 61, practicumcontroller.ts, creating practicum");

      const practicumId = result.insertId;

      if (practicumData.instructors?.length) {
        await work_log_practicum_instructors.addInstructorsToPracticum(
          practicumData.instructors,
          practicumId,
        );
        console.log("row 70, practicumcontroller.ts, adding instructors");
      }
      console.log("row 72, practicumcontroller.ts, returning result");
      return result;
    } catch (error) {
      console.log("row 75, practicumcontroller.ts, error in createPracticum");
      logger.error('Error in createPracticum:', error);
      throw error;
    }
  },

  async getPracticumDetails(practicumId: number): Promise<PracticumDetails> {
    try {
      const practicumDetails = await practicum.getPracticumById(practicumId);
      console.log("row 84, practicumcontroller.ts, getting practicum details");
      const entries = await work_log_entries.getWorkLogEntriesByPracticum(
        practicumId,
      );
      console.log("row 88, practicumcontroller.ts, getting entries");
      const instructors =
        await work_log_practicum_instructors.getInstructorsByPracticum(
          practicumId,
        );
      console.log("row 93, practicumcontroller.ts, getting instructors");

      const formattedPracticum: PracticumData = {
        ...practicumDetails[0],
        start_date: practicumDetails[0].start_date.toISOString(),
        end_date: practicumDetails[0].end_date.toISOString(),
        created_at: practicumDetails[0].created_at?.toISOString(),
        instructor_name: instructors.map((i) => i.email).join(','),
      };

      console.log("row 103, practicumcontroller.ts, returning formatted practicum and entries");
      return {
        practicum: formattedPracticum,
        entries,
      };
    } catch (error) {
      console.log("row 109, practicumcontroller.ts, error in getPracticumDetails");
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
      console.log("row 121, practicumcontroller.ts, searching existing practicum by id");
      if (!existingPracticum?.length) {
        console.log("row 123, practicumcontroller.ts, no existing practicum found");
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
      console.log("row 137, practicumcontroller.ts, updating practicum")

      if (updates.instructors && updates.instructors.length > 0) {
        await work_log_practicum_instructors.removeAllPracticumInstructors(
          practicumId,
        );
        console.log("row 143, practicumcontroller.ts, removing all instructors");
        await work_log_practicum_instructors.addInstructorsToPracticum(
          updates.instructors.map((email) => ({email})),
          practicumId,
        );
        console.log("row 148, practicumcontroller.ts, adding instructors");
      }

      console.log("row 151, practicumcontroller.ts, returning updated result");
      return practicumUpdateResult;
    } catch (error) {
      console.log("row 154, practicumcontroller.ts, error in updatePracticum");
      logger.error('Error in updatePracticum:', error);
      throw error;
    }
  },

  async deletePracticum(practicumId: number): Promise<ResultSetHeader> {
    try {
      const result = await practicum.deletePracticum(practicumId);
      console.log("row 163, practicumcontroller.ts, deleting practicum");
      if (result.affectedRows === 0) {
        console.log("row 165, practicumcontroller.ts, no practicum found");
        throw new Error('Practicum not found');
      }
      console.log("row 168, practicumcontroller.ts, returning result");
      return result;
    } catch (error) {
      console.log("row 171, practicumcontroller.ts, error in deletePracticum");
      logger.error('Error in deletePracticum:', error);
      throw error;
    }
  },

  async getPracticumsByInstructor(userId: number): Promise<RowDataPacket[]> {
    try {
      console.log("row 179, practicumcontroller.ts, getting practicums by instructor");
      return await work_log_practicum_instructors.getPracticumsByInstructor(
        userId,
      );
    } catch (error) {
      console.log("row 184, practicumcontroller.ts, error in getPracticumsByInstructor");
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
      console.log("row 196, practicumcontroller.ts, assigning student to practicum");
      if (result.affectedRows === 0) {
        console.log("row 198, practicumcontroller.ts, no practicum found");
        throw new Error('Failed to assign student to practicum');
      }
      console.log("row 201, practicumcontroller.ts, student assigned successfully and returning result");
      return {success: true, message: 'Student assigned successfully'};
    } catch (error) {
      console.log("row 204, practicumcontroller.ts, error in assignStudentToPracticum");
      logger.error('Controller: Error assigning student to practicum:', error);
      throw error;
    }
  },

  async getPracticumByStudentEmail(email: string): Promise<PracticumData[]> {
    try {
      const practicums = await practicum.getPracticumByStudentEmail(email);
      console.log("row 213, practicumcontroller.ts, getting practicums by student email");
      console.log("row 214, practicumcontroller.ts, returning practicums");
      return practicums.map((p) => ({
        ...p,
        start_date: p.start_date.toISOString(),
        end_date: p.end_date.toISOString(),
        created_at: p.created_at?.toISOString(),
      }));
    } catch (error) {
      console.log("row 221, practicumcontroller.ts, error in getPracticumByStudentEmail");
      logger.error('Error in getPracticumByStudentEmail:', error);
      throw error;
    }
  },

  async getAllPracticums(): Promise<PracticumData[]> {
    try {
      const practicums = await practicum.getAllPracticums();
      console.log("row 231, practicumcontroller.ts, getting all practicums");
      console.log("row 232, practicumcontroller.ts, returning practicums");
      return practicums.map((p) => ({
        ...p,
        start_date: p.start_date.toISOString(),
        end_date: p.end_date.toISOString(),
        created_at: p.created_at?.toISOString(),
      }));
    } catch (error) {
      console.log("row 240, practicumcontroller.ts, error in getAllPracticums");
      logger.error('Error in getAllPracticums:', error);
      throw error;
    }
  },
};

export default practicumController;
