import { ResultSetHeader, RowDataPacket } from 'mysql2';
import practicum from '../models/practicummodels.js';
import work_log_entries, { PracticumEntry } from '../models/work_log_entrymodel.js';
import work_log_practicum_instructors from '../models/work_log_practicum_instructormodel.js';
import logger from '../utils/logger.js';


//Types
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


// Helpers

// Normalize mysql Date fields to ISO strings for consistent API responses
const toISOPracticumRow = (p: any): PracticumData => ({
  ...p,
  start_date: p.start_date?.toISOString?.() ?? p.start_date,
  end_date: p.end_date?.toISOString?.() ?? p.end_date,
  created_at: p.created_at?.toISOString?.() ?? p.created_at,
});


 //Controller

const practicumController = {
  // Create a practicum and optionally attach instructors
  async createPracticum(practicumData: PracticumCreate) {
    try {
      console.log(`practicumcontroller.ts create practicum '${practicumData.name}'`);

      // Insert base practicum
      const result = await practicum.createPracticum(
        practicumData.name,
        practicumData.startDate,
        practicumData.endDate,
        practicumData.description,
        practicumData.requiredHours,
      );

      const practicumId = result.insertId;

      // Link instructors if provided
      if (practicumData.instructors?.length) {
        await work_log_practicum_instructors.addInstructorsToPracticum(
          practicumData.instructors,
          practicumId,
        );
        console.log(`practicumcontroller.ts added ${practicumData.instructors.length} instructors`);
      }

      return result;
    } catch (error) {
      console.log('practicumcontroller.ts error in createPracticum');
      logger.error('practicumcontroller.ts Error in createPracticum:', error);
      throw error;
    }
  },

  // Fetch practicum (single) + its entries + instructor list
  async getPracticumDetails(practicumId: number): Promise<PracticumDetails> {
    try {
      const practicumDetails = await practicum.getPracticumById(practicumId);
      const entries = await work_log_entries.getWorkLogEntriesByPracticum(practicumId);
      const instructors = await work_log_practicum_instructors.getInstructorsByPracticum(practicumId);

      // Combine base row, normalize dates, flatten instructor emails
      const formattedPracticum: PracticumData = {
        ...toISOPracticumRow(practicumDetails[0]),
        instructor_name: instructors.map((i) => i.email).join(','),
      };

      console.log(`practicumcontroller.ts fetched practicum ${practicumId}`);
      return { practicum: formattedPracticum, entries };
    } catch (error) {
      console.log('practicumcontroller.ts error in getPracticumDetails');
      logger.error('practicumcontroller.ts Error in getPracticumDetails:', error);
      throw error;
    }
  },

  // Update practicum fields, and optionally replace instructors
  async updatePracticum(
    practicumId: number,
    updates: PracticumUpdate,
  ): Promise<ResultSetHeader> {
    try {
      // Guard: practicum must exist
      const existingPracticum = await practicum.getPracticumById(practicumId);
      if (!existingPracticum?.length) {
        throw new Error('Practicum not found');
      }

      // Update base fields
      const practicumUpdateResult = await practicum.updatePracticum(practicumId, {
        name: updates.name,
        description: updates.description,
        start_date: updates.start_date,
        end_date: updates.end_date,
        required_hours: updates.required_hours,
      });

      // Replace instructors if provided (clear all -> add new)
      if (updates.instructors?.length) {
        await work_log_practicum_instructors.removeAllPracticumInstructors(practicumId);
        await work_log_practicum_instructors.addInstructorsToPracticum(
          updates.instructors.map((email) => ({ email })),
          practicumId,
        );
        console.log(`practicumcontroller.ts updated practicum ${practicumId} with ${updates.instructors.length} instructors`);
      } else {
        console.log(`practicumcontroller.ts updated practicum ${practicumId}`);
      }

      return practicumUpdateResult;
    } catch (error) {
      console.log('practicumcontroller.ts error in updatePracticum');
      logger.error('practicumcontroller.ts Error in updatePracticum:', error);
      throw error;
    }
  },

  // Delete practicum by ID
  async deletePracticum(practicumId: number): Promise<ResultSetHeader> {
    try {
      const result = await practicum.deletePracticum(practicumId);
      if (result.affectedRows === 0) {
        throw new Error('Practicum not found');
      }
      console.log(`practicumcontroller.ts deleted practicum ${practicumId}`);
      return result;
    } catch (error) {
      console.log('practicumcontroller.ts error in deletePracticum');
      logger.error('practicumcontroller.ts Error in deletePracticum:', error);
      throw error;
    }
  },

  // List practicums where a given instructor (userId) is assigned
  async getPracticumsByInstructor(userId: number): Promise<RowDataPacket[]> {
    try {
      return await work_log_practicum_instructors.getPracticumsByInstructor(userId);
    } catch (error) {
      console.log('practicumcontroller.ts error in getPracticumsByInstructor');
      logger.error('practicumcontroller.ts Error in getPracticumsByInstructor:', error);
      throw error;
    }
  },

  // Link a student (userId) to a practicum
  async assignStudentToPracticum(practicumId: number, userId: number) {
    try {
      const result = await practicum.assignStudentToPracticum(practicumId, userId);
      if (result.affectedRows === 0) {
        throw new Error('Failed to assign student to practicum');
      }
      console.log(`practicumcontroller.ts student ${userId} assigned to practicum ${practicumId}`);
      return { success: true, message: 'Student assigned successfully' };
    } catch (error) {
      console.log('practicumcontroller.ts error in assignStudentToPracticum');
      logger.error('practicumcontroller.ts Error assigning student to practicum:', error);
      throw error;
    }
  },

  // Get all practicums for a student by their email
  async getPracticumByStudentEmail(email: string): Promise<PracticumData[]> {
    try {
      const practicums = await practicum.getPracticumByStudentEmail(email);
      console.log(`practicumcontroller.ts fetched practicums for student ${email}`);
      return practicums.map(toISOPracticumRow);
    } catch (error) {
      console.log('practicumcontroller.ts error in getPracticumByStudentEmail');
      logger.error('practicumcontroller.ts Error in getPracticumByStudentEmail:', error);
      throw error;
    }
  },

  // Get all practicums (admin/teacher views, etc.)
  async getAllPracticums(): Promise<PracticumData[]> {
    try {
      const practicums = await practicum.getAllPracticums();
      console.log(`practicumcontroller.ts fetched all practicums (${practicums.length})`);
      return practicums.map(toISOPracticumRow);
    } catch (error) {
      console.log('practicumcontroller.ts error in getAllPracticums');
      logger.error('practicumcontroller.ts Error in getAllPracticums:', error);
      throw error;
    }
  },
};

export default practicumController;
